<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy'
import type { PlanNode } from '../domain/plan'

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

const container = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const nodeWidth = 224
const nodeHeight = 112
const horizontalGap = 112
const verticalGap = 58
const paddingX = 52
const paddingY = 50
const minimumWidth = 920
const minimumHeight = 570

const rowFormatter = new Intl.NumberFormat('pt-BR')
const timeFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!container.value) return

  resizeObserver = new ResizeObserver(([entry]) => {
    containerWidth.value = entry?.contentRect.width ?? 0
  })
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const attentionIds = computed(() => new Set(props.attentionNodeIds))

const layout = computed(() => {
  const root = hierarchy(props.plan, (node) => node.children)
  const positionedRoot = tree<PlanNode>().nodeSize([nodeHeight + verticalGap, 1])(root)
  const positionedNodes = positionedRoot.descendants()
  const minimumTreeX = Math.min(...positionedNodes.map((node) => node.x))
  const maximumTreeX = Math.max(...positionedNodes.map((node) => node.x))
  const maximumDepth = Math.max(...positionedNodes.map((node) => node.depth))
  const naturalWidth =
    paddingX * 2 +
    (maximumDepth + 1) * nodeWidth +
    maximumDepth * horizontalGap
  const width = Math.max(minimumWidth, naturalWidth, containerWidth.value)
  const contentHeight = maximumTreeX - minimumTreeX + nodeHeight
  const height = Math.max(minimumHeight, contentHeight + paddingY * 2)
  const verticalOffset = (height - contentHeight) / 2 + nodeHeight / 2
  const depthStep = maximumDepth === 0
    ? 0
    : (width - paddingX * 2 - nodeWidth) / maximumDepth

  function point(node: HierarchyPointNode<PlanNode>) {
    return {
      x: paddingX + nodeWidth / 2 + (maximumDepth - node.depth) * depthStep,
      y: verticalOffset + node.x - minimumTreeX,
    }
  }

  return {
    width,
    height,
    nodes: positionedNodes.map((node) => ({ node, ...point(node) })),
    links: positionedRoot.links().map((link) => ({
      parent: { node: link.source, ...point(link.source) },
      child: { node: link.target, ...point(link.target) },
    })),
  }
})

const maximumAccumulatedTime = computed(() =>
  Math.max(
    0,
    ...layout.value.nodes.map(({ node }) => accumulatedTime(node.data)),
  ),
)

function accumulatedTime(node: PlanNode): number {
  return node.metrics.totalTimeMs * node.metrics.loops
}

function accumulatedRows(node: PlanNode): number {
  return node.metrics.actualRows * node.metrics.loops
}

function timeRatio(node: PlanNode): number {
  if (maximumAccumulatedTime.value === 0) return 0
  return accumulatedTime(node) / maximumAccumulatedTime.value
}

function formatTime(node: PlanNode): string {
  const value = accumulatedTime(node)
  return value >= 1_000
    ? `${timeFormatter.format(value / 1_000)} s`
    : `${timeFormatter.format(value)} ms`
}

function formatRows(node: PlanNode): string {
  const rows = accumulatedRows(node)
  return `${rowFormatter.format(rows)} ${rows === 1 ? 'linha' : 'linhas'}`
}

function category(node: PlanNode): string {
  const labels: Record<PlanNode['kind'], string> = {
    control: 'CONTROLE',
    join: 'JUNÇÃO',
    operation: 'OPERAÇÃO',
    scan: 'LEITURA',
  }

  return labels[node.kind]
}

function subtitle(node: PlanNode): string {
  if (node.relation) return node.relation
  if (node.indexName) return node.indexName

  const descriptions: Record<string, string> = {
    Aggregate: 'resume as linhas recebidas',
    'Hash Join': 'combina dois ramos',
    Limit: 'limita o resultado',
    'Merge Join': 'combina ramos ordenados',
    'Nested Loop': 'repete a busca interna',
    Result: 'produz o resultado',
    Sort: 'ordena as linhas',
  }

  return descriptions[node.type] ?? 'processa as linhas recebidas'
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

function accessibleLabel(node: PlanNode): string {
  return `${node.type}, ${subtitle(node)}, ${formatRows(node)}, ${formatTime(node)}`
}
</script>

<template>
  <div ref="container" class="plan-tree-container">
    <svg
      class="plan-tree"
      :width="layout.width"
      :height="layout.height"
      :viewBox="`0 0 ${layout.width} ${layout.height}`"
      aria-label="Fluxo do plano de execução"
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

      <g class="plan-links">
        <path
          v-for="link in layout.links"
          :key="`${link.child.node.data.id}-${link.parent.node.data.id}`"
          class="plan-link"
          marker-end="url(#plan-flow-arrow)"
          :d="linkPath(link.child.x, link.child.y, link.parent.x, link.parent.y)"
        />

        <g
          v-for="link in layout.links"
          :key="`label-${link.child.node.data.id}-${link.parent.node.data.id}`"
          class="flow-label"
          :transform="`translate(${(link.child.x + link.parent.x) / 2}, ${(link.child.y + link.parent.y) / 2})`"
        >
          <rect x="-50" y="-13" width="100" height="26" rx="13" />
          <text text-anchor="middle" dominant-baseline="middle">
            {{ rowFormatter.format(accumulatedRows(link.child.node.data)) }} linhas
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
        }"
        :transform="`translate(${item.x}, ${item.y})`"
        role="button"
        tabindex="0"
        :aria-label="accessibleLabel(item.node.data)"
        :aria-pressed="selectedId === item.node.data.id"
        @click="select(item.node.data)"
        @keydown.enter="select(item.node.data)"
        @keydown.space.prevent="select(item.node.data)"
      >
        <rect
          class="plan-node__surface"
          :x="-nodeWidth / 2"
          :y="-nodeHeight / 2"
          :width="nodeWidth"
          :height="nodeHeight"
          rx="9"
        />
        <rect
          v-if="attentionIds.has(item.node.data.id)"
          class="plan-node__attention-rail"
          :x="-nodeWidth / 2"
          :y="-nodeHeight / 2"
          width="5"
          :height="nodeHeight"
          rx="2.5"
        />

        <text class="plan-node__category" :x="-nodeWidth / 2 + 16" y="-35">
          {{ category(item.node.data) }}
        </text>
        <text
          v-if="attentionIds.has(item.node.data.id)"
          class="plan-node__attention-label"
          :x="nodeWidth / 2 - 16"
          y="-35"
          text-anchor="end"
        >
          ! ATENÇÃO
        </text>
        <text class="plan-node__title" :x="-nodeWidth / 2 + 16" y="-8">
          {{ item.node.data.type }}
        </text>
        <text class="plan-node__subtitle" :x="-nodeWidth / 2 + 16" y="14">
          {{ subtitle(item.node.data) }}
        </text>
        <text class="plan-node__rows" :x="-nodeWidth / 2 + 16" y="41">
          {{ formatRows(item.node.data) }}
        </text>
        <text class="plan-node__time" :x="nodeWidth / 2 - 16" y="41" text-anchor="end">
          {{ formatTime(item.node.data) }}
        </text>

        <rect
          class="plan-node__time-track"
          :x="-nodeWidth / 2"
          :y="nodeHeight / 2 - 5"
          :width="nodeWidth"
          height="5"
        />
        <rect
          class="plan-node__time-value"
          :x="-nodeWidth / 2"
          :y="nodeHeight / 2 - 5"
          :width="Math.max(4, nodeWidth * timeRatio(item.node.data))"
          height="5"
        />

        <text
          v-if="selectedId === item.node.data.id"
          class="plan-node__selected-label"
          y="76"
          text-anchor="middle"
        >
          EM INSPEÇÃO
        </text>
      </g>
    </svg>
  </div>
</template>
