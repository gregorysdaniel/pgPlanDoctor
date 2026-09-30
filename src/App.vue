<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { PhBookOpenText, PhBracketsCurly, PhInfo, PhPlusCircle } from '@phosphor-icons/vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { usePlanSession } from './composables/usePlanSession'

const route = useRoute()
const router = useRouter()
const { explainInput } = usePlanSession()
const originalPlanVisible = ref(false)

const isAnalysis = computed(() => route.name === 'analysis')
const navigationSection = computed(() => route.meta.section)

function openInput(): void {
  void router.push({ name: 'input' })
}
</script>

<template>
  <div class="planoclaro">
    <AppHeader>
      <template #nav>
        <RouterLink
          class="header-nav__link"
          :class="{ 'header-nav__link--active': navigationSection === 'learning' }"
          :to="{ name: 'learning' }"
          :aria-current="navigationSection === 'learning' ? 'page' : undefined"
        >
          <PhBookOpenText :size="17" weight="bold" aria-hidden="true" />
          Aprender
        </RouterLink>
        <RouterLink
          class="header-nav__link"
          :class="{ 'header-nav__link--active': navigationSection === 'about' }"
          :to="{ name: 'about' }"
          :aria-current="navigationSection === 'about' ? 'page' : undefined"
        >
          <PhInfo :size="17" weight="bold" aria-hidden="true" />
          Sobre o projeto
        </RouterLink>
      </template>

      <template v-if="isAnalysis">
        <ElButton
          aria-label="Ver JSON original"
          title="Ver JSON original"
          @click="originalPlanVisible = true"
        >
          <PhBracketsCurly :size="16" weight="bold" aria-hidden="true" />
          Ver JSON
        </ElButton>
        <ElButton
          type="primary"
          aria-label="Analisar outro plano"
          title="Analisar outro plano"
          @click="openInput"
        >
          <PhPlusCircle :size="16" weight="bold" aria-hidden="true" />
          Novo plano
        </ElButton>
      </template>

      <ThemeSwitcher />
    </AppHeader>

    <RouterView />

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
