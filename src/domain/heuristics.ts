import type { PlanNode } from './plan'

export interface HeuristicTip {
  id: string
  title: string
  node: PlanNode
  evidence: string
  interpretation: string
  suggestion: {
    prefix: string
    technicalTerm: string
    suffix: string
    explanation: string
  }
  validation: string
  documentation: {
    label: string
    url: string
  }
}

const MINIMUM_Q_ERROR = 10
const MINIMUM_DISCARDED_ROWS = 1_000
const MINIMUM_DISCARDED_PERCENTAGE = 80
const MINIMUM_SORTED_ROWS = 1_000
const MINIMUM_SORT_TO_LIMIT_RATIO = 10
const MINIMUM_INNER_LOOPS = 10
const MINIMUM_INNER_TIME_MS = 10

const integerFormatter = new Intl.NumberFormat('pt-BR')
const decimalFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const functionInFilterPattern = /\b(lower|upper|date_trunc|coalesce|substring|trim)\s*\(/i

function accumulatedRows(node: PlanNode): number {
  return node.metrics.actualRows * node.metrics.loops
}

function accumulatedTime(node: PlanNode): number {
  return node.metrics.totalTimeMs * node.metrics.loops
}

// O q-error mostra quantas vezes a estimativa ficou acima ou abaixo da quantidade real.
function calculateQError(estimatedRows: number, actualRows: number): number {
  // Usar 1 no lugar de zero evita divisão por zero sem alterar os demais valores.
  const safeEstimatedRows = Math.max(estimatedRows, 1)
  const safeActualRows = Math.max(actualRows, 1)

  return Math.max(
    safeEstimatedRows / safeActualRows,
    safeActualRows / safeEstimatedRows,
  )
}

function getFilterFunction(node: PlanNode): string | null {
  return node.filter?.match(functionInFilterPattern)?.[1]?.toLowerCase() ?? null
}

export function evaluatePlan(plan: PlanNode): HeuristicTip[] {
  const tips: HeuristicTip[] = []

  function visit(node: PlanNode): void {
    const discardedRows = (node.metrics.rowsRemovedByFilter ?? 0) * node.metrics.loops
    const returnedRows = accumulatedRows(node)
    const scannedRows = discardedRows + returnedRows
    const discardedPercentage = scannedRows === 0 ? 0 : (discardedRows / scannedRows) * 100
    const filterFunction = getFilterFunction(node)
    const qError = calculateQError(node.metrics.estimatedRows, node.metrics.actualRows)

    // R01: avisa quando o PostgreSQL previu uma quantidade de linhas muito diferente da real.
    // A regra é aplicada quando o q-error é 10 ou mais, ou seja, quando a previsão ficou pelo menos
    // 10 vezes acima ou abaixo da quantidade real.
    if (qError >= MINIMUM_Q_ERROR) {
      tips.push({
        id: `row-estimate-divergence-${node.id}`,
        title: 'Estimativa de linhas distante da realidade',
        node,
        evidence: `O nó estimou ${integerFormatter.format(node.metrics.estimatedRows)} linhas por execução, mas produziu ${integerFormatter.format(node.metrics.actualRows)}. A diferença é de aproximadamente ${decimalFormatter.format(qError)} vezes.`,
        interpretation:
          'O planner tomou a decisão usando uma previsão diferente do que aconteceu na execução. Isso pode influenciar a escolha dos scans, das junções e da ordem das operações.',
        suggestion: {
          prefix: 'Investigue um ',
          technicalTerm: 'ajuste de estatísticas',
          suffix:
            ' da tabela e, quando houver colunas relacionadas, avalie estatísticas estendidas.',
          explanation:
            'É a atualização das informações que o PostgreSQL usa para estimar quantas linhas cada operação deve encontrar. Normalmente começa com o comando ANALYZE.',
        },
        validation:
          'Atualize ou amplie as estatísticas e gere o plano novamente. Compare as linhas estimadas e reais no mesmo nó e verifique se a mudança também afetou o plano.',
        documentation: {
          label: 'Documentação do PostgreSQL sobre estatísticas do planner',
          url: 'https://www.postgresql.org/docs/current/planner-stats.html',
        },
      })
    }

    // R02: encontra uma leitura completa que joga fora quase todas as linhas encontradas.
    // A regra é aplicada quando um Seq Scan descarta ao menos 1.000 linhas e 80% do que examinou.
    // Consideramos 80% como a maioria clara das linhas lidas sendo descartada pelo filtro.
    if (
      node.type === 'Seq Scan' &&
      filterFunction === null &&
      discardedRows >= MINIMUM_DISCARDED_ROWS &&
      discardedPercentage >= MINIMUM_DISCARDED_PERCENTAGE
    ) {
      tips.push({
        id: `seq-scan-discards-rows-${node.id}`,
        title: 'Muitas linhas descartadas',
        node,
        evidence: `O Seq Scan em ${node.relation ?? 'uma relação'} leu aproximadamente ${integerFormatter.format(scannedRows)} linhas e descartou ${integerFormatter.format(discardedRows)} (${discardedPercentage.toFixed(1)}%).`,
        interpretation:
          'O filtro retorna uma parcela pequena das linhas examinadas. A leitura completa da tabela pode se tornar relevante conforme ela crescer.',
        suggestion: {
          prefix: 'Avalie se um ',
          technicalTerm: 'índice',
          suffix:
            ' nas colunas usadas pelo filtro pode reduzir a quantidade de linhas examinadas.',
          explanation:
            'É uma estrutura auxiliar que ajuda o PostgreSQL a localizar linhas sem percorrer toda a tabela. Ela ocupa espaço e adiciona custo às escritas.',
        },
        validation:
          'Compare o EXPLAIN ANALYZE antes e depois da alteração. Verifique o tempo, os buffers, as linhas descartadas e o tipo de scan escolhido.',
        documentation: {
          label: 'Documentação do PostgreSQL sobre índices',
          url: 'https://www.postgresql.org/docs/current/indexes-intro.html',
        },
      })
    }

    // R03: detecta quando um índice encontra muitos candidatos, mas o filtro descarta quase todos.
    // A regra é aplicada quando um Index Scan ainda descarta ao menos 1.000 linhas e 80% dos candidatos.
    // Isso indica que o índice ajuda na busca inicial, mas deixa a maior parte do filtro para depois.
    if (
      node.type === 'Index Scan' &&
      discardedRows >= MINIMUM_DISCARDED_ROWS &&
      discardedPercentage >= MINIMUM_DISCARDED_PERCENTAGE
    ) {
      tips.push({
        id: `index-scan-discards-rows-${node.id}`,
        title: 'Índice ainda encontra muitos candidatos',
        node,
        evidence: `O Index Scan em ${node.relation ?? 'uma relação'} examinou aproximadamente ${integerFormatter.format(scannedRows)} linhas e descartou ${integerFormatter.format(discardedRows)} (${discardedPercentage.toFixed(1)}%) no filtro.`,
        interpretation:
          'O índice ajuda em uma parte da busca, mas outra condição ainda é aplicada depois e elimina muitos resultados.',
        suggestion: {
          prefix: 'Avalie se um ',
          technicalTerm: 'índice composto',
          suffix: ' compatível com as condições da consulta pode filtrar melhor os candidatos.',
          explanation:
            'É um índice formado por mais de uma coluna. A ordem dessas colunas deve acompanhar a forma como a consulta filtra os dados.',
        },
        validation:
          'Compare os planos antes e depois. Verifique se mais condições aparecem no Index Cond, se diminuem as linhas descartadas e como variam tempo e buffers.',
        documentation: {
          label: 'Documentação do PostgreSQL sobre índices multicoluna',
          url: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
        },
      })
    }

    // R04: procura uma função no filtro que pode impedir o uso de um índice comum da coluna.
    // A regra é aplicada quando um Seq Scan usa uma função conhecida, como lower(...), e descarta
    // ao menos 1.000 linhas e 80% do total examinado.
    if (
      node.type === 'Seq Scan' &&
      filterFunction !== null &&
      discardedRows >= MINIMUM_DISCARDED_ROWS &&
      discardedPercentage >= MINIMUM_DISCARDED_PERCENTAGE
    ) {
      tips.push({
        id: `function-filter-wide-scan-${node.id}`,
        title: 'Função aplicada durante uma leitura ampla',
        node,
        evidence: `O Seq Scan em ${node.relation ?? 'uma relação'} usa ${filterFunction}(...) no filtro e descarta ${integerFormatter.format(discardedRows)} de aproximadamente ${integerFormatter.format(scannedRows)} linhas examinadas.`,
        interpretation:
          'Um índice comum na coluna pode não atender a uma busca feita sobre o resultado da função.',
        suggestion: {
          prefix: 'Avalie se um ',
          technicalTerm: 'índice de expressão',
          suffix: ` compatível com ${filterFunction}(...) pode evitar a leitura ampla sem mudar o resultado da consulta.`,
          explanation:
            'É um índice criado sobre o resultado de uma expressão, como lower(email), em vez de usar somente o valor original da coluna.',
        },
        validation:
          'Crie o índice apenas no cenário de teste e gere o plano novamente. Verifique o tipo de scan, as linhas descartadas, o tempo e os buffers.',
        documentation: {
          label: 'Documentação do PostgreSQL sobre índices de expressão',
          url: 'https://www.postgresql.org/docs/current/indexes-expressional.html',
        },
      })
    }

    // R05: identifica quando muitas linhas são ordenadas para entregar apenas uma pequena parte delas.
    // A regra é aplicada quando um Limit recebe um Sort que ordenou ao menos 1.000 linhas e dez vezes mais
    // linhas do que o resultado final precisa entregar.
    if (node.type === 'Limit') {
      const sortNode = node.children?.find((child) => child.type === 'Sort')
      const sortedRows =
        sortNode?.children?.reduce((total, child) => total + accumulatedRows(child), 0) ?? 0
      const limitedRows = returnedRows

      if (
        sortNode !== undefined &&
        sortedRows >= MINIMUM_SORTED_ROWS &&
        sortedRows >= limitedRows * MINIMUM_SORT_TO_LIMIT_RATIO
      ) {
        tips.push({
          id: `wide-sort-before-limit-${node.id}`,
          title: 'Muitas linhas ordenadas para um resultado pequeno',
          node: sortNode,
          evidence: `O Sort recebeu aproximadamente ${integerFormatter.format(sortedRows)} linhas para o Limit entregar ${integerFormatter.format(limitedRows)}.`,
          interpretation:
            'A consulta organiza um conjunto muito maior do que o resultado final. Em alguns casos, o PostgreSQL pode ler os dados já na ordem necessária e parar mais cedo.',
          suggestion: {
            prefix: 'Avalie se um ',
            technicalTerm: 'índice para ordenação',
            suffix: ' compatível com o filtro e o ORDER BY pode evitar ou reduzir o trabalho do Sort.',
            explanation:
              'É um índice cujas colunas e direções acompanham a ordem pedida pela consulta, permitindo ler primeiro as linhas desejadas.',
          },
          validation:
            'Compare os planos com a mesma consulta e o mesmo LIMIT. Verifique se o Sort desapareceu, quantas linhas foram lidas e como variam tempo e buffers.',
          documentation: {
            label: 'Documentação do PostgreSQL sobre índices e ORDER BY',
            url: 'https://www.postgresql.org/docs/current/indexes-ordering.html',
          },
        })
      }
    }

    // R06: avisa quando o lado interno de um Nested Loop repete um trabalho relevante muitas vezes.
    // A regra é aplicada quando esse ramo é executado ao menos 10 vezes e seu tempo
    // acumulado chega a 10 ms, mostrando que a repetição já produz trabalho relevante.
    if (node.type === 'Nested Loop' && node.children && node.children.length >= 2) {
      const innerNode = node.children[1]
      const innerTime = accumulatedTime(innerNode)

      if (innerNode.metrics.loops >= MINIMUM_INNER_LOOPS && innerTime >= MINIMUM_INNER_TIME_MS) {
        tips.push({
          id: `repeated-inner-lookup-${node.id}`,
          title: 'Busca interna repetida muitas vezes',
          node: innerNode,
          evidence: `O ramo interno ${innerNode.type} foi executado ${integerFormatter.format(innerNode.metrics.loops)} vezes e acumulou aproximadamente ${decimalFormatter.format(innerTime)} ms.`,
          interpretation:
            'Cada linha do lado externo dispara uma nova busca no lado interno. Mesmo uma busca curta pode se tornar cara quando é repetida muitas vezes.',
          suggestion: {
            prefix: 'Avalie se um ',
            technicalTerm: 'índice para junção',
            suffix: ' pode tornar cada busca interna mais direta.',
            explanation:
              'É um índice criado nas colunas usadas para relacionar as tabelas, ajudando o PostgreSQL a localizar as correspondências de cada linha.',
          },
          validation:
            'Compare o EXPLAIN ANALYZE antes e depois. Multiplique as métricas pelos loops e observe também se Memoize ou Materialize já reaproveitam resultados.',
          documentation: {
            label: 'Documentação do PostgreSQL sobre leitura de planos',
            url: 'https://www.postgresql.org/docs/current/using-explain.html',
          },
        })
      }
    }

    node.children?.forEach(visit)
  }

  visit(plan)
  return tips
}
