<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy'
import {
  PhArrowCounterClockwise,
  PhCaretDown,
  PhCaretUp,
  PhCornersOut,
  PhMagnifyingGlassMinus,
  PhMagnifyingGlassPlus,
} from '@phosphor-icons/vue'
import type { PlanNode } from '../domain/plan'
import { useI18n } from '../i18n'

const props = withDefaults(
  defineProps<{
    plan: PlanNode
    selectedId: string
    attentionNodeIds?: string[]
  }>(),
  {
    attentionNodeIds: () => [],
  },
)

const emit = defineEmits<{
  select: [node: PlanNode]
}>()

const { locale, t } = useI18n()

const container = ref<HTMLElement | null>(null)
const viewport = ref<SVGSVGElement | null>(null)
const viewportWidth = ref(0)
const viewportHeight = ref(0)
const expandedIds = ref<Set<string>>(new Set())
const zoom = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)

const nodeWidth = 272
const compactNodeHeight = 126
const expandedNodeHeight = 260
const horizontalGap = 116
const verticalGap = 38
const paddingX = 64
const paddingY = 64
const minimumScale = 0.18
const maximumScale = 2.4

const rowFormatter = computed(() => new Intl.NumberFormat(locale.value))
const decimalFormatter = computed(
  () => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }),
)
const timeFormatter = computed(
  () => new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)

let resizeObserver: ResizeObserver | null = null
let dragOrigin: { clientX: number; clientY: number; x: number; y: number } | null = null
let hasInitialFit = false

onMounted(() => {
  if (!container.value) return

  resizeObserver = new ResizeObserver(([entry]) => {
    viewportWidth.value = entry?.contentRect.width ?? 0
    viewportHeight.value = entry?.contentRect.height ?? 0

    if (!hasInitialFit && viewportWidth.value > 0 && viewportHeight.value > 0) {
      hasInitialFit = true
      void nextTick(fitToView)
    }
  })
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

watch(
  () => props.plan,
  () => {
    expandedIds.value = new Set()
    hasInitialFit = false
    void nextTick(() => {
      hasInitialFit = true
      fitToView()
    })
  },
)

const attentionIds = computed(() => new Set(props.attentionNodeIds))

function nodeHeight(node: PlanNode): number {
  return expandedIds.value.has(node.id) ? expandedNodeHeight : compactNodeHeight
}

const layout = computed(() => {
  const root = hierarchy(props.plan, (node) => node.children)
  const positionedRoot = tree<PlanNode>()
    .nodeSize([1, 1])
    .separation(
      (first, second) =>
        (nodeHeight(first.data) + nodeHeight(second.data)) / 2 +
        (first.parent === second.parent ? verticalGap : verticalGap * 1.35),
    )(root)
  const positionedNodes = positionedRoot.descendants()
  const maximumDepth = Math.max(...positionedNodes.map((node) => node.depth))
  const minimumTreeY = Math.min(
    ...positionedNodes.map((node) => node.x - nodeHeight(node.data) / 2),
  )
  const maximumTreeY = Math.max(
    ...positionedNodes.map((node) => node.x + nodeHeight(node.data) / 2),
  )
  const width =
    (maximumDepth + 1) * nodeWidth + maximumDepth * horizontalGap + paddingX * 2
  const height = maximumTreeY - minimumTreeY + paddingY * 2
  const numberById = new Map(
    positionedNodes.map((node, index) => [node.data.id, index + 1]),
  )

  function point(node: HierarchyPointNode<PlanNode>) {
    return {
      x:
        paddingX +
        nodeWidth / 2 +
        (maximumDepth - node.depth) * (nodeWidth + horizontalGap),
      y: node.x - minimumTreeY + paddingY,
    }
  }

  return {
    width,
    height,
    nodes: positionedNodes.map((node) => ({
      node,
      number: numberById.get(node.data.id) ?? 0,
      ...point(node),
    })),
    links: positionedRoot.links().map((link) => ({
      parent: { node: link.source, ...point(link.source) },
      child: { node: link.target, ...point(link.target) },
    })),
  }
})

const viewportTransform = computed(
  () => `translate(${translateX.value} ${translateY.value}) scale(${zoom.value})`,
)
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`)
const planTime = computed(() => accumulatedTime(props.plan))

function accumulatedTime(node: PlanNode): number {
  return node.metrics.totalTimeMs * node.metrics.loops
}

function accumulatedRows(node: PlanNode): number {
  return node.metrics.actualRows * node.metrics.loops
}

function discardedRows(node: PlanNode): number | null {
  if (node.metrics.rowsRemovedByFilter === undefined) return null
  return node.metrics.rowsRemovedByFilter * node.metrics.loops
}

function timeRatio(node: PlanNode): number {
  if (planTime.value === 0) return 0
  return Math.min(1, accumulatedTime(node) / planTime.value)
}

function formatTimeValue(value: number): string {
  return value >= 1_000
    ? `${timeFormatter.value.format(value / 1_000)} s`
    : `${timeFormatter.value.format(value)} ms`
}

function formatTime(node: PlanNode): string {
  return formatTimeValue(accumulatedTime(node))
}

function formatTimeShare(node: PlanNode): string {
  if (planTime.value === 0) return '0%'
  return `${decimalFormatter.value.format((accumulatedTime(node) / planTime.value) * 100)}%`
}

function formatRows(node: PlanNode): string {
  const rows = accumulatedRows(node)
  return t(rows === 1 ? 'analysis.rows.one' : 'analysis.rows.other', {
    count: rowFormatter.value.format(rows),
  })
}

function formatCost(node: PlanNode): string {
  return node.metrics.totalCost === undefined
    ? t('tree.notReported')
    : decimalFormatter.value.format(node.metrics.totalCost)
}

function category(node: PlanNode): string {
  const labels: Record<PlanNode['kind'], string> = {
    control: t('tree.category.control'),
    join: t('tree.category.join'),
    operation: t('tree.category.operation'),
    scan: t('tree.category.scan'),
  }

  return labels[node.kind]
}

function subtitle(node: PlanNode): string {
  if (node.relation) return node.indexName ? `${node.relation} · ${node.indexName}` : node.relation
  if (node.indexName) return node.indexName
  if (node.joinType) return `${node.joinType} join`

  const descriptions: Record<string, string> = {
    Aggregate: t('tree.subtitle.aggregate'),
    'Hash Join': t('tree.subtitle.hashJoin'),
    Limit: t('tree.subtitle.limit'),
    'Merge Join': t('tree.subtitle.mergeJoin'),
    'Nested Loop': t('tree.subtitle.nestedLoop'),
    Result: t('tree.subtitle.result'),
    Sort: t('tree.subtitle.sort'),
  }

  return descriptions[node.type] ?? t('tree.subtitle.default')
}

function primaryCondition(node: PlanNode): string | null {
  const condition =
    node.indexCondition ??
    node.hashCondition ??
    node.mergeCondition ??
    node.recheckCondition ??
    node.joinFilter ??
    node.filter ??
    node.sortKeys?.join(', ')

  return condition ? truncate(condition, 44) : null
}

function truncate(value: string, maximumLength: number): string {
  return value.length <= maximumLength
    ? value
    : `${value.slice(0, maximumLength - 1)}…`
}

function topOf(node: PlanNode): number {
  return -nodeHeight(node) / 2
}

function compactBottom(node: PlanNode): number {
  return topOf(node) + compactNodeHeight
}

function linkPath(
  childX: number,
  childY: number,
  parentX: number,
  parentY: number,
): string {
  const startX = childX + nodeWidth / 2
  const endX = parentX - nodeWidth / 2
  const middleX = (startX + endX) / 2
  return `M ${startX} ${childY} C ${middleX} ${childY}, ${middleX} ${parentY}, ${endX} ${parentY}`
}

function select(node: PlanNode): void {
  emit('select', node)
}

function toggleExpanded(node: PlanNode): void {
  const next = new Set(expandedIds.value)
  if (next.has(node.id)) next.delete(node.id)
  else next.add(node.id)
  expandedIds.value = next
  select(node)
  void nextTick(fitToView)
}

function accessibleLabel(node: PlanNode): string {
  return `${node.type}, ${subtitle(node)}, ${formatRows(node)}, ${formatTime(node)}`
}

function clampScale(value: number): number {
  return Math.min(maximumScale, Math.max(minimumScale, value))
}

function fitToView(): void {
  if (viewportWidth.value <= 0 || viewportHeight.value <= 0) return

  const availableWidth = Math.max(1, viewportWidth.value - 80)
  const availableHeight = Math.max(1, viewportHeight.value - 80)
  const nextZoom = clampScale(
    Math.min(availableWidth / layout.value.width, availableHeight / layout.value.height, 1.25),
  )

  zoom.value = nextZoom
  translateX.value = (viewportWidth.value - layout.value.width * nextZoom) / 2
  translateY.value = (viewportHeight.value - layout.value.height * nextZoom) / 2
}

function resetZoom(): void {
  zoom.value = 1
  translateX.value = (viewportWidth.value - layout.value.width) / 2
  translateY.value = 32
}

function zoomBy(factor: number, originX = viewportWidth.value / 2, originY = viewportHeight.value / 2): void {
  const nextZoom = clampScale(zoom.value * factor)
  const worldX = (originX - translateX.value) / zoom.value
  const worldY = (originY - translateY.value) / zoom.value

  translateX.value = originX - worldX * nextZoom
  translateY.value = originY - worldY * nextZoom
  zoom.value = nextZoom
}

function onWheel(event: WheelEvent): void {
  const bounds = viewport.value?.getBoundingClientRect()
  if (!bounds) return

  zoomBy(
    event.deltaY < 0 ? 1.12 : 1 / 1.12,
    event.clientX - bounds.left,
    event.clientY - bounds.top,
  )
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return
  const target = event.target as Element
  if (target.closest('.plan-node')) return

  dragOrigin = {
    clientX: event.clientX,
    clientY: event.clientY,
    x: translateX.value,
    y: translateY.value,
  }
  isPanning.value = true
  viewport.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragOrigin) return
  translateX.value = dragOrigin.x + event.clientX - dragOrigin.clientX
  translateY.value = dragOrigin.y + event.clientY - dragOrigin.clientY
}

function endPan(event: PointerEvent): void {
  dragOrigin = null
  isPanning.value = false
  if (viewport.value?.hasPointerCapture(event.pointerId)) {
    viewport.value.releasePointerCapture(event.pointerId)
  }
}
</script>

<template>
  <div ref="container" class="plan-tree-container">
    <div class="plan-tree-toolbar" role="group" :aria-label="t('tree.controls')">
      <button type="button" :aria-label="t('tree.zoomOut')" :title="t('tree.zoomOut')" @click="zoomBy(1 / 1.2)">
        <PhMagnifyingGlassMinus :size="18" weight="bold" aria-hidden="true" />
      </button>
      <output aria-live="polite">{{ zoomLabel }}</output>
      <button type="button" :aria-label="t('tree.zoomIn')" :title="t('tree.zoomIn')" @click="zoomBy(1.2)">
        <PhMagnifyingGlassPlus :size="18" weight="bold" aria-hidden="true" />
      </button>
      <span aria-hidden="true"></span>
      <button type="button" :aria-label="t('tree.fit')" :title="t('tree.fit')" @click="fitToView">
        <PhCornersOut :size="18" weight="bold" aria-hidden="true" />
      </button>
      <button type="button" :aria-label="t('tree.reset')" :title="t('tree.reset')" @click="resetZoom">
        <PhArrowCounterClockwise :size="18" weight="bold" aria-hidden="true" />
      </button>
    </div>

    <p class="plan-tree-hint">{{ t('tree.hint') }}</p>

    <svg
      ref="viewport"
      class="plan-tree"
      :class="{ 'plan-tree--panning': isPanning }"
      :viewBox="`0 0 ${Math.max(viewportWidth, 1)} ${Math.max(viewportHeight, 1)}`"
      :aria-label="t('tree.aria')"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endPan"
      @pointercancel="endPan"
      @dblclick.self="fitToView"
    >
      <defs>
        <marker
          id="plan-flow-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path class="flow-arrow" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      <g :transform="viewportTransform">
        <g class="plan-links">
          <path
            v-for="link in layout.links"
            :key="`${link.child.node.data.id}-${link.parent.node.data.id}`"
            class="plan-link"
            marker-end="url(#plan-flow-arrow)"
            :d="linkPath(
              link.child.x,
              link.child.y,
              link.parent.x,
              link.parent.y,
            )"
          />

          <g
            v-for="link in layout.links"
            :key="`label-${link.child.node.data.id}-${link.parent.node.data.id}`"
            class="flow-label"
            :transform="`translate(${(link.child.x + link.parent.x) / 2}, ${(link.child.y + link.parent.y) / 2})`"
          >
            <rect x="-50" y="-12" width="100" height="24" rx="12" />
            <text text-anchor="middle" dominant-baseline="middle">
              {{ formatRows(link.child.node.data) }}
            </text>
          </g>
        </g>

        <g
          v-for="item in layout.nodes"
          :key="item.node.data.id"
          class="plan-node"
          :class="{
            'plan-node--selected': selectedId === item.node.data.id,
            'plan-node--attention': attentionIds.has(item.node.data.id),
            'plan-node--expanded': expandedIds.has(item.node.data.id),
          }"
          :transform="`translate(${item.x}, ${item.y})`"
          role="button"
          tabindex="0"
          :aria-label="accessibleLabel(item.node.data)"
          :aria-pressed="selectedId === item.node.data.id"
          :aria-expanded="expandedIds.has(item.node.data.id)"
          @click.stop="select(item.node.data)"
          @dblclick.stop="toggleExpanded(item.node.data)"
          @keydown.enter="select(item.node.data)"
          @keydown.space.prevent="select(item.node.data)"
        >
          <rect
            class="plan-node__surface"
            :x="-nodeWidth / 2"
            :y="topOf(item.node.data)"
            :width="nodeWidth"
            :height="nodeHeight(item.node.data)"
            rx="9"
          />
          <rect
            v-if="attentionIds.has(item.node.data.id)"
            class="plan-node__attention-rail"
            :x="-nodeWidth / 2"
            :y="topOf(item.node.data)"
            width="5"
            :height="nodeHeight(item.node.data)"
            rx="2.5"
          />

          <text class="plan-node__category" :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 21">
            #{{ item.number }} · {{ category(item.node.data) }}
          </text>
          <text
            v-if="attentionIds.has(item.node.data.id)"
            class="plan-node__attention-label"
            :x="nodeWidth / 2 - 43"
            :y="topOf(item.node.data) + 21"
            text-anchor="end"
          >
            ! {{ t('tree.attention') }}
          </text>
          <text class="plan-node__title" :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 49">
            {{ item.node.data.type }}
          </text>
          <text class="plan-node__subtitle" :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 72">
            {{ truncate(subtitle(item.node.data), 34) }}
          </text>
          <text class="plan-node__rows" :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 101">
            {{ formatRows(item.node.data) }}
          </text>
          <text class="plan-node__time" :x="nodeWidth / 2 - 16" :y="topOf(item.node.data) + 101" text-anchor="end">
            {{ formatTime(item.node.data) }} · {{ formatTimeShare(item.node.data) }}
          </text>

          <rect
            class="plan-node__time-track"
            :x="-nodeWidth / 2"
            :y="compactBottom(item.node.data) - 5"
            :width="nodeWidth"
            height="5"
          />
          <rect
            class="plan-node__time-value"
            :x="-nodeWidth / 2"
            :y="compactBottom(item.node.data) - 5"
            :width="Math.max(4, nodeWidth * timeRatio(item.node.data))"
            height="5"
          />

          <g
            class="plan-node__expand"
            role="button"
            tabindex="0"
            :aria-label="expandedIds.has(item.node.data.id) ? t('tree.collapse') : t('tree.expand')"
            :transform="`translate(${nodeWidth / 2 - 22}, ${topOf(item.node.data) + 43})`"
            @click.stop="toggleExpanded(item.node.data)"
            @keydown.enter.stop="toggleExpanded(item.node.data)"
            @keydown.space.prevent.stop="toggleExpanded(item.node.data)"
          >
            <circle r="14" />
            <PhCaretUp v-if="expandedIds.has(item.node.data.id)" :size="14" weight="bold" x="-7" y="-7" aria-hidden="true" />
            <PhCaretDown v-else :size="14" weight="bold" x="-7" y="-7" aria-hidden="true" />
          </g>

          <g v-if="expandedIds.has(item.node.data.id)" class="plan-node__details">
            <text :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 151" class="plan-node__detail-label">{{ t('tree.estimatedPerExecution') }}</text>
            <text :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 170" class="plan-node__detail-value">
              {{ t(item.node.data.metrics.estimatedRows === 1 ? 'analysis.rows.one' : 'analysis.rows.other', { count: rowFormatter.format(item.node.data.metrics.estimatedRows) }) }}
            </text>
            <text x="8" :y="topOf(item.node.data) + 151" class="plan-node__detail-label">{{ t('tree.observedPerExecution') }}</text>
            <text x="8" :y="topOf(item.node.data) + 170" class="plan-node__detail-value">
              {{ t(item.node.data.metrics.actualRows === 1 ? 'analysis.rows.one' : 'analysis.rows.other', { count: rowFormatter.format(item.node.data.metrics.actualRows) }) }}
            </text>

            <text :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 198" class="plan-node__detail-label">{{ t('tree.loops') }}</text>
            <text :x="-nodeWidth / 2 + 16" :y="topOf(item.node.data) + 217" class="plan-node__detail-value">
              {{ rowFormatter.format(item.node.data.metrics.loops) }}
            </text>
            <text x="8" :y="topOf(item.node.data) + 198" class="plan-node__detail-label">
              {{ discardedRows(item.node.data) === null ? t('tree.totalCost') : t('tree.discarded') }}
            </text>
            <text x="8" :y="topOf(item.node.data) + 217" class="plan-node__detail-value">
              {{ discardedRows(item.node.data) === null
                ? formatCost(item.node.data)
                : rowFormatter.format(discardedRows(item.node.data) ?? 0) }}
            </text>

            <text
              v-if="primaryCondition(item.node.data)"
              :x="-nodeWidth / 2 + 16"
              :y="topOf(item.node.data) + 241"
              class="plan-node__condition"
            >
              {{ primaryCondition(item.node.data) }}
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
