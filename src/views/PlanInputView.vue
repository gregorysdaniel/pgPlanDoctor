<script setup lang="ts">
import { useRouter } from 'vue-router'
import PlanInput from '../components/PlanInput.vue'
import type { RecentPlan } from '../composables/useRecentPlans'
import { useRecentPlans } from '../composables/useRecentPlans'
import { usePlanSession } from '../composables/usePlanSession'
import { parseExplainJson, PlanParseError } from '../domain/planParser'
import { useI18n } from '../i18n'

const router = useRouter()
const { explainInput, loadedPlan, parseError } = usePlanSession()
const { recentPlans, addRecentPlan } = useRecentPlans()
const { t } = useI18n()

function useExample(source: string): void {
  explainInput.value = source
  parseError.value = null
}

async function analyzePlan(): Promise<void> {
  if (!explainInput.value.trim()) return

  try {
    const plan = parseExplainJson(explainInput.value)
    loadedPlan.value = plan
    parseError.value = null
    addRecentPlan(explainInput.value, plan.root)
    await router.push({ name: 'analysis' })
  } catch (error) {
    parseError.value =
      error instanceof PlanParseError
        ? error.message
        : t('input.loadError')
  }
}

async function openRecentPlan(recentPlan: RecentPlan): Promise<void> {
  try {
    explainInput.value = recentPlan.source
    loadedPlan.value = parseExplainJson(recentPlan.source)
    parseError.value = null
    await router.push({ name: 'analysis' })
  } catch (error) {
    parseError.value =
      error instanceof PlanParseError
        ? error.message
        : t('input.loadError')
  }
}
</script>

<template>
  <PlanInput
    v-model="explainInput"
    :error="parseError"
    :recent-plans="recentPlans"
    @analyze="analyzePlan"
    @open-recent-plan="openRecentPlan"
    @use-example="useExample"
  />
</template>
