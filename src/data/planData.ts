import { parseExplainPlan } from '../domain/planParser'
import explainAnalyzeExample from './explainAnalyzeExample.json'

// A aplicação de exemplo percorre o mesmo caminho que um plano fornecido pelo usuário.
export const planData = parseExplainPlan(explainAnalyzeExample)

// Mantém o JSON original disponível para comparação com a árvore renderizada.
export const explainAnalyzeOutput = JSON.stringify(explainAnalyzeExample, null, 2)
