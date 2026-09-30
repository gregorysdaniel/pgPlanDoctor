<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'
import { computed, ref, watch } from 'vue'
import { ElCollapse, ElCollapseItem, ElLink, ElPopover } from 'element-plus'
import PlanTree from './PlanTree.vue'
import { evaluatePlan } from '../domain/heuristics'
import type { ExplainPlan, PlanNode } from '../domain/plan'
import { describePlanNode } from '../domain/planParser'
import { useI18n } from '../i18n'

const props = defineProps<{
  plan: ExplainPlan
}>()

const { locale, t } = useI18n()
const integerFormatter = computed(() => new Intl.NumberFormat(locale.value))
const timeFormatter = computed(
  () => new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)

const root = computed(() => props.plan.root)
const tips = computed(() => evaluatePlan(root.value))
const attentionNodeIds = computed(() => [...new Set(tips.value.map((tip) => tip.node.id))])
const selectedNode = ref<PlanNode>(tips.value[0]?.node ?? root.value)
const selectedTip = computed(() => tips.value.find((tip) => tip.node.id === selectedNode.value.id))

watch(
  root,
  (plan) => {
    selectedNode.value = evaluatePlan(plan)[0]?.node ?? plan
  },
)

const executionTime = computed(() => props.plan.executionTimeMs ?? accumulatedTime(root.value))
const resultRows = computed(() => accumulatedRows(root.value))
const nodeCount = computed(() => countNodes(root.value))
const planDepth = computed(() => calculateDepth(root.value))
const structureSummary = computed(() => {
  const nodes = t(nodeCount.value === 1 ? 'analysis.node.one' : 'analysis.node.other', {
    count: nodeCount.value,
  })
  const levels = t(planDepth.value === 1 ? 'analysis.level.one' : 'analysis.level.other', {
    count: planDepth.value,
  })
  return `${nodes} · ${levels}`
})
const relationNames = computed(() => {
  const relations = new Set<string>()

  function visit(node: PlanNode): void {
    if (node.relation) relations.add(node.relation)
    node.children?.forEach(visit)
  }

  visit(root.value)
  return [...relations]
})
const rootBuffers = computed(() => root.value.metrics.buffers)
const bufferSummary = computed(() => {
  const buffers = rootBuffers.value
  if (!buffers) return null

  const shared = buffers.sharedHit + buffers.sharedRead
  const temporary = buffers.tempRead + buffers.tempWritten
  const parts = [t('analysis.sharedBuffers', { count: formatInteger(shared) })]
  if (temporary > 0) parts.push(t('analysis.tempBuffers', { count: formatInteger(temporary) }))
  return parts.join(' · ')
})

const selectedAccumulatedTime = computed(() => accumulatedTime(selectedNode.value))
const selectedReceivedRows = computed(() => {
  if (!selectedNode.value.children?.length) return null
  return selectedNode.value.children.reduce((total, child) => total + accumulatedRows(child), 0)
})
const selectedDiscardedRows = computed(() => {
  const removedRows = selectedNode.value.metrics.rowsRemovedByFilter
  return removedRows === undefined ? null : removedRows * selectedNode.value.metrics.loops
})
const selectedExaminedRows = computed(() => {
  if (selectedDiscardedRows.value === null) return null
  return accumulatedRows(selectedNode.value) + selectedDiscardedRows.value
})

function accumulatedRows(node: PlanNode): number {
  return node.metrics.actualRows * node.metrics.loops
}

function accumulatedTime(node: PlanNode): number {
  return node.metrics.totalTimeMs * node.metrics.loops
}

function countNodes(node: PlanNode): number {
  return 1 + (node.children?.reduce((total, child) => total + countNodes(child), 0) ?? 0)
}

function calculateDepth(node: PlanNode): number {
  if (!node.children?.length) return 1
  return 1 + Math.max(...node.children.map(calculateDepth))
}

function formatInteger(value: number): string {
  return integerFormatter.value.format(value)
}

function formatTime(value: number): string {
  return value >= 1_000
    ? `${timeFormatter.value.format(value / 1_000)} s`
    : `${timeFormatter.value.format(value)} ms`
}
</script>

<template>
  <main class="analysis-screen">
    <section class="analysis-summary" :aria-label="t('analysis.summaryAria')">
      <div class="summary-metric">
        <span>{{ t('analysis.execution') }}</span>
        <strong>{{ formatTime(executionTime) }}</strong>
      </div>
      <div v-if="plan.planningTimeMs !== undefined" class="summary-metric">
        <span>{{ t('analysis.planning') }}</span>
        <strong>{{ formatTime(plan.planningTimeMs) }}</strong>
      </div>
      <div class="summary-metric">
        <span>{{ t('analysis.result') }}</span>
        <strong>{{ t(resultRows === 1 ? 'analysis.rows.one' : 'analysis.rows.other', { count: formatInteger(resultRows) }) }}</strong>
      </div>
      <div class="summary-metric">
        <span>{{ t('analysis.structure') }}</span>
        <strong>{{ structureSummary }}</strong>
      </div>
      <div v-if="bufferSummary" class="summary-metric summary-metric--buffers">
        <span>{{ t('analysis.buffers') }}</span>
        <strong>{{ bufferSummary }}</strong>
      </div>
      <div class="summary-metric" :class="{ 'summary-metric--attention': tips.length > 0 }">
        <span>{{ t('analysis.attention') }}</span>
        <strong>{{ tips.length }}</strong>
      </div>
      <div v-if="relationNames.length" class="summary-metric summary-metric--relations">
        <span>{{ t('analysis.relations') }}</span>
        <div>
          <code v-for="relation in relationNames" :key="relation">{{ relation }}</code>
        </div>
      </div>
    </section>

    <div class="analysis-workspace">
      <section class="graph-pane" aria-labelledby="graph-title">
        <header class="graph-pane__header">
          <div>
            <h1 id="graph-title">{{ t('analysis.flowTitle') }}</h1>
            <p>{{ t('analysis.flowLead') }}</p>
          </div>
          <span class="graph-direction">{{ t('analysis.direction') }}</span>
        </header>

        <div class="graph-canvas">
          <PlanTree
            :plan="root"
            :selected-id="selectedNode.id"
            :attention-node-ids="attentionNodeIds"
            @select="selectedNode = $event"
          />
        </div>

        <footer class="graph-legend" :aria-label="t('analysis.legendAria')">
          <span><i class="legend-time"></i> {{ t('analysis.inclusiveTime') }}</span>
          <span><i class="legend-attention"></i> {{ t('analysis.attentionPoint') }}</span>
          <span><i class="legend-selected"></i> {{ t('analysis.selectedOperator') }}</span>
        </footer>
      </section>

      <aside class="node-inspector" aria-labelledby="inspector-title">
        <section class="inspector-section inspector-introduction">
          <p class="inspector-label">{{ t('analysis.selectedOperatorLabel') }}</p>
          <h2 id="inspector-title">
            {{ selectedNode.type }}
            <template v-if="selectedNode.relation">{{ t('analysis.inRelation') }} <code>{{ selectedNode.relation }}</code></template>
          </h2>
          <p>{{ describePlanNode(selectedNode) }}</p>
        </section>

        <section class="inspector-section">
          <div class="inspector-section__heading">
            <h3>{{ t('analysis.executionMetrics') }}</h3>
            <RouterLink
              :to="{ name: 'learning-article', params: { slug: 'metricas-essenciais' } }"
            >
              {{ t('analysis.howToRead') }}
            </RouterLink>
          </div>
          <dl class="metrics-grid">
            <div v-if="selectedExaminedRows !== null">
              <dt>{{ t('analysis.examined') }}</dt>
              <dd>{{ formatInteger(selectedExaminedRows) }}</dd>
            </div>
            <div>
              <dt>{{ t('analysis.produced') }}</dt>
              <dd>{{ formatInteger(accumulatedRows(selectedNode)) }}</dd>
            </div>
            <div v-if="selectedReceivedRows !== null">
              <dt>{{ t('analysis.received') }}</dt>
              <dd>{{ formatInteger(selectedReceivedRows) }}</dd>
            </div>
            <div v-if="selectedDiscardedRows !== null">
              <dt>{{ t('analysis.discarded') }}</dt>
              <dd class="metric-attention">{{ formatInteger(selectedDiscardedRows) }}</dd>
            </div>
            <div>
              <dt>{{ t('analysis.executions') }}</dt>
              <dd>{{ formatInteger(selectedNode.metrics.loops) }}</dd>
            </div>
            <div>
              <dt>{{ t('analysis.accumulatedTime') }}</dt>
              <dd>{{ formatTime(selectedAccumulatedTime) }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="selectedTip" class="attention-panel">
          <div class="attention-panel__heading">
            <span aria-hidden="true">
              <PhWarningCircle :size="31" weight="duotone" />
            </span>
            <div>
              <p class="inspector-label">{{ t('analysis.attentionPoint') }}</p>
              <h3>{{ selectedTip.title }}</h3>
            </div>
          </div>

          <dl class="attention-structure">
            <div>
              <dt>{{ t('analysis.whatPlanShowed') }}</dt>
              <dd>{{ selectedTip.evidence }}</dd>
            </div>
            <div>
              <dt>{{ t('analysis.howToRead') }}</dt>
              <dd>{{ selectedTip.interpretation }}</dd>
            </div>
            <div>
              <dt>{{ t('analysis.nextStep') }}</dt>
              <dd>
                {{ selectedTip.suggestion.prefix }}<ElPopover
                  placement="top"
                  trigger="hover"
                  :teleported="false"
                  :width="340"
                >
                  <template #reference>
                    <button class="technical-term" type="button">
                      {{ selectedTip.suggestion.technicalTerm }}
                    </button>
                  </template>
                  <strong>{{ selectedTip.suggestion.technicalTerm }}</strong>
                  <p>{{ selectedTip.suggestion.explanation }}</p>
                  <RouterLink
                    class="technical-term-glossary-link"
                    :to="{
                      name: 'glossary',
                      hash: `#${selectedTip.suggestion.glossaryId}`,
                    }"
                  >
                    {{ t('glossary.viewTerm') }}
                  </RouterLink>
                </ElPopover>{{ selectedTip.suggestion.suffix }}
              </dd>
            </div>
            <div>
              <dt>{{ t('analysis.howToConfirm') }}</dt>
              <dd>{{ selectedTip.validation }}</dd>
            </div>
          </dl>

          <p class="heuristic-limit">
            {{ t('analysis.heuristicLimit') }}
          </p>
          <RouterLink
            class="heuristic-learning-link"
            :to="{
              name: 'learning-article',
              params: { slug: 'heuristicas-nao-sao-diagnosticos' },
            }"
          >
            {{ t('analysis.learnHeuristic') }}
          </RouterLink>
          <ElLink
            :href="selectedTip.documentation.url"
            target="_blank"
            rel="noopener noreferrer"
            type="primary"
          >
            {{ selectedTip.documentation.label }}
          </ElLink>
        </section>

        <ElCollapse class="advanced-metrics">
          <ElCollapseItem name="advanced" :title="t('analysis.advancedMetrics')">
            <dl>
              <div><dt>{{ t('analysis.estimate') }}</dt><dd>{{ formatInteger(selectedNode.metrics.estimatedRows) }}</dd></div>
              <div><dt>{{ t('analysis.timePerExecution') }}</dt><dd>{{ formatTime(selectedNode.metrics.totalTimeMs) }}</dd></div>
              <div v-if="selectedNode.indexName"><dt>{{ t('analysis.index') }}</dt><dd><code>{{ selectedNode.indexName }}</code></dd></div>
              <div v-if="selectedNode.filter"><dt>{{ t('analysis.filter') }}</dt><dd><code>{{ selectedNode.filter }}</code></dd></div>
              <div v-if="selectedNode.indexCondition"><dt>Index Cond</dt><dd><code>{{ selectedNode.indexCondition }}</code></dd></div>
              <div v-if="selectedNode.sortKeys"><dt>{{ t('analysis.sort') }}</dt><dd><code>{{ selectedNode.sortKeys.join(', ') }}</code></dd></div>
            </dl>
          </ElCollapseItem>
        </ElCollapse>
      </aside>
    </div>
  </main>
</template>
