<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy'
import {
  PhArrowCounterClockwise,
  PhCornersOut,
  PhMagnifyingGlassMinus,
  PhMagnifyingGlassPlus,
  PhTextAa,
} from '@phosphor-icons/vue'
import type { PlanNode } from '../domain/plan'
import PlanNodeDetails from './PlanNodeDetails.vue'
import { useI18n } from '../i18n'

const props = withDefaults(
  defineProps<{
    plan: PlanNode
    selectedId: string
    attentionCounts?: Record<string, number>
  }>(),
  {
    attentionCounts: () => ({}),
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
const expandedHeights = ref<Map<string, number>>(new Map())
const zoom = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)

const nodeWidth = 232
const expandedNodeWidth = 420
const compactNodeHeight = 106
const expandedNodeHeight = 520
const horizontalGap = 44
const verticalGap = 18
const paddingX = 32
const paddingY = 40
const outputWidth = 192
const outputHeight = 80
const outputGap = 44
const minimumScale = 0.16
const readableMinimumScale = 0.95
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
let resizeAnchor: { id: string; x: number; y: number } | null = null

onMounted(() => {
  if (!container.value) return

  resizeObserver = new ResizeObserver(([entry]) => {
    viewportWidth.value = entry?.contentRect.width ?? 0
    viewportHeight.value = entry?.contentRect.height ?? 0

    if (!hasInitialFit && viewportWidth.value > 0 && viewportHeight.value > 0) {
      hasInitialFit = true
      void nextTick(fitForReading)
    }
  })
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

watch(
  () => props.plan,
  () => {
    expandedIds.value = new Set()
    expandedHeights.value = new Map()
    resizeAnchor = null
    hasInitialFit = false
    void nextTick(() => {
      hasInitialFit = true
      fitForReading()
    })
  },
)

function attentionCount(node: PlanNode): number {
  return props.attentionCounts[node.id] ?? 0
}

function nodeHeight(node: PlanNode): number {
  return expandedIds.value.has(node.id)
    ? expandedHeights.value.get(node.id) ?? expandedNodeHeight
    : compactNodeHeight
}

function widthOf(node: PlanNode): number {
  return expandedIds.value.has(node.id) ? expandedNodeWidth : nodeWidth
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
  const columnWidths = new Map<number, number>()
  for (const node of positionedNodes) {
    columnWidths.set(node.depth, Math.max(columnWidths.get(node.depth) ?? 0, widthOf(node.data)))
  }
  const columnCenters = new Map<number, number>()
  let nextColumnX = paddingX
  for (let depth = maximumDepth; depth >= 0; depth--) {
    const width = columnWidths.get(depth) ?? nodeWidth
    columnCenters.set(depth, nextColumnX + width / 2)
    nextColumnX += width + (depth === 0 ? 0 : horizontalGap)
  }
  const planWidth = nextColumnX + paddingX
  const height = maximumTreeY - minimumTreeY + paddingY * 2
  const numberById = new Map(
    positionedNodes.map((node, index) => [node.data.id, index + 1]),
  )

  function point(node: HierarchyPointNode<PlanNode>) {
    return {
      x: columnCenters.get(node.depth) ?? paddingX + nodeWidth / 2,
      y: node.x - minimumTreeY + paddingY,
    }
  }

  const rootPoint = point(positionedRoot)
  const output = {
    x: rootPoint.x + widthOf(props.plan) / 2 + outputGap + outputWidth / 2,
    y: rootPoint.y,
  }

  return {
    width: planWidth + outputGap + outputWidth,
    height,
    output,
    rootPoint,
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

function timeRatio(node: PlanNode): number {
  if (planTime.value === 0) return 0
  return Math.min(1, accumulatedTime(node) / planTime.value)
}

function timeBand(node: PlanNode): 'low' | 'medium' | 'high' | 'dominant' {
  const ratio = timeRatio(node)
  if (ratio < 0.1) return 'low'
  if (ratio < 0.3) return 'medium'
  if (ratio < 0.6) return 'high'
  return 'dominant'
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
  child: PlanNode,
  parent: PlanNode,
): string {
  const startX = childX + widthOf(child) / 2
  const endX = parentX - widthOf(parent) / 2
  const middleX = (startX + endX) / 2
  return `M ${startX} ${childY} C ${middleX} ${childY}, ${middleX} ${parentY}, ${endX} ${parentY}`
}

function select(node: PlanNode): void {
  emit('select', node)
}

function toggleExpanded(node: PlanNode): void {
  const positionBeforeChange = layout.value.nodes.find((item) => item.node.data.id === node.id)
  const next = new Set(expandedIds.value)
  if (next.has(node.id)) next.delete(node.id)
  else next.add(node.id)
  expandedIds.value = next
  select(node)
  void nextTick(() => {
    const positionAfterChange = layout.value.nodes.find((item) => item.node.data.id === node.id)
    if (!positionBeforeChange || !positionAfterChange) return

    translateX.value += (positionBeforeChange.x - positionAfterChange.x) * zoom.value
    translateY.value += (positionBeforeChange.y - positionAfterChange.y) * zoom.value
    const element = [...(viewport.value?.querySelectorAll<SVGElement>('.plan-node') ?? [])]
      .find(candidate => candidate.dataset.nodeId === node.id)
    if (next.has(node.id)) element?.querySelector<HTMLButtonElement>('.plan-node-inspector__toggle')?.focus({ preventScroll: true })
    else element?.focus({ preventScroll: true })
  })
}

function resizeExpanded(node: PlanNode, height: number): void {
  if (expandedHeights.value.get(node.id) === height) return
  const scheduleAnchor = resizeAnchor === null
  if (scheduleAnchor) {
    const selected = layout.value.nodes.find(item => item.node.data.id === props.selectedId)
    if (selected) resizeAnchor = { id: props.selectedId, x: selected.x, y: selected.y }
  }
  const next = new Map(expandedHeights.value)
  next.set(node.id, height)
  expandedHeights.value = next
  if (!scheduleAnchor || !resizeAnchor) return
  const before = resizeAnchor
  void nextTick(() => {
    if (resizeAnchor !== before) return
    resizeAnchor = null
    const after = layout.value.nodes.find(item => item.node.data.id === before.id)
    if (!after) return
    translateX.value += (before.x - after.x) * zoom.value
    translateY.value += (before.y - after.y) * zoom.value
  })
}

function accessibleLabel(node: PlanNode): string {
  const label = `${node.type}, ${subtitle(node)}, ${formatRows(node)}, ${formatTime(node)}`
  const count = attentionCount(node)
  return count > 0
    ? `${label}, ${t(count === 1 ? 'analysis.nodeTips.one' : 'analysis.nodeTips.other', { count })}`
    : label
}

function outputAccessibleLabel(): string {
  return `${t('tree.outputTitle')}, ${formatRows(props.plan)}`
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

function fitForReading(): void {
  if (viewportWidth.value <= 0 || viewportHeight.value <= 0) return

  const viewportPadding = 40
  const availableWidth = Math.max(1, viewportWidth.value - viewportPadding * 2)
  const availableHeight = Math.max(1, viewportHeight.value - viewportPadding * 2)
  const scaleToFit = Math.min(
    availableWidth / layout.value.width,
    availableHeight / layout.value.height,
    1.15,
  )
  const nextZoom = clampScale(Math.max(readableMinimumScale, scaleToFit))
  const renderedWidth = layout.value.width * nextZoom
  const renderedHeight = layout.value.height * nextZoom

  zoom.value = nextZoom
  translateX.value = renderedWidth <= availableWidth
    ? (viewportWidth.value - renderedWidth) / 2
    : viewportPadding
  translateY.value = renderedHeight <= availableHeight
    ? (viewportHeight.value - renderedHeight) / 2
    : viewportPadding
}

function focusNode(nodeId: string): void {
  const target = layout.value.nodes.find((item) => item.node.data.id === nodeId)
  if (!target || viewportWidth.value <= 0 || viewportHeight.value <= 0) return

  const nextZoom = Math.max(zoom.value, readableMinimumScale)
  zoom.value = nextZoom
  translateX.value = viewportWidth.value / 2 - target.x * nextZoom
  translateY.value = viewportHeight.value / 2 - target.y * nextZoom
}

function resetZoom(): void {
  zoom.value = 1
  translateX.value = layout.value.width <= viewportWidth.value - 64
    ? (viewportWidth.value - layout.value.width) / 2
    : 32
  translateY.value = layout.value.height <= viewportHeight.value - 64
    ? (viewportHeight.value - layout.value.height) / 2
    : 32
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

defineExpose({ focusNode })
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
      <button type="button" :aria-label="t('tree.readable')" :title="t('tree.readable')" @click="fitForReading">
        <PhTextAa :size="18" weight="bold" aria-hidden="true" />
      </button>
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
      :class="{
        'plan-tree--panning': isPanning,
      }"
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
              link.child.node.data,
              link.parent.node.data,
            )"
          />
          <path
            class="plan-link plan-output-link"
            marker-end="url(#plan-flow-arrow)"
            :d="`M ${layout.rootPoint.x + widthOf(plan) / 2} ${layout.rootPoint.y} L ${layout.output.x - outputWidth / 2} ${layout.output.y}`"
          />
        </g>

        <g
          v-for="item in layout.nodes"
          :key="item.node.data.id"
          class="plan-node"
          :data-node-id="item.node.data.id"
          :class="{
            'plan-node--selected': selectedId === item.node.data.id,
            'plan-node--attention': attentionCount(item.node.data) > 0,
            'plan-node--expanded': expandedIds.has(item.node.data.id),
          }"
          :transform="`translate(${item.x}, ${item.y})`"
          :role="expandedIds.has(item.node.data.id) ? 'group' : 'button'"
          :tabindex="expandedIds.has(item.node.data.id) ? undefined : 0"
          :aria-label="accessibleLabel(item.node.data)"
          :aria-pressed="expandedIds.has(item.node.data.id) ? undefined : selectedId === item.node.data.id"
          :aria-expanded="expandedIds.has(item.node.data.id) ? undefined : false"
          @click.stop="!expandedIds.has(item.node.data.id) && toggleExpanded(item.node.data)"
          @keydown.enter.prevent="!expandedIds.has(item.node.data.id) && toggleExpanded(item.node.data)"
          @keydown.space.prevent="!expandedIds.has(item.node.data.id) && toggleExpanded(item.node.data)"
        >
          <rect
            class="plan-node__surface"
            :x="-widthOf(item.node.data) / 2"
            :y="topOf(item.node.data)"
            :width="widthOf(item.node.data)"
            :height="nodeHeight(item.node.data)"
            rx="4"
          />
          <rect
            v-if="attentionCount(item.node.data) > 0"
            class="plan-node__attention-rail"
            :x="-widthOf(item.node.data) / 2"
            :y="topOf(item.node.data)"
            width="4"
            :height="nodeHeight(item.node.data)"
            rx="2"
          />

          <template v-if="!expandedIds.has(item.node.data.id)">
          <text class="plan-node__category" :x="-nodeWidth / 2 + 13" :y="topOf(item.node.data) + 18">
            #{{ item.number }}
          </text>
          <text
            v-if="attentionCount(item.node.data) > 0"
            class="plan-node__attention-label"
            :x="nodeWidth / 2 - 13"
            :y="topOf(item.node.data) + 18"
            text-anchor="end"
          >
            ! {{ attentionCount(item.node.data) }} {{ t('tree.attention') }}
          </text>
          <text class="plan-node__title" :x="-nodeWidth / 2 + 13" :y="topOf(item.node.data) + 43">
            {{ truncate(item.node.data.type, 25) }}
          </text>
          <text class="plan-node__subtitle" :x="-nodeWidth / 2 + 13" :y="topOf(item.node.data) + 65">
            {{ truncate(subtitle(item.node.data), 28) }}
          </text>
          <text class="plan-node__rows" :x="-nodeWidth / 2 + 13" :y="topOf(item.node.data) + 89">
            {{ formatRows(item.node.data) }}
          </text>
          <text class="plan-node__time" :x="nodeWidth / 2 - 13" :y="topOf(item.node.data) + 89" text-anchor="end">
            <tspan>{{ formatTime(item.node.data) }} · </tspan>
            <tspan :class="`plan-node__time-share plan-node__time-share--${timeBand(item.node.data)}`">
              {{ formatTimeShare(item.node.data) }}
            </tspan>
          </text>

          <rect
            class="plan-node__time-track"
            :x="-nodeWidth / 2"
            :y="compactBottom(item.node.data) - 4"
            :width="nodeWidth"
            height="4"
          />
          <rect
            :class="`plan-node__time-value plan-node__time-value--${timeBand(item.node.data)}`"
            :x="-nodeWidth / 2"
            :y="compactBottom(item.node.data) - 4"
            :width="Math.max(3, nodeWidth * timeRatio(item.node.data))"
            height="4"
          />

          </template>

          <foreignObject
            v-if="expandedIds.has(item.node.data.id)"
            :x="-expandedNodeWidth / 2"
            :y="topOf(item.node.data)"
            :width="expandedNodeWidth"
            :height="nodeHeight(item.node.data)"
          >
            <PlanNodeDetails
              :node="item.node.data"
              :number="item.number"
              :attention-count="attentionCount(item.node.data)"
              :time-share="formatTimeShare(item.node.data)"
              @toggle="toggleExpanded(item.node.data)"
              @select="select(item.node.data)"
              @resize="resizeExpanded(item.node.data, $event)"
            />
          </foreignObject>
        </g>

        <g
          class="plan-output"
          :transform="`translate(${layout.output.x}, ${layout.output.y})`"
          role="img"
          :aria-label="outputAccessibleLabel()"
        >
          <rect
            class="plan-output__surface"
            :x="-outputWidth / 2"
            :y="-outputHeight / 2"
            :width="outputWidth"
            :height="outputHeight"
            rx="7"
          />
          <text class="plan-output__title" :x="-outputWidth / 2 + 13" y="-4">
            {{ t('tree.outputTitle') }}
          </text>
          <text class="plan-output__rows" :x="-outputWidth / 2 + 13" y="19">
            {{ formatRows(plan) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>
