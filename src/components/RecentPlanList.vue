<script setup lang="ts">
import { ElButton } from 'element-plus'
import { formatRecentPlanTitle, type RecentPlan } from '../composables/useRecentPlans'
import { useI18n } from '../i18n'

defineProps<{
  plans: readonly RecentPlan[]
}>()

defineEmits<{ open: [plan: RecentPlan] }>()
const { locale, t } = useI18n()

function formatAnalyzedAt(value: string): string {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const time = new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date)

  if (isSameCalendarDay(date, today)) return t('input.today', { time })
  if (isSameCalendarDay(date, yesterday)) return t('input.yesterday', { time })

  const formattedDate = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric', month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date)
  return `${formattedDate}, ${time}`
}

function isSameCalendarDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

function formatPlanSummary(plan: RecentPlan): string {
  const operators = t(plan.nodeCount === 1 ? 'input.operator.one' : 'input.operator.other', { count: plan.nodeCount })
  const attention = plan.attentionCount === 0
    ? t('input.attention.none')
    : t(plan.attentionCount === 1 ? 'input.attention.one' : 'input.attention.other', { count: plan.attentionCount })
  return `${operators} · ${attention}`
}
</script>

<template>
  <section class="input-recents" aria-labelledby="recent-plans-title">
    <header class="input-recents__header">
      <h2 id="recent-plans-title">{{ t('input.recentTitle') }}</h2>
      <p class="input-recents__lead">{{ t('input.recentLead') }}</p>
    </header>
    <ul v-if="plans.length" id="recent-plan-items" class="input-recents__list">
      <li v-for="plan in plans" :key="plan.id">
        <div class="input-recents__description">
          <strong>{{ formatRecentPlanTitle(plan) }}</strong>
          <span>{{ formatPlanSummary(plan) }}</span>
        </div>
        <time :datetime="plan.analyzedAt">{{ formatAnalyzedAt(plan.analyzedAt) }}</time>
        <ElButton :aria-label="t('input.openRecentPlan', { title: formatRecentPlanTitle(plan) })" @click="$emit('open', plan)">
          {{ t('input.openPlan') }}
        </ElButton>
      </li>
    </ul>
    <p v-if="!plans.length" class="input-recents__empty">{{ t('input.noRecent') }}</p>
  </section>
</template>
