<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import AppHeader from './components/AppHeader.vue'
import PlanAnalysis from './components/PlanAnalysis.vue'
import PlanInput from './components/PlanInput.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { explainAnalyzeOutput } from './data/planData'
import { parseExplainJson, PlanParseError } from './domain/planParser'
import type { PlanNode } from './domain/plan'
import { useTheme } from './composables/useTheme'

type AppScreen = 'input' | 'analysis'

const { initializeTheme } = useTheme()
const screen = ref<AppScreen>('input')
const explainInput = ref('')
const loadedPlan = ref<PlanNode | null>(null)
const parseError = ref<string | null>(null)
const originalPlanVisible = ref(false)

onMounted(initializeTheme)

function useExample(): void {
  explainInput.value = explainAnalyzeOutput
  parseError.value = null
}

function analyzePlan(): void {
  if (!explainInput.value.trim()) return

  try {
    loadedPlan.value = parseExplainJson(explainInput.value)
    parseError.value = null
    screen.value = 'analysis'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    parseError.value =
      error instanceof PlanParseError
        ? error.message
        : 'Não foi possível carregar o plano de execução.'
  }
}

function returnToInput(): void {
  screen.value = 'input'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

</script>

<template>
  <div class="planoclaro">
    <AppHeader @home="returnToInput">
      <template v-if="screen === 'analysis'">
        <ElButton @click="originalPlanVisible = true">Ver JSON</ElButton>
        <ElButton type="primary" @click="returnToInput">Novo plano</ElButton>
      </template>

      <ThemeSwitcher />
    </AppHeader>

    <PlanInput
      v-if="screen === 'input'"
      v-model="explainInput"
      :error="parseError"
      @analyze="analyzePlan"
      @use-example="useExample"
    />

    <PlanAnalysis v-else-if="loadedPlan" :plan="loadedPlan" />

    <ElDialog
      v-model="originalPlanVisible"
      class="original-plan-dialog"
      title="Plano original"
      :teleported="false"
      width="min(860px, calc(100vw - 32px))"
    >
      <pre>{{ explainInput }}</pre>
    </ElDialog>
  </div>
</template>
