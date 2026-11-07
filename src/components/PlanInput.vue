<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhQuestion, PhWarningCircle } from '@phosphor-icons/vue'
import type { RecentPlan } from '../composables/useRecentPlans'
import { getPlanExamples } from '../data/planData'
import { useI18n } from '../i18n'
import PlanJsonEditor from './PlanJsonEditor.vue'
import RecentPlanList from './RecentPlanList.vue'

defineProps<{
  error: string | null
  loading?: boolean
  recentPlans: readonly RecentPlan[]
}>()

const emit = defineEmits<{
  analyze: []
  useExample: [source: string]
  openRecentPlan: [plan: RecentPlan]
}>()

const model = defineModel<string>({ required: true })
const { t } = useI18n()
const planExamples = computed(getPlanExamples)
const editor = ref<InstanceType<typeof PlanJsonEditor> | null>(null)

function loadExample(source: string): void {
  emit('useExample', source)
  void editor.value?.focusInput()
}
</script>

<template>
  <main class="input-screen">
    <div class="input-workspace">
      <header class="input-workspace__header">
        <div>
          <h1 id="input-title">{{ t('input.title') }}</h1>
          <p v-html="t('input.lead')"></p>
        </div>
        <RouterLink
          class="input-workspace__help"
          :to="{ name: 'learning-article', params: { slug: 'como-gerar-e-percorrer-um-plano' } }"
        >
          <PhQuestion :size="18" weight="bold" aria-hidden="true" />
          {{ t('input.howToJson') }}
        </RouterLink>
      </header>

      <div class="input-execution-warning" role="note">
        <PhWarningCircle :size="18" weight="bold" aria-hidden="true" />
        <p><strong>{{ t('input.warningTitle') }}</strong> {{ t('input.warningText') }}</p>
      </div>

      <PlanJsonEditor
        ref="editor"
        v-model="model"
        :error="error"
        :loading="loading"
        :examples="planExamples"
        @analyze="emit('analyze')"
        @use-example="loadExample"
      />

      <RecentPlanList :plans="recentPlans" @open="emit('openRecentPlan', $event)" />
    </div>
  </main>
</template>
