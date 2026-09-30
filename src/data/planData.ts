import explainAnalyzeExample from './explainAnalyzeExample.json'
import repeatedWorkExample from './repeatedWorkExample.json'
import rowEstimateExample from './rowEstimateExample.json'
import { translate } from '../i18n'

export interface PlanExample {
  id: string
  title: string
  description: string
  source: string
}

export function getPlanExamples(): PlanExample[] {
  return [
    {
      id: 'selective-filter-sort-limit',
      title: translate('example.selective.title'),
      description: translate('example.selective.description'),
      source: JSON.stringify(explainAnalyzeExample, null, 2),
    },
    {
      id: 'row-estimate-divergence',
      title: translate('example.estimate.title'),
      description: translate('example.estimate.description'),
      source: JSON.stringify(rowEstimateExample, null, 2),
    },
    {
      id: 'repeated-inner-work',
      title: translate('example.repeated.title'),
      description: translate('example.repeated.description'),
      source: JSON.stringify(repeatedWorkExample, null, 2),
    },
  ]
}
