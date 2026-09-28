<script setup lang="ts">
import { computed } from 'vue'
import { hierarchy, tree } from 'd3-hierarchy'
import type { PlanNode } from '../domain/plan'

const props = defineProps<{
  plan: PlanNode
  selectedId: string
}>()

const emit = defineEmits<{
  select: [node: PlanNode]
}>()

const width = 760
const height = 500
const nodeWidth = 160
const nodeHeight = 82
const timeFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const rowFormatter = new Intl.NumberFormat('pt-BR')

// Converte o plano recebido em uma hierarquia e usa o D3 para calcular a
// posição (x, y) de cada nó. O D3 não desenha a árvore: o SVG do template
// abaixo usa essas coordenadas para renderizar os nós e as ligações.
const layout = computed(() => {
  const root = hierarchy(props.plan, (node) => node.children)
  return tree<PlanNode>().size([width - nodeWidth, height - nodeHeight])(root)
})

// Encontra o maior tempo acumulado da árvore para servir como referência na
// escala de cores: o nó mais demorado representa 100% da intensidade.
const maximumAccumulatedTime = computed(() =>
  Math.max(...layout.value.descendants().map((node) => accumulatedTime(node.data))),
)

// Calcula o tempo total gasto pelo nó considerando todas as suas execuções.
function accumulatedTime(node: PlanNode): number {
  return node.metrics.totalTimeMs * node.metrics.loops
}

// Retorna quanto o tempo do nó representa em relação ao nó mais demorado,
// em uma escala de 0 a 1 usada para gerar as cores do mapa de calor.
function heatRatio(node: PlanNode): number {
  return maximumAccumulatedTime.value === 0
    ? 0
    : accumulatedTime(node) / maximumAccumulatedTime.value
}

// Define a cor de fundo do nó: verde para tempos menores e vermelho para maiores.
function nodeFill(node: PlanNode): string {
  const hue = 120 * (1 - heatRatio(node))
  return `hsl(${hue} 82% 88%)`
}

// Define a cor da borda usando a mesma escala do fundo, mas em tom mais escuro.
function nodeStroke(node: PlanNode): string {
  const hue = 120 * (1 - heatRatio(node))
  return `hsl(${hue} 65% 38%)`
}

// Formata o tempo acumulado do nó em milissegundos no padrão brasileiro.
function formatTime(node: PlanNode): string {
  return `${timeFormatter.format(accumulatedTime(node))} ms`
}

// Calcula e formata quantas linhas o nó produziu somando todas as execuções.
function formatProducedRows(node: PlanNode): string {
  const rows = node.metrics.actualRows * node.metrics.loops
  return `${rowFormatter.format(rows)} ${rows === 1 ? 'linha' : 'linhas'}`
}

// Monta o comando SVG de uma curva cúbica entre dois nós da árvore.
function linkPath(sourceX: number, sourceY: number, targetX: number, targetY: number): string {
  const middleY = (sourceY + targetY) / 2
  return `M ${sourceX} ${sourceY} C ${sourceX} ${middleY}, ${targetX} ${middleY}, ${targetX} ${targetY}`
}
</script>

<template>
  <div class="plan-tree-container">
    <div class="tree-legends">
      <div class="heat-legend" aria-label="Escala de tempo acumulado">
        <span>Menor tempo</span>
        <span class="heat-legend__scale"></span>
        <span>Maior tempo</span>
      </div>
    </div>

    <svg :viewBox="`0 0 ${width} ${height}`" class="plan-tree" aria-label="Árvore do plano de execução">
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path class="flow-arrow" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      <g :transform="`translate(${nodeWidth / 2}, ${nodeHeight / 2})`">
        <path
          v-for="link in layout.links()"
          :key="`${link.source.data.id}-${link.target.data.id}`"
          class="plan-link"
          marker-end="url(#flow-arrow)"
          :d="linkPath(
            link.target.x,
            link.target.y - nodeHeight / 2,
            link.source.x,
            link.source.y + nodeHeight / 2,
          )"
        />

        <text
          v-for="link in layout.links()"
          :key="`flow-${link.source.data.id}-${link.target.data.id}`"
          class="flow-label"
          text-anchor="middle"
          dominant-baseline="middle"
          :x="(link.source.x + link.target.x) / 2"
          :y="(link.source.y + link.target.y) / 2"
        >
          {{ formatProducedRows(link.target.data) }}
        </text>

        <g
          v-for="node in layout.descendants()"
          :key="node.data.id"
          class="plan-node"
          :class="{ 'plan-node--selected': selectedId === node.data.id }"
          :transform="`translate(${node.x}, ${node.y})`"
          @click="emit('select', node.data)"
        >
          <rect
            :x="-nodeWidth / 2"
            :y="-nodeHeight / 2"
            :width="nodeWidth"
            :height="nodeHeight"
            :style="{ fill: nodeFill(node.data), stroke: nodeStroke(node.data) }"
            rx="12"
          />
          <text text-anchor="middle" y="-13" class="plan-node__title">
            {{ node.data.type }}
          </text>
          <text text-anchor="middle" y="7" class="plan-node__subtitle">
            {{ node.data.relation ?? `${node.data.metrics.actualRows} linhas` }}
          </text>
          <text text-anchor="middle" y="27" class="plan-node__time">
            {{ formatTime(node.data) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>
