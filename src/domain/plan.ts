export type PlanNodeKind = 'control' | 'join' | 'operation' | 'scan'

export interface PlanBuffers {
  sharedHit: number
  sharedRead: number
  sharedDirtied: number
  sharedWritten: number
  tempRead: number
  tempWritten: number
}

export interface PlanMetrics {
  estimatedRows: number
  actualRows: number
  rowsRemovedByFilter?: number
  loops: number
  startupTimeMs?: number
  totalTimeMs: number
  startupCost?: number
  totalCost?: number
  planWidth?: number
  buffers?: PlanBuffers
}

export interface PlanNode {
  id: string
  type: string
  kind: PlanNodeKind
  relation?: string
  indexName?: string
  filter?: string
  indexCondition?: string
  recheckCondition?: string
  hashCondition?: string
  mergeCondition?: string
  joinFilter?: string
  joinType?: string
  sortKeys?: string[]
  output?: string[]
  description: string
  metrics: PlanMetrics
  children?: PlanNode[]
}

export interface ExplainPlan {
  root: PlanNode
  planningTimeMs?: number
  executionTimeMs?: number
}
