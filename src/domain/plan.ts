export type PlanNodeKind = 'control' | 'join' | 'operation' | 'scan'

export interface PlanMetrics {
  estimatedRows: number
  actualRows: number
  rowsRemovedByFilter?: number
  loops: number
  totalTimeMs: number
}

export interface PlanNode {
  id: string
  type: string
  kind: PlanNodeKind
  relation?: string
  filter?: string
  description: string
  metrics: PlanMetrics
  children?: PlanNode[]
}
