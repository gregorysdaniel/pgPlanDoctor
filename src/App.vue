<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { PhBookOpenText, PhBracketsCurly, PhInfo, PhPlusCircle } from '@phosphor-icons/vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { usePlanSession } from './composables/usePlanSession'
import { useI18n } from './i18n'

const route = useRoute()
const router = useRouter()
const { explainInput } = usePlanSession()
const { t } = useI18n()
const originalPlanVisible = ref(false)

const isAnalysis = computed(() => route.name === 'analysis')
const navigationSection = computed(() => route.meta.section)

function openInput(): void {
  void router.push({ name: 'input' })
}
</script>

<template>
  <div class="pg-plan-doctor">
    <AppHeader>
      <template #nav>
        <RouterLink
          class="header-nav__link"
          :class="{ 'header-nav__link--active': navigationSection === 'learning' }"
          :to="{ name: 'learning' }"
          :aria-current="navigationSection === 'learning' ? 'page' : undefined"
        >
          <PhBookOpenText :size="15" weight="bold" aria-hidden="true" />
          {{ t('nav.learn') }}
        </RouterLink>
        <RouterLink
          class="header-nav__link"
          :class="{ 'header-nav__link--active': navigationSection === 'about' }"
          :to="{ name: 'about' }"
          :aria-current="navigationSection === 'about' ? 'page' : undefined"
        >
          <PhInfo :size="15" weight="bold" aria-hidden="true" />
          {{ t('nav.about') }}
        </RouterLink>
      </template>

      <template v-if="isAnalysis">
        <ElButton
          :aria-label="t('actions.viewOriginalJson')"
          :title="t('actions.viewOriginalJson')"
          @click="originalPlanVisible = true"
        >
          <PhBracketsCurly :size="16" weight="bold" aria-hidden="true" />
          {{ t('actions.viewJson') }}
        </ElButton>
        <ElButton
          type="primary"
          :aria-label="t('actions.analyzeAnotherPlan')"
          :title="t('actions.analyzeAnotherPlan')"
          @click="openInput"
        >
          <PhPlusCircle :size="16" weight="bold" aria-hidden="true" />
          {{ t('actions.newPlan') }}
        </ElButton>
      </template>

      <LanguageSwitcher />
    </AppHeader>

    <RouterView />

    <ElDialog
      v-model="originalPlanVisible"
      class="original-plan-dialog"
      :title="t('dialog.originalPlan')"
      :teleported="false"
      width="min(860px, calc(100vw - 32px))"
    >
      <pre>{{ explainInput }}</pre>
    </ElDialog>
  </div>
</template>
