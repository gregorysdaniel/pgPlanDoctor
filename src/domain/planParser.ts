import type { ExplainPlan, PlanBuffers, PlanNode, PlanNodeKind } from './plan'

type JsonObject = Record<string, unknown>

export class PlanParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlanParseError'
  }
}

// Converte o texto completo produzido por EXPLAIN (ANALYZE, FORMAT JSON).
export function parseExplainJson(source: string): ExplainPlan {
  let parsed: unknown

  try {
    parsed = JSON.parse(source)
  } catch {
    throw new PlanParseError('O conteúdo informado não é um JSON válido.')
  }

  return parseExplainPlan(parsed)
}

// Aceita tanto o documento completo do EXPLAIN quanto o objeto interno de Plan.
export function parseExplainPlan(input: unknown): ExplainPlan {
  const document = unwrapPlan(input)
  const identifiers = new Map<string, number>()

  const plan: ExplainPlan = {
    root: parseNode(document.root, 'Plan', identifiers),
  }

  const planningTimeMs = optionalNumber(document.metadata, 'Planning Time', 'Plano')
  const executionTimeMs = optionalNumber(document.metadata, 'Execution Time', 'Plano')

  if (planningTimeMs !== undefined) plan.planningTimeMs = planningTimeMs
  if (executionTimeMs !== undefined) plan.executionTimeMs = executionTimeMs

  return plan
}

function unwrapPlan(input: unknown): { root: JsonObject; metadata: JsonObject } {
  if (Array.isArray(input)) {
    if (input.length !== 1) {
      throw new PlanParseError('O JSON deve conter exatamente um plano de execução.')
    }

    return unwrapPlan(input[0])
  }

  const object = requireObject(input, 'Plano')

  if ('Plan' in object) return { root: requireObject(object.Plan, 'Plan'), metadata: object }

  if ('Node Type' in object) return { root: object, metadata: {} }

  throw new PlanParseError('O JSON não contém as propriedades "Plan" ou "Node Type".')
}

function parseNode(
  rawNode: JsonObject,
  path: string,
  identifiers: Map<string, number>,
): PlanNode {
  const type = requireString(rawNode, 'Node Type', path)
  const relation = optionalString(rawNode, 'Relation Name', path)
  const indexName = optionalString(rawNode, 'Index Name', path)
  const filter = optionalString(rawNode, 'Filter', path)
  const indexCondition = optionalString(rawNode, 'Index Cond', path)
  const recheckCondition = optionalString(rawNode, 'Recheck Cond', path)
  const hashCondition = optionalString(rawNode, 'Hash Cond', path)
  const mergeCondition = optionalString(rawNode, 'Merge Cond', path)
  const joinFilter = optionalString(rawNode, 'Join Filter', path)
  const joinType = optionalString(rawNode, 'Join Type', path)
  const sortKeys = optionalStringArray(rawNode, 'Sort Key', path)
  const output = optionalStringArray(rawNode, 'Output', path)
  const rawChildren = optionalObjectArray(rawNode, 'Plans', path)

  const node: PlanNode = {
    id: nextIdentifier(type, identifiers),
    type,
    kind: classifyNode(type),
    description: describeNode(type, relation, indexName, filter, sortKeys),
    metrics: {
      estimatedRows: requireNumber(rawNode, 'Plan Rows', path),
      actualRows: requireNumber(rawNode, 'Actual Rows', path),
      loops: requireNumber(rawNode, 'Actual Loops', path),
      totalTimeMs: requireNumber(rawNode, 'Actual Total Time', path),
    },
  }

  if (relation !== undefined) node.relation = relation
  if (indexName !== undefined) node.indexName = indexName
  if (filter !== undefined) node.filter = filter
  if (indexCondition !== undefined) node.indexCondition = indexCondition
  if (recheckCondition !== undefined) node.recheckCondition = recheckCondition
  if (hashCondition !== undefined) node.hashCondition = hashCondition
  if (mergeCondition !== undefined) node.mergeCondition = mergeCondition
  if (joinFilter !== undefined) node.joinFilter = joinFilter
  if (joinType !== undefined) node.joinType = joinType
  if (sortKeys !== undefined) node.sortKeys = sortKeys
  if (output !== undefined) node.output = output

  assignOptionalMetric(node.metrics, 'startupTimeMs', rawNode, 'Actual Startup Time', path)
  assignOptionalMetric(node.metrics, 'startupCost', rawNode, 'Startup Cost', path)
  assignOptionalMetric(node.metrics, 'totalCost', rawNode, 'Total Cost', path)
  assignOptionalMetric(node.metrics, 'planWidth', rawNode, 'Plan Width', path)

  const buffers = parseBuffers(rawNode, path)
  if (buffers !== undefined) node.metrics.buffers = buffers

  const rowsRemovedByFilter = optionalNumber(rawNode, 'Rows Removed by Filter', path)
  if (rowsRemovedByFilter !== undefined) {
    node.metrics.rowsRemovedByFilter = rowsRemovedByFilter
  }

  if (rawChildren !== undefined) {
    node.children = rawChildren.map((child, index) =>
      parseNode(child, `${path}.Plans[${index}]`, identifiers),
    )
  }

  return node
}

function assignOptionalMetric(
  metrics: PlanNode['metrics'],
  key: 'startupTimeMs' | 'startupCost' | 'totalCost' | 'planWidth',
  object: JsonObject,
  sourceKey: string,
  path: string,
): void {
  const value = optionalNumber(object, sourceKey, path)
  if (value !== undefined) metrics[key] = value
}

function parseBuffers(object: JsonObject, path: string): PlanBuffers | undefined {
  const values = {
    sharedHit: optionalNumber(object, 'Shared Hit Blocks', path) ?? 0,
    sharedRead: optionalNumber(object, 'Shared Read Blocks', path) ?? 0,
    sharedDirtied: optionalNumber(object, 'Shared Dirtied Blocks', path) ?? 0,
    sharedWritten: optionalNumber(object, 'Shared Written Blocks', path) ?? 0,
    tempRead: optionalNumber(object, 'Temp Read Blocks', path) ?? 0,
    tempWritten: optionalNumber(object, 'Temp Written Blocks', path) ?? 0,
  }

  return Object.values(values).some((value) => value > 0) ? values : undefined
}

function classifyNode(type: string): PlanNodeKind {
  if (type === 'Nested Loop' || type.endsWith(' Join')) return 'join'
  if (type.endsWith(' Scan')) return 'scan'

  if (
    type === 'Limit' ||
    type === 'Result' ||
    type === 'Append' ||
    type === 'Merge Append' ||
    type === 'Recursive Union'
  ) {
    return 'control'
  }

  return 'operation'
}

function describeNode(
  type: string,
  relation?: string,
  indexName?: string,
  filter?: string,
  sortKeys?: string[],
): string {
  switch (type) {
    case 'Seq Scan':
      return filter
        ? `Percorre a tabela ${relation ?? 'informada'} e aplica o filtro ${filter}.`
        : `Percorre todas as linhas da tabela ${relation ?? 'informada'}.`
    case 'Index Scan':
    case 'Index Only Scan':
      return `Usa o índice ${indexName ?? 'informado'} para buscar linhas em ${relation ?? 'uma tabela'}.`
    case 'Sort':
      return sortKeys?.length
        ? `Ordena as linhas por ${sortKeys.join(', ')}.`
        : 'Ordena as linhas recebidas.'
    case 'Limit':
      return 'Entrega somente a quantidade de linhas solicitada pela consulta.'
    case 'Nested Loop':
      return 'Para cada linha do primeiro ramo, procura correspondências no segundo ramo.'
    case 'Hash Join':
      return 'Relaciona os dois ramos usando uma tabela de busca em memória.'
    case 'Merge Join':
      return 'Relaciona dois conjuntos de linhas que estão ordenados.'
    case 'Aggregate':
      return 'Agrupa ou resume as linhas recebidas.'
    default:
      return `Executa a operação ${type}.`
  }
}

function nextIdentifier(type: string, identifiers: Map<string, number>): string {
  const prefix = type
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'node'
  const next = (identifiers.get(prefix) ?? 0) + 1

  identifiers.set(prefix, next)
  return `${prefix}-${next}`
}

function requireObject(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new PlanParseError(`${path} deve ser um objeto.`)
  }

  return value as JsonObject
}

function requireString(object: JsonObject, key: string, path: string): string {
  const value = object[key]

  if (typeof value !== 'string' || value.length === 0) {
    throw new PlanParseError(`${path}.${key} deve ser um texto não vazio.`)
  }

  return value
}

function optionalString(object: JsonObject, key: string, path: string): string | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  if (typeof value !== 'string') {
    throw new PlanParseError(`${path}.${key} deve ser um texto.`)
  }

  return value
}

function requireNumber(object: JsonObject, key: string, path: string): number {
  const value = optionalNumber(object, key, path)

  if (value === undefined) {
    throw new PlanParseError(
      `${path}.${key} é obrigatório. Use EXPLAIN (ANALYZE, FORMAT JSON).`,
    )
  }

  return value
}

function optionalNumber(object: JsonObject, key: string, path: string): number | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new PlanParseError(`${path}.${key} deve ser um número maior ou igual a zero.`)
  }

  return value
}

function optionalStringArray(
  object: JsonObject,
  key: string,
  path: string,
): string[] | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new PlanParseError(`${path}.${key} deve ser uma lista de textos.`)
  }

  return value
}

function optionalObjectArray(
  object: JsonObject,
  key: string,
  path: string,
): JsonObject[] | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  if (!Array.isArray(value)) {
    throw new PlanParseError(`${path}.${key} deve ser uma lista.`)
  }

  return value.map((item, index) => requireObject(item, `${path}.${key}[${index}]`))
}
