<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { PhBookOpenText, PhBracketsCurly, PhInfo, PhPlusCircle } from '@phosphor-icons/vue'
import AppHeader from './components/AppHeader.vue'
import LearningArticle from './components/LearningArticle.vue'
import LearningIndex from './components/LearningIndex.vue'
import PlanAnalysis from './components/PlanAnalysis.vue'
import PlanInput from './components/PlanInput.vue'
import ProjectInfo from './components/ProjectInfo.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { findLearningArticle } from './content/learningContent'
import { explainAnalyzeOutput } from './data/planData'
import { parseExplainJson, PlanParseError } from './domain/planParser'
import type { PlanNode } from './domain/plan'
import { useTheme } from './composables/useTheme'

type AppScreen = 'input' | 'analysis' | 'info' | 'learning'
type WorkspaceScreen = 'input' | 'analysis'

interface ContentLocation {
  screen: 'input' | 'info' | 'learning'
  learningSlug: string | null
}

function readContentLocation(): ContentLocation {
  if (window.location.hash === '#sobre') {
    return { screen: 'info', learningSlug: null }
  }

  const learningMatch = window.location.hash.match(/^#aprender(?:\/([^/?#]+))?$/)
  if (learningMatch) {
    return {
      screen: 'learning',
      learningSlug: learningMatch[1] ? decodeURIComponent(learningMatch[1]) : null,
    }
  }

  return { screen: 'input', learningSlug: null }
}

const { initializeTheme } = useTheme()
const initialLocation = readContentLocation()
const screen = ref<AppScreen>(initialLocation.screen)
const learningSlug = ref<string | null>(initialLocation.learningSlug)
const screenBeforeContent = ref<WorkspaceScreen>('input')
const explainInput = ref('')
const loadedPlan = ref<PlanNode | null>(null)
const parseError = ref<string | null>(null)
const originalPlanVisible = ref(false)
const currentLearningArticle = computed(() => findLearningArticle(learningSlug.value))

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
  const location = readContentLocation()

  if (location.screen === 'info' || location.screen === 'learning') {
    if (screen.value === 'input' || screen.value === 'analysis') {
      screenBeforeContent.value = screen.value
    }

    screen.value = location.screen
    learningSlug.value = location.learningSlug
  } else if (screen.value === 'info' || screen.value === 'learning') {
    screen.value = screenBeforeContent.value
    learningSlug.value = null
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
  if (screen.value === 'info' || screen.value === 'learning') {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  screen.value = 'input'
  learningSlug.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openProjectInfo(): void {
  if (screen.value === 'input' || screen.value === 'analysis') {
    screenBeforeContent.value = screen.value
  }

  window.history.pushState(null, '', '#sobre')
  screen.value = 'info'
  learningSlug.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openLearning(): void {
  if (screen.value === 'input' || screen.value === 'analysis') {
    screenBeforeContent.value = screen.value
  }

  window.history.pushState(null, '', '#aprender')
  screen.value = 'learning'
  learningSlug.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="planoclaro">
    <AppHeader @home="returnToInput">
      <template #nav>
        <button
          class="header-nav__link"
          :class="{ 'header-nav__link--active': screen === 'learning' }"
          type="button"
          :aria-current="screen === 'learning' ? 'page' : undefined"
          @click="openLearning"
        >
          <PhBookOpenText :size="19" weight="bold" aria-hidden="true" />
          Aprender
        </button>
        <button
          class="header-nav__link"
          :class="{ 'header-nav__link--active': screen === 'info' }"
          type="button"
          :aria-current="screen === 'info' ? 'page' : undefined"
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

    <LearningArticle
      v-else-if="screen === 'learning' && currentLearningArticle"
      :article="currentLearningArticle"
    />

    <LearningIndex v-else-if="screen === 'learning'" />

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
