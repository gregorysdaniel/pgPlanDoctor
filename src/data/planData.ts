import explainAnalyzeExample from './explainAnalyzeExample.json'
import repeatedWorkExample from './repeatedWorkExample.json'
import rowEstimateExample from './rowEstimateExample.json'

export interface PlanExample {
  id: string
  title: string
  description: string
  source: string
}

export const planExamples: PlanExample[] = [
  {
    id: 'selective-filter-sort-limit',
    title: 'Filtro seletivo e ordenação com limite',
    description: 'Examina descarte de linhas, ordenação e LIMIT em um plano pequeno.',
    source: JSON.stringify(explainAnalyzeExample, null, 2),
  },
  {
    id: 'row-estimate-divergence',
    title: 'Estimativa de linhas divergente',
    description: 'Compara a estimativa do planner com as linhas observadas na execução.',
    source: JSON.stringify(rowEstimateExample, null, 2),
  },
  {
    id: 'repeated-inner-work',
    title: 'Trabalho interno repetido',
    description: 'Mostra um ramo interno executado várias vezes em uma junção.',
    source: JSON.stringify(repeatedWorkExample, null, 2),
  },
]
