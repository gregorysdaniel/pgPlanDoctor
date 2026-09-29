<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { PhBracketsCurly, PhInfo, PhPlusCircle } from '@phosphor-icons/vue'
import AppHeader from './components/AppHeader.vue'
import PlanAnalysis from './components/PlanAnalysis.vue'
import PlanInput from './components/PlanInput.vue'
import ProjectInfo from './components/ProjectInfo.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { explainAnalyzeOutput } from './data/planData'
import { parseExplainJson, PlanParseError } from './domain/planParser'
import type { PlanNode } from './domain/plan'
import { useTheme } from './composables/useTheme'

type AppScreen = 'input' | 'analysis' | 'info'

const { initializeTheme } = useTheme()
const screen = ref<AppScreen>(window.location.hash === '#sobre' ? 'info' : 'input')
const screenBeforeInfo = ref<AppScreen>('input')
const explainInput = ref('')
const loadedPlan = ref<PlanNode | null>(null)
const parseError = ref<string | null>(null)
const originalPlanVisible = ref(false)

onMounted(() => {
  initializeTheme()
  window.addEventListener('popstate', synchronizeScreenWithLocation)
  window.addEventListener('hashchange', synchronizeScreenWithLocation)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', synchronizeScreenWithLocation)
  window.removeEventListener('hashchange', synchronizeScreenWithLocation)
})

function synchronizeScreenWithLocation(): void {
  if (window.location.hash === '#sobre') {
    if (screen.value !== 'info') screenBeforeInfo.value = screen.value
    screen.value = 'info'
  } else if (screen.value === 'info') {
    screen.value = screenBeforeInfo.value
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
  if (window.location.hash === '#sobre') {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  screen.value = 'input'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openProjectInfo(): void {
  if (screen.value !== 'info') screenBeforeInfo.value = screen.value
  window.history.pushState(null, '', '#sobre')
  screen.value = 'info'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="planoclaro">
    <AppHeader @home="returnToInput">
      <template #nav>
        <button
          v-if="screen !== 'info'"
          class="header-nav__link"
          type="button"
          @click="openProjectInfo"
        >
          <PhInfo :size="19" weight="bold" aria-hidden="true" />
          Sobre o projeto
        </button>
      </template>

      <template v-if="screen === 'analysis'">
        <ElButton
          aria-label="Ver JSON original"
          title="Ver JSON original"
          @click="originalPlanVisible = true"
        >
          <PhBracketsCurly :size="18" weight="bold" aria-hidden="true" />
          Ver JSON
        </ElButton>
        <ElButton
          type="primary"
          aria-label="Analisar outro plano"
          title="Analisar outro plano"
          @click="returnToInput"
        >
          <PhPlusCircle :size="18" weight="bold" aria-hidden="true" />
          Novo plano
        </ElButton>
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

    <PlanAnalysis v-else-if="screen === 'analysis' && loadedPlan" :plan="loadedPlan" />

    <ProjectInfo v-else-if="screen === 'info'" />

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
