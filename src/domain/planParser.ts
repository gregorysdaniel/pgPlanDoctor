import type { ExplainPlan, PlanBuffers, PlanNode, PlanNodeKind } from './plan'
import { translate } from '../i18n'

type JsonObject = Record<string, unknown>

export class PlanParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlanParseError'
  }
}

export function parseExplainJson(source: string): ExplainPlan {
  let parsed: unknown

  try {
    parsed = JSON.parse(source)
  } catch {
    throw new PlanParseError(translate('parser.invalidJson'))
  }

  return parseExplainPlan(parsed)
}

export function parseExplainPlan(input: unknown): ExplainPlan {
  const document = unwrapPlan(input)
  const identifiers = new Map<string, number>()

  const plan: ExplainPlan = {
    // A primeira chamada converte a raiz; parseNode converte seus descendentes.
    root: parseNode(document.root, 'Plan', identifiers),
  }

  // Esses tempos pertencem ao documento completo, fora dos operadores da árvore.
  const planningTimeMs = optionalNumber(document.metadata, 'Planning Time', 'Plan')
  const executionTimeMs = optionalNumber(document.metadata, 'Execution Time', 'Plan')

  if (planningTimeMs !== undefined) plan.planningTimeMs = planningTimeMs
  if (executionTimeMs !== undefined) plan.executionTimeMs = executionTimeMs

  return plan
}

// Localiza a raiz nas formas aceitas: [{ Plan: ... }], { Plan: ... } ou o próprio nó.
function unwrapPlan(input: unknown): { root: JsonObject; metadata: JsonObject } {
  if (Array.isArray(input)) {
    if (input.length !== 1) {
      throw new PlanParseError(translate('parser.singlePlan'))
    }

    // Remove a camada do array e analisa novamente o conteúdo. Aceitamos um único plano.
    return unwrapPlan(input[0])
  }

  const object = requireObject(input, 'Plan')

  // No documento completo, `Plan` contém a raiz e o objeto externo contém os tempos gerais.
  if ('Plan' in object) return { root: requireObject(object.Plan, 'Plan'), metadata: object }

  // Um nó isolado também pode ser analisado, mas não fornece os metadados externos.
  if ('Node Type' in object) return { root: object, metadata: {} }

  throw new PlanParseError(translate('parser.missingPlan'))
}

/**
 * Converte um operador e, recursivamente, todos os seus filhos.
 * `rawNode` é o operador no formato do PostgreSQL.
 * `path` identifica sua posição no JSON (ex.: Plan.Plans[0]) para localizar erros.
 * `identifiers` é o mesmo mapa em todas as chamadas, evitando IDs repetidos no plano.
 */
function parseNode(
  rawNode: JsonObject,
  path: string,
  identifiers: Map<string, number>,
): PlanNode {
  // Campos opcionais variam conforme o operador: uma leitura pode ter tabela e índice,
  // enquanto uma ordenação pode ter `Sort Key`. Se presentes, seus tipos são validados.
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

  // Traduz os nomes do JSON para o modelo interno: `Actual Rows` → `actualRows`, por exemplo.
  // As métricas observadas são obrigatórias, por isso um EXPLAIN sem ANALYZE não basta.
  // Mantemos os valores originais; os totais com multiplicação por loops são calculados depois.
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

  // Só adiciona propriedades opcionais quando elas foram informadas no JSON.
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

  // Construção da árvore por busca em profundidade (DFS): cada filho é convertido
  // junto com seus descendentes antes de seguir para o próximo filho.
  // Ex.: Limit.Plans[Sort.Plans[Seq Scan]] vira Limit.children[Sort.children[Seq Scan]].
  // Sem `Plans` (ou com uma lista vazia), não há novas chamadas: esse nó é uma folha.
  if (rawChildren !== undefined) {
    node.children = rawChildren.map((child, index) =>
      parseNode(child, `${path}.Plans[${index}]`, identifiers),
    )
  }

  return node
}

// Valida uma métrica opcional e a copia para a chave correspondente do modelo interno.
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

// Agrupa os contadores de buffers; contadores não informados recebem zero no grupo.
function parseBuffers(object: JsonObject, path: string): PlanBuffers | undefined {
  const values = {
    sharedHit: optionalNumber(object, 'Shared Hit Blocks', path) ?? 0,
    sharedRead: optionalNumber(object, 'Shared Read Blocks', path) ?? 0,
    sharedDirtied: optionalNumber(object, 'Shared Dirtied Blocks', path) ?? 0,
    sharedWritten: optionalNumber(object, 'Shared Written Blocks', path) ?? 0,
    tempRead: optionalNumber(object, 'Temp Read Blocks', path) ?? 0,
    tempWritten: optionalNumber(object, 'Temp Written Blocks', path) ?? 0,
  }

  // Ausência de todos os campos significa "buffers não informados".
  // Um campo explicitamente igual a zero também conta como informado, permitindo exibir a aba.
  const hasBufferMetrics = [
    'Shared Hit Blocks', 'Shared Read Blocks', 'Shared Dirtied Blocks',
    'Shared Written Blocks', 'Temp Read Blocks', 'Temp Written Blocks',
  ].some(key => object[key] !== undefined)
  return hasBufferMetrics ? values : undefined
}

// Agrupa operadores por nome; tipos que não se encaixam nos grupos usam `operation`.
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

// Gera a descrição no idioma atual a partir do nó, inclusive após trocar o idioma da interface.
export function describePlanNode(node: PlanNode): string {
  return describeNode(node.type, node.relation, node.indexName, node.filter, node.sortKeys)
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
        ? translate('node.seqScanFiltered', {
            relation: relation ?? translate('node.unknownRelation'),
            filter,
          })
        : translate('node.seqScan', { relation: relation ?? translate('node.unknownRelation') })
    case 'Index Scan':
    case 'Index Only Scan':
      return translate('node.indexScan', {
        index: indexName ?? translate('node.unknownIndex'),
        relation: relation ?? translate('node.unknownTable'),
      })
    case 'Sort':
      return sortKeys?.length
        ? translate('node.sortKeys', { keys: sortKeys.join(', ') })
        : translate('node.sort')
    case 'Limit':
      return translate('node.limit')
    case 'Nested Loop':
      return translate('node.nestedLoop')
    case 'Hash Join':
      return translate('node.hashJoin')
    case 'Merge Join':
      return translate('node.mergeJoin')
    case 'Aggregate':
      return translate('node.aggregate')
    default:
      return translate('node.default', { type })
  }
}

// Normaliza o nome e numera suas ocorrências: "Seq Scan" → "seq-scan-1", "seq-scan-2".
// Esses IDs permitem associar seleção e achados das heurísticas ao operador correspondente.
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

// Os validadores abaixo verificam os dados em tempo de execução: interfaces TypeScript
// não garantem que um JSON fornecido pelo usuário tenha os campos e tipos esperados.
// `require...` exige o campo; `optional...` aceita ausência, mas rejeita um valor inválido.
function requireObject(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new PlanParseError(translate('parser.object', { path }))
  }

  return value as JsonObject
}

function requireString(object: JsonObject, key: string, path: string): string {
  const value = object[key]

  if (typeof value !== 'string' || value.length === 0) {
    throw new PlanParseError(translate('parser.nonEmptyText', { path, key }))
  }

  return value
}

function optionalString(object: JsonObject, key: string, path: string): string | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  if (typeof value !== 'string') {
    throw new PlanParseError(translate('parser.text', { path, key }))
  }

  return value
}

function requireNumber(object: JsonObject, key: string, path: string): number {
  const value = optionalNumber(object, key, path)

  if (value === undefined) {
    throw new PlanParseError(translate('parser.requiredMetric', { path, key }))
  }

  return value
}

function optionalNumber(object: JsonObject, key: string, path: string): number | undefined {
  const value = object[key]
  if (value === undefined) return undefined

  // Zero é válido. Não convertemos textos como "10" em números nem aceitamos negativos.
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new PlanParseError(translate('parser.nonNegativeNumber', { path, key }))
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
    throw new PlanParseError(translate('parser.stringArray', { path, key }))
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
    throw new PlanParseError(translate('parser.objectArray', { path, key }))
  }

  // Antes da recursão, garante que cada filho seja um objeto e identifica seu índice nos erros.
  return value.map((item, index) => requireObject(item, `${path}.${key}[${index}]`))
}
