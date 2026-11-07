import { ref } from 'vue'
import type { ExplainPlan } from '../domain/plan'

const explainInput = ref('')
const loadedPlan = ref<ExplainPlan | null>(null)
const parseError = ref<string | null>(null)

export function usePlanSession() {
  return {
    explainInput,
    loadedPlan,
    parseError,
  }
}
