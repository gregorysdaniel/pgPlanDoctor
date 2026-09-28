import type { PlanNode } from '../domain/plan'

export const planData: PlanNode = {
  id: 'limit-1',
  type: 'Limit',
  kind: 'control',
  description: 'Entrega somente as 10 primeiras linhas do resultado ordenado.',
  metrics: {
    estimatedRows: 10,
    actualRows: 10,
    loops: 1,
    totalTimeMs: 1.279,
  },
  children: [
    {
      id: 'sort-1',
      type: 'Sort',
      kind: 'operation',
      description: 'Ordena os pedidos mais recentes pela coluna created_at.',
      metrics: {
        estimatedRows: 87,
        actualRows: 10,
        loops: 1,
        totalTimeMs: 1.275,
      },
      children: [
        {
          id: 'seq-scan-1',
          type: 'Seq Scan',
          kind: 'scan',
          relation: 'orders',
          filter: 'customer_id = 42',
          description: 'Percorre a tabela orders e mantém apenas as linhas de customer_id = 42.',
          metrics: {
            estimatedRows: 87,
            actualRows: 87,
            rowsRemovedByFilter: 4913,
            loops: 1,
            totalTimeMs: 1.183,
          },
        },
      ],
    },
  ],
}

export const explainAnalyzeOutput = `Limit  (cost=94.14..94.17 rows=10 width=16) (actual time=1.275..1.279 rows=10 loops=1)
  ->  Sort  (cost=94.14..94.36 rows=87 width=16) (actual time=1.273..1.275 rows=10 loops=1)
        Sort Key: created_at DESC
        Sort Method: top-N heapsort  Memory: 25kB
        ->  Seq Scan on orders  (cost=0.00..92.25 rows=87 width=16) (actual time=0.021..1.183 rows=87 loops=1)
              Filter: (customer_id = 42)
              Rows Removed by Filter: 4913
Planning Time: 0.118 ms
Execution Time: 1.342 ms`
