import type { PlanNode } from './plan'
import { locale, translate } from '../i18n'

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
  const integerFormatter = new Intl.NumberFormat(locale.value)
  const decimalFormatter = new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 })

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
        title: translate('heuristic.r01.title'),
        node,
        evidence: translate('heuristic.r01.evidence', {
          estimated: integerFormatter.format(node.metrics.estimatedRows),
          actual: integerFormatter.format(node.metrics.actualRows),
          error: decimalFormatter.format(qError),
        }),
        interpretation: translate('heuristic.r01.interpretation'),
        suggestion: {
          prefix: translate('heuristic.r01.prefix'),
          technicalTerm: translate('heuristic.r01.term'),
          suffix: translate('heuristic.r01.suffix'),
          explanation: translate('heuristic.r01.explanation'),
        },
        validation: translate('heuristic.r01.validation'),
        documentation: {
          label: translate('heuristic.r01.doc'),
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
        title: translate('heuristic.r02.title'),
        node,
        evidence: translate('heuristic.r02.evidence', {
          relation: node.relation ?? translate('heuristic.unknownRelation'),
          scanned: integerFormatter.format(scannedRows),
          discarded: integerFormatter.format(discardedRows),
          percentage: decimalFormatter.format(discardedPercentage),
        }),
        interpretation: translate('heuristic.r02.interpretation'),
        suggestion: {
          prefix: translate('heuristic.r02.prefix'),
          technicalTerm: translate('heuristic.r02.term'),
          suffix: translate('heuristic.r02.suffix'),
          explanation: translate('heuristic.r02.explanation'),
        },
        validation: translate('heuristic.r02.validation'),
        documentation: {
          label: translate('heuristic.r02.doc'),
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
        title: translate('heuristic.r03.title'),
        node,
        evidence: translate('heuristic.r03.evidence', {
          relation: node.relation ?? translate('heuristic.unknownRelation'),
          scanned: integerFormatter.format(scannedRows),
          discarded: integerFormatter.format(discardedRows),
          percentage: decimalFormatter.format(discardedPercentage),
        }),
        interpretation: translate('heuristic.r03.interpretation'),
        suggestion: {
          prefix: translate('heuristic.r03.prefix'),
          technicalTerm: translate('heuristic.r03.term'),
          suffix: translate('heuristic.r03.suffix'),
          explanation: translate('heuristic.r03.explanation'),
        },
        validation: translate('heuristic.r03.validation'),
        documentation: {
          label: translate('heuristic.r03.doc'),
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
        title: translate('heuristic.r04.title'),
        node,
        evidence: translate('heuristic.r04.evidence', {
          relation: node.relation ?? translate('heuristic.unknownRelation'),
          function: filterFunction,
          discarded: integerFormatter.format(discardedRows),
          scanned: integerFormatter.format(scannedRows),
        }),
        interpretation: translate('heuristic.r04.interpretation'),
        suggestion: {
          prefix: translate('heuristic.r04.prefix'),
          technicalTerm: translate('heuristic.r04.term'),
          suffix: translate('heuristic.r04.suffix', { function: filterFunction }),
          explanation: translate('heuristic.r04.explanation'),
        },
        validation: translate('heuristic.r04.validation'),
        documentation: {
          label: translate('heuristic.r04.doc'),
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
          title: translate('heuristic.r05.title'),
          node: sortNode,
          evidence: translate('heuristic.r05.evidence', {
            sorted: integerFormatter.format(sortedRows),
            limited: integerFormatter.format(limitedRows),
          }),
          interpretation: translate('heuristic.r05.interpretation'),
          suggestion: {
            prefix: translate('heuristic.r05.prefix'),
            technicalTerm: translate('heuristic.r05.term'),
            suffix: translate('heuristic.r05.suffix'),
            explanation: translate('heuristic.r05.explanation'),
          },
          validation: translate('heuristic.r05.validation'),
          documentation: {
            label: translate('heuristic.r05.doc'),
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
          title: translate('heuristic.r06.title'),
          node: innerNode,
          evidence: translate('heuristic.r06.evidence', {
            type: innerNode.type,
            loops: integerFormatter.format(innerNode.metrics.loops),
            time: decimalFormatter.format(innerTime),
          }),
          interpretation: translate('heuristic.r06.interpretation'),
          suggestion: {
            prefix: translate('heuristic.r06.prefix'),
            technicalTerm: translate('heuristic.r06.term'),
            suffix: translate('heuristic.r06.suffix'),
            explanation: translate('heuristic.r06.explanation'),
          },
          validation: translate('heuristic.r06.validation'),
          documentation: {
            label: translate('heuristic.r06.doc'),
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
