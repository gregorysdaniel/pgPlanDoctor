<script setup lang="ts">
import { PhArrowLeft, PhSidebarSimple, PhX } from '@phosphor-icons/vue'
import { computed, ref, watch } from 'vue'
import { ElLink, ElPopover } from 'element-plus'
import PlanTree from './PlanTree.vue'
import { evaluatePlan, type HeuristicTip } from '../domain/heuristics'
import type { ExplainPlan, PlanNode } from '../domain/plan'
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

const tree = ref<InstanceType<typeof PlanTree> | null>(null)
const toolsOpen = ref(true)

const root = computed(() => props.plan.root)
const tips = computed(() => evaluatePlan(root.value))
const attentionNodeIds = computed(() => [...new Set(tips.value.map((tip) => tip.node.id))])
const selectedNode = ref<PlanNode>(root.value)
const selectedTipId = ref<string | null>(null)
const selectedTip = computed(
  () => tips.value.find((tip) => tip.id === selectedTipId.value) ?? null,
)

watch(
  root,
  (plan) => {
    selectedNode.value = plan
    selectedTipId.value = null
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

function tipNodeLabel(tip: HeuristicTip): string {
  return tip.node.relation ? `${tip.node.type} · ${tip.node.relation}` : tip.node.type
}

function selectNode(node: PlanNode): void {
  selectedNode.value = node
  selectedTipId.value = tips.value.find((tip) => tip.node.id === node.id)?.id ?? null
}

function selectTip(tip: HeuristicTip): void {
  selectedNode.value = tip.node
  selectedTipId.value = tip.id
  tree.value?.focusNode(tip.node.id)
}

function toggleTools(): void {
  toolsOpen.value = !toolsOpen.value
}

</script>

<template>
  <main class="analysis-screen">
    <div class="analysis-workspace" :class="{ 'analysis-workspace--tools-collapsed': !toolsOpen }">
      <section class="graph-pane" aria-labelledby="graph-title">
        <header class="graph-pane__header">
          <div class="graph-pane__title-row">
            <button
              v-if="!toolsOpen"
              class="analysis-tools-toggle"
              type="button"
              :aria-label="t('analysis.showTools')"
              :title="t('analysis.showTools')"
              @click="toggleTools"
            >
              <PhSidebarSimple :size="16" weight="bold" aria-hidden="true" />
              {{ t('analysis.showTools') }}
              <span>{{ tips.length }}</span>
            </button>
            <h1 id="graph-title">{{ t('analysis.flowTitle') }}</h1>
          </div>
          <span class="graph-direction">{{ t('analysis.direction') }}</span>
        </header>

        <div class="graph-canvas">
          <PlanTree
            ref="tree"
            :plan="root"
            :selected-id="selectedNode.id"
            :attention-node-ids="attentionNodeIds"
            @select="selectNode"
          />
        </div>

        <footer class="graph-legend" :aria-label="t('analysis.legendAria')">
          <div class="analysis-context-metrics" :aria-label="t('analysis.summaryAria')">
            <span><small>{{ t('analysis.execution') }}</small> {{ formatTime(executionTime) }}</span>
            <span>
              <small>{{ t('analysis.result') }}</small>
              {{ t(resultRows === 1 ? 'analysis.rows.one' : 'analysis.rows.other', { count: formatInteger(resultRows) }) }}
            </span>
            <span><small>{{ t('analysis.structure') }}</small> {{ structureSummary }}</span>
            <span><small>{{ t('analysis.attention') }}</small> {{ tips.length }}</span>
          </div>
          <div class="graph-legend__keys">
            <span><i class="legend-time"></i> {{ t('analysis.inclusiveTime') }}</span>
            <span><i class="legend-attention"></i> {{ t('analysis.attentionPoint') }}</span>
            <span><i class="legend-selected"></i> {{ t('analysis.selectedOperator') }}</span>
          </div>
        </footer>
      </section>

      <aside
        v-if="toolsOpen"
        class="analysis-tools"
        :aria-label="selectedTip ? t('analysis.tipDetailTitle') : t('analysis.toolsTitle')"
      >
        <header class="analysis-tools__header">
          <button
            v-if="selectedTip"
            class="analysis-tools__back"
            type="button"
            @click="selectedTipId = null"
          >
            <PhArrowLeft :size="16" weight="bold" aria-hidden="true" />
            {{ t('analysis.backToTips') }}
          </button>
          <div v-else class="analysis-tools__title-row">
            <h2>{{ t('analysis.toolsTitle') }}</h2>
            <span class="analysis-tips__count">{{ tips.length }}</span>
          </div>
          <button
            class="analysis-tools__close"
            type="button"
            :aria-label="t('analysis.hideTools')"
            :title="t('analysis.hideTools')"
            @click="toggleTools"
          >
            <PhX :size="15" weight="bold" aria-hidden="true" />
          </button>
        </header>

        <section v-if="!selectedTip" class="analysis-tips" :aria-label="t('analysis.tipsTitle')">
          <p v-if="tips.length === 0" class="analysis-tips__empty">{{ t('analysis.noTips') }}</p>
          <ol v-else class="analysis-tip-list">
            <li v-for="tip in tips" :key="tip.id">
              <button
                type="button"
                @click="selectTip(tip)"
              >
                <span class="analysis-tip-list__heading">
                  <strong>{{ tip.title }}</strong>
                  <em>{{ tip.metric }}</em>
                </span>
                <span class="analysis-tip-list__node">{{ tipNodeLabel(tip) }}</span>
                <p>{{ tip.evidence }}</p>
              </button>
            </li>
          </ol>
        </section>

        <section v-if="selectedTip" class="analysis-tip-detail">
          <p class="analysis-tip-detail__node">{{ tipNodeLabel(selectedTip) }}</p>
          <h3>{{ selectedTip.title }}</h3>

          <dl class="analysis-tip-structure">
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
                  :width="320"
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

          <p class="heuristic-limit">{{ t('analysis.heuristicLimit') }}</p>
          <div class="analysis-tip-detail__links">
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
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>
