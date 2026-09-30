<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElAlert, ElButton, ElTabPane, ElTabs } from 'element-plus'
import {
  PhBracketsCurly,
  PhClockCounterClockwise,
  PhFileCode,
  PhPlay,
  PhQuestion,
  PhShieldCheck,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { formatRecentPlanTitle, type RecentPlan } from '../composables/useRecentPlans'
import { getPlanExamples, type PlanExample } from '../data/planData'
import { useI18n } from '../i18n'

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
const { locale, t } = useI18n()
const gutter = ref<HTMLElement | null>(null)
const activeTab = ref('new-plan')
const planExamples = computed(getPlanExamples)

const lineNumbers = computed(() => {
  const count = Math.max(20, model.value.split('\n').length)
  return Array.from({ length: count }, (_, index) => index + 1)
})

const hasContent = computed(() => model.value.trim().length > 0)

function synchronizeScroll(event: Event): void {
  if (!gutter.value) return
  gutter.value.scrollTop = (event.target as HTMLTextAreaElement).scrollTop
}

function loadExample(example: PlanExample): void {
  emit('useExample', example.source)
  activeTab.value = 'new-plan'
}

function formatAnalyzedAt(value: string): string {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const time = new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  if (isSameCalendarDay(date, today)) return t('input.today', { time })
  if (isSameCalendarDay(date, yesterday)) return t('input.yesterday', { time })

  const dateFormatter = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })

  return `${dateFormatter.format(date)}, ${time}`
}

function isSameCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function formatPlanSummary(plan: RecentPlan): string {
  const operators = t(
    plan.nodeCount === 1 ? 'input.operator.one' : 'input.operator.other',
    { count: plan.nodeCount },
  )
  const attention =
    plan.attentionCount === 0
      ? t('input.attention.none')
      : t(
          plan.attentionCount === 1 ? 'input.attention.one' : 'input.attention.other',
          { count: plan.attentionCount },
        )

  return `${operators} · ${attention}`
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
          :to="{
            name: 'learning-article',
            params: { slug: 'como-gerar-e-percorrer-um-plano' },
          }"
        >
          <PhQuestion :size="18" weight="bold" aria-hidden="true" />
          {{ t('input.howToJson') }}
        </RouterLink>
      </header>

      <ElTabs v-model="activeTab" class="input-tabs">
        <ElTabPane :label="t('input.tab.new')" name="new-plan">
          <section class="plan-editor" aria-labelledby="input-title">
            <header class="plan-editor__header">
              <div class="plan-editor__identity">
                <span aria-hidden="true"><PhBracketsCurly :size="24" weight="bold" /></span>
                <div>
                  <strong>{{ t('input.plan') }}</strong>
                  <small>{{ t('input.jsonFormat') }}</small>
                </div>
              </div>
              <span class="plan-editor__privacy">
                <PhShieldCheck :size="18" weight="duotone" aria-hidden="true" />
                {{ t('input.local') }}
              </span>
            </header>

            <div class="code-editor">
              <div ref="gutter" class="code-editor__gutter" aria-hidden="true">
                <span v-for="line in lineNumbers" :key="line">{{ line }}</span>
              </div>
              <textarea
                v-model="model"
                class="code-editor__textarea"
                :aria-label="t('input.jsonAria')"
                :placeholder="t('input.placeholder')"
                spellcheck="false"
                @scroll="synchronizeScroll"
                @keydown.ctrl.enter.prevent="emit('analyze')"
              ></textarea>
            </div>

            <footer class="plan-editor__footer">
              <span class="editor-shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> {{ t('input.shortcut') }}</span>

              <div class="plan-editor__actions">
                <ElButton
                  type="primary"
                  :disabled="!hasContent"
                  :loading="loading"
                  @click="emit('analyze')"
                >
                  <PhPlay :size="18" weight="fill" aria-hidden="true" />
                  {{ t('input.analyze') }}
                </ElButton>
              </div>
            </footer>

            <ElAlert
              v-if="error"
              class="parse-error"
              :closable="false"
              :title="error"
              type="error"
              show-icon
            />
          </section>

          <div class="input-execution-warning" role="note">
            <PhWarningCircle :size="23" weight="duotone" aria-hidden="true" />
            <p>
              <strong>{{ t('input.warningTitle') }}</strong>
              {{ t('input.warningText') }}
            </p>
          </div>
        </ElTabPane>

        <ElTabPane :label="t('input.tab.recent')" name="recent-plans">
          <section class="input-library-panel" aria-labelledby="recent-plans-title">
            <header>
              <PhClockCounterClockwise :size="28" weight="duotone" aria-hidden="true" />
              <div>
                <h2 id="recent-plans-title">{{ t('input.recentTitle') }}</h2>
                <p>{{ t('input.recentLead') }}</p>
              </div>
            </header>

            <div v-if="recentPlans.length" class="input-library-list">
              <article v-for="plan in recentPlans" :key="plan.id">
                <div>
                  <strong>{{ formatRecentPlanTitle(plan) }}</strong>
                  <span>{{ formatPlanSummary(plan) }}</span>
                </div>
                <div class="input-library-item__actions">
                  <time :datetime="plan.analyzedAt">{{ formatAnalyzedAt(plan.analyzedAt) }}</time>
                  <ElButton @click="emit('openRecentPlan', plan)">{{ t('input.openPlan') }}</ElButton>
                </div>
              </article>
            </div>
            <div v-else class="input-library-empty">
              <strong>{{ t('input.noRecent') }}</strong>
              <p>{{ t('input.noRecentLead') }}</p>
            </div>
          </section>
        </ElTabPane>

        <ElTabPane :label="t('input.tab.examples')" name="examples">
          <section class="input-library-panel" aria-labelledby="examples-title">
            <header>
              <PhFileCode :size="28" weight="duotone" aria-hidden="true" />
              <div>
                <h2 id="examples-title">{{ t('input.examplesTitle') }}</h2>
                <p>{{ t('input.examplesLead') }}</p>
              </div>
            </header>

            <div class="input-library-list input-library-list--examples">
              <article v-for="example in planExamples" :key="example.id">
                <div>
                  <strong>{{ example.title }}</strong>
                  <span>{{ example.description }}</span>
                </div>
                <ElButton @click="loadExample(example)">{{ t('input.loadExample') }}</ElButton>
              </article>
            </div>
          </section>
        </ElTabPane>
      </ElTabs>
    </div>
  </main>
</template>
