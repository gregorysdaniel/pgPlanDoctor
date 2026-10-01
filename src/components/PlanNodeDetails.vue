<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { PhArrowSquareOut, PhCaretUp, PhWarningCircle } from '@phosphor-icons/vue'
import type { PlanNode } from '../domain/plan'
import { describePlanNode } from '../domain/planParser'
import { useI18n } from '../i18n'

const props = defineProps<{
  node: PlanNode
  number: number
  attentionCount: number
  timeShare: string
}>()

const emit = defineEmits<{
  toggle: []
  select: []
  resize: [height: number]
}>()

const { locale, t } = useI18n()
const card = ref<HTMLElement | null>(null)
const tabButtons = ref<HTMLButtonElement[]>([])
type DetailTab = 'general' | 'conditions' | 'buffers' | 'output'
const activeTab = ref<DetailTab>('general')
const integerFormatter = computed(() => new Intl.NumberFormat(locale.value))
const decimalFormatter = computed(() => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 3 }))
const executed = computed(() => props.node.metrics.loops > 0)

function time(value: number): string {
  return value >= 1_000
    ? `${decimalFormatter.value.format(value / 1_000)} s`
    : `${decimalFormatter.value.format(value)} ms`
}

function rows(value: number): string {
  return t(value === 1 ? 'analysis.rows.one' : 'analysis.rows.other', {
    count: integerFormatter.value.format(value),
  })
}

const description = computed(() => {
  // As expressões completas ficam nas condições, sem duplicá-las na explicação.
  if (props.node.type === 'Seq Scan') {
    return t('node.seqScan', { relation: props.node.relation ?? t('node.unknownRelation') })
  }
  if (props.node.type === 'Sort') return t('node.sort')
  return describePlanNode(props.node)
})

const metrics = computed(() => {
  const values = props.node.metrics
  const observed = (value: string) => executed.value ? value : '—'
  return [
    { label: t('tree.rowsPerExecution'), field: 'Actual Rows / Plan Rows', observed: observed(rows(values.actualRows)), estimated: rows(values.estimatedRows) },
    ...(values.startupTimeMs !== undefined
      ? [{ label: t('tree.startupTime'), field: 'Actual Startup Time', observed: observed(time(values.startupTimeMs)), estimated: '—' }]
      : []),
    { label: t('tree.inclusiveTime'), field: 'Actual Total Time', observed: observed(time(values.totalTimeMs)), estimated: '—' },
    { label: t('tree.executions'), field: 'Actual Loops', observed: integerFormatter.value.format(values.loops), estimated: '—' },
    ...(values.rowsRemovedByFilter !== undefined
      ? [{ label: t('tree.filteredRows'), field: 'Rows Removed by Filter', observed: observed(rows(values.rowsRemovedByFilter)), estimated: '—' }]
      : []),
  ]
})

const totals = computed(() => {
  if (!executed.value || props.node.metrics.loops <= 1) return []
  const values = props.node.metrics
  return [
    { label: t('tree.totalRows'), value: rows(values.actualRows * values.loops) },
    { label: t('tree.accumulatedTime'), value: time(values.totalTimeMs * values.loops) },
    ...(values.rowsRemovedByFilter !== undefined
      ? [{ label: t('tree.totalFilteredRows'), value: rows(values.rowsRemovedByFilter * values.loops) }]
      : []),
  ]
})

const planning = computed(() => {
  const values = props.node.metrics
  return [
    ...(values.startupCost !== undefined ? [{ label: t('tree.startupCost'), field: 'Startup Cost', value: decimalFormatter.value.format(values.startupCost) }] : []),
    ...(values.totalCost !== undefined ? [{ label: t('tree.plannedCost'), field: 'Total Cost', value: decimalFormatter.value.format(values.totalCost) }] : []),
    ...(values.planWidth !== undefined ? [{ label: t('tree.rowWidth'), field: 'Plan Width', value: `${integerFormatter.value.format(values.planWidth)} B` }] : []),
  ]
})

const conditions = computed(() => [
  { field: 'Index Cond', value: props.node.indexCondition },
  { field: 'Recheck Cond', value: props.node.recheckCondition },
  { field: 'Filter', value: props.node.filter },
  { field: 'Hash Cond', value: props.node.hashCondition },
  { field: 'Merge Cond', value: props.node.mergeCondition },
  { field: 'Join Filter', value: props.node.joinFilter },
  { field: 'Sort Key', value: props.node.sortKeys?.join(', ') },
].filter((condition): condition is { field: string; value: string } => !!condition.value))

const tabs = computed(() => [
  { id: 'general' as const, label: t('tree.general') },
  ...(conditions.value.length ? [{ id: 'conditions' as const, label: t('tree.conditionsTab') }] : []),
  ...(props.node.metrics.buffers ? [{ id: 'buffers' as const, label: t('tree.buffers') }] : []),
  ...(props.node.output?.length ? [{ id: 'output' as const, label: t('tree.outputFields') }] : []),
])

const buffers = computed(() => {
  const values = props.node.metrics.buffers
  if (!values) return []
  return [
    { label: t('tree.bufferHit'), field: 'Shared Hit Blocks', value: values.sharedHit },
    { label: t('tree.bufferRead'), field: 'Shared Read Blocks', value: values.sharedRead },
    { label: t('tree.bufferDirtied'), field: 'Shared Dirtied Blocks', value: values.sharedDirtied },
    { label: t('tree.bufferWritten'), field: 'Shared Written Blocks', value: values.sharedWritten },
    { label: t('tree.tempRead'), field: 'Temp Read Blocks', value: values.tempRead },
    { label: t('tree.tempWritten'), field: 'Temp Written Blocks', value: values.tempWritten },
  ]
})

async function navigateTab(event: KeyboardEvent): Promise<void> {
  const current = tabs.value.findIndex(tab => tab.id === activeTab.value)
  let target = current
  if (event.key === 'ArrowRight') target = (current + 1) % tabs.value.length
  else if (event.key === 'ArrowLeft') target = (current - 1 + tabs.value.length) % tabs.value.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = tabs.value.length - 1
  else return
  event.preventDefault()
  activeTab.value = tabs.value[target]!.id
  await nextTick()
  tabButtons.value[target]?.focus()
}

watch(tabs, () => {
  if (!tabs.value.some(tab => tab.id === activeTab.value)) activeTab.value = 'general'
})

let observer: ResizeObserver | null = null
let touchScroll: { id: number; y: number; top: number; body: HTMLElement } | null = null
let scrolledByTouch = false

function beginTouchScroll(event: PointerEvent): void {
  scrolledByTouch = false
  if (event.pointerType !== 'touch') return
  const body = (event.target as Element).closest<HTMLElement>('.plan-node-inspector__body')
  if (!body || body.scrollHeight <= body.clientHeight) return
  touchScroll = { id: event.pointerId, y: event.clientY, top: body.scrollTop, body }
}

function moveTouchScroll(event: PointerEvent): void {
  if (touchScroll?.id !== event.pointerId) return
  const distance = touchScroll.y - event.clientY
  if (Math.abs(distance) > 6) {
    scrolledByTouch = true
    if (!touchScroll.body.hasPointerCapture(event.pointerId)) {
      touchScroll.body.setPointerCapture(event.pointerId)
    }
  }
  touchScroll.body.scrollTop = touchScroll.top + distance
}

function endTouchScroll(): void {
  touchScroll = null
}

function stopScrollClick(event: MouseEvent): void {
  if (!scrolledByTouch) return
  event.preventDefault()
  event.stopPropagation()
  scrolledByTouch = false
}

onMounted(() => {
  if (!card.value) return
  observer = new ResizeObserver(() => {
    if (card.value) emit('resize', card.value.offsetHeight + 2)
  })
  observer.observe(card.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <article
    ref="card"
    class="plan-node-inspector"
    @click.capture="stopScrollClick"
    @click.stop="emit('select')"
    @keydown.stop
    @pointerdown.stop="beginTouchScroll"
    @pointermove.stop="moveTouchScroll"
    @pointerup.stop="endTouchScroll"
    @pointercancel.stop="endTouchScroll"
    @wheel.stop
  >
    <header class="plan-node-inspector__header">
      <button
        type="button"
        class="plan-node-inspector__toggle"
        :aria-label="t('tree.collapseNode', { type: node.type })"
        aria-expanded="true"
        @click.stop="emit('toggle')"
      >
        <PhCaretUp :size="16" weight="bold" aria-hidden="true" />
        <strong>{{ node.type }}</strong>
      </button>
      <span class="plan-node-inspector__identity">
        <span
          v-if="attentionCount > 0"
          class="plan-node-inspector__attention"
          :aria-label="t(attentionCount === 1 ? 'analysis.nodeTips.one' : 'analysis.nodeTips.other', { count: attentionCount })"
          :title="t(attentionCount === 1 ? 'analysis.nodeTips.one' : 'analysis.nodeTips.other', { count: attentionCount })"
        >
          <PhWarningCircle :size="16" weight="bold" aria-hidden="true" />
          {{ attentionCount }}
        </span>
        <span>#{{ number }}</span>
      </span>
    </header>

    <dl v-if="node.relation || node.indexName || node.joinType" class="plan-node-inspector__context">
      <div v-if="node.relation"><dt>{{ t('tree.relation') }}</dt><dd><code>{{ node.relation }}</code></dd></div>
      <div v-if="node.indexName"><dt>{{ t('analysis.index') }}</dt><dd><code>{{ node.indexName }}</code></dd></div>
      <div v-if="node.joinType"><dt>{{ t('tree.joinType') }}</dt><dd><code>{{ node.joinType }}</code></dd></div>
    </dl>
    <p class="plan-node-inspector__description">{{ description }}</p>

    <div class="plan-node-inspector__tabs" role="tablist" :aria-label="t('tree.nodeDetails')">
      <button
        v-for="tab in tabs"
        :id="`${node.id}-tab-${tab.id}`"
        :key="tab.id"
        ref="tabButtons"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`${node.id}-panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @click="activeTab = tab.id"
        @keydown="navigateTab"
      >{{ tab.label }}</button>
    </div>

    <section
      :id="`${node.id}-panel-${activeTab}`"
      class="plan-node-inspector__body"
      role="tabpanel"
      :aria-labelledby="`${node.id}-tab-${activeTab}`"
      tabindex="0"
    >
      <template v-if="activeTab === 'general'">
        <p v-if="!executed" class="plan-node-inspector__note">{{ t('tree.notExecuted') }}</p>
        <table class="plan-node-inspector__metrics">
          <caption>{{ t('tree.executionMetrics') }}</caption>
          <thead><tr><th scope="col">{{ t('tree.metric') }}</th><th scope="col">{{ t('tree.observed') }}</th><th scope="col">{{ t('tree.estimated') }}</th></tr></thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.field">
              <th scope="row" :title="metric.field">{{ metric.label }}</th>
              <td>{{ metric.observed }}</td><td>{{ metric.estimated }}</td>
            </tr>
          </tbody>
        </table>
        <template v-if="totals.length">
          <h4>{{ t('tree.totals') }}</h4>
          <dl class="plan-node-inspector__values"><div v-for="total in totals" :key="total.label"><dt>{{ total.label }}</dt><dd>{{ total.value }}</dd></div></dl>
        </template>
        <dl v-if="executed" class="plan-node-inspector__values"><div><dt>{{ t('tree.relativeTime') }}</dt><dd>{{ timeShare }}</dd></div></dl>
        <RouterLink
          class="plan-node-inspector__learning-link"
          :to="{ name: 'learning-article', params: { slug: 'metricas-essenciais' } }"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('tree.metricsHelpNewTab')"
          :title="t('tree.metricsHelpNewTab')"
        >
          {{ t('tree.metricsHelp') }}
          <PhArrowSquareOut :size="14" weight="bold" aria-hidden="true" />
        </RouterLink>

        <template v-if="planning.length">
          <h4>{{ t('analysis.planning') }}</h4>
          <dl class="plan-node-inspector__values"><div v-for="value in planning" :key="value.field"><dt :title="value.field">{{ value.label }}</dt><dd>{{ value.value }}</dd></div></dl>
          <p v-if="node.metrics.startupCost !== undefined || node.metrics.totalCost !== undefined" class="plan-node-inspector__note">{{ t('tree.costNote') }}</p>
        </template>

      </template>

      <template v-else-if="activeTab === 'conditions'">
        <h4 class="plan-node-inspector__section-heading">{{ t('tree.conditions') }}</h4>
        <dl class="plan-node-inspector__conditions"><div v-for="condition in conditions" :key="condition.field"><dt><code>{{ condition.field }}</code></dt><dd><code>{{ condition.value }}</code></dd></div></dl>
        <p class="plan-node-inspector__note">{{ t('tree.conditionsNote') }}</p>
      </template>

      <template v-else-if="activeTab === 'buffers'">
        <table class="plan-node-inspector__buffers">
          <caption>{{ t('tree.bufferCounts') }}</caption>
          <tbody><tr v-for="buffer in buffers" :key="buffer.field"><th scope="row" :title="buffer.field">{{ buffer.label }}</th><td>{{ integerFormatter.format(buffer.value) }}</td></tr></tbody>
        </table>
        <p class="plan-node-inspector__note">{{ t('tree.buffersNote') }}</p>
      </template>

      <template v-else>
        <h4 class="plan-node-inspector__section-heading">{{ t('tree.outputFields') }}</h4>
        <ol class="plan-node-inspector__output"><li v-for="(field, index) in node.output" :key="index"><code>{{ field }}</code></li></ol>
        <p class="plan-node-inspector__note">{{ t('tree.outputNote') }}</p>
      </template>
    </section>
  </article>
</template>
