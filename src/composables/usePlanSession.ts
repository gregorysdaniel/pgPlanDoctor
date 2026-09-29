import { ref } from 'vue'
import type { PlanNode } from '../domain/plan'

const explainInput = ref('')
const loadedPlan = ref<PlanNode | null>(null)
const parseError = ref<string | null>(null)

export function usePlanSession() {
  return {
    explainInput,
    loadedPlan,
    parseError,
  }
}
