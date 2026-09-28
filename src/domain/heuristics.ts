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

const MINIMUM_DISCARDED_ROWS = 1_000
const MINIMUM_DISCARDED_PERCENTAGE = 80
const integerFormatter = new Intl.NumberFormat('pt-BR')

export function evaluatePlan(plan: PlanNode): HeuristicTip[] {
  const tips: HeuristicTip[] = []

  function visit(node: PlanNode): void {
    const discardedRows = (node.metrics.rowsRemovedByFilter ?? 0) * node.metrics.loops
    const returnedRows = node.metrics.actualRows * node.metrics.loops
    const scannedRows = discardedRows + returnedRows
    const discardedPercentage = scannedRows === 0 ? 0 : (discardedRows / scannedRows) * 100

    if (
      node.type === 'Seq Scan' &&
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
            ' nas colunas usadas pelo filtro e pela ordenação pode reduzir a leitura e, dependendo do índice, evitar o Sort.',
          explanation:
            'É uma estrutura auxiliar que ajuda o PostgreSQL a localizar linhas sem percorrer toda a tabela. Ela ocupa espaço e adiciona custo às escritas.',
        },
        validation:
          'Compare o EXPLAIN ANALYZE antes e depois da alteração. Verifique o tempo de execução, as linhas descartadas e se o plano deixou de usar Seq Scan ou Sort.',
        documentation: {
          label: 'Documentação do PostgreSQL sobre índices',
          url: 'https://www.postgresql.org/docs/current/indexes-intro.html',
        },
      })
    }

    node.children?.forEach(visit)
  }

  visit(plan)
  return tips
}
