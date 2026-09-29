<script setup lang="ts">
import { useRouter } from 'vue-router'
import PlanInput from '../components/PlanInput.vue'
import { usePlanSession } from '../composables/usePlanSession'
import { explainAnalyzeOutput } from '../data/planData'
import { parseExplainJson, PlanParseError } from '../domain/planParser'

const router = useRouter()
const { explainInput, loadedPlan, parseError } = usePlanSession()

function useExample(): void {
  explainInput.value = explainAnalyzeOutput
  parseError.value = null
}

async function analyzePlan(): Promise<void> {
  if (!explainInput.value.trim()) return

  try {
    loadedPlan.value = parseExplainJson(explainInput.value)
    parseError.value = null
    await router.push({ name: 'analysis' })
  } catch (error) {
    parseError.value =
      error instanceof PlanParseError
        ? error.message
        : 'Não foi possível carregar o plano de execução.'
  }
}
</script>

<template>
  <PlanInput
    v-model="explainInput"
    :error="parseError"
    @analyze="analyzePlan"
    @use-example="useExample"
  />
</template>
