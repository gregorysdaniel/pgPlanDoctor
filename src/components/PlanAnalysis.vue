<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'
import { computed, ref, watch } from 'vue'
import { ElCollapse, ElCollapseItem, ElLink, ElPopover } from 'element-plus'
import PlanTree from './PlanTree.vue'
import { evaluatePlan } from '../domain/heuristics'
import type { PlanNode } from '../domain/plan'

const props = defineProps<{
  plan: PlanNode
}>()

const integerFormatter = new Intl.NumberFormat('pt-BR')
const timeFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const tips = computed(() => evaluatePlan(props.plan))
const attentionNodeIds = computed(() => [...new Set(tips.value.map((tip) => tip.node.id))])
const selectedNode = ref<PlanNode>(tips.value[0]?.node ?? props.plan)
const selectedTip = computed(() => tips.value.find((tip) => tip.node.id === selectedNode.value.id))

watch(
  () => props.plan,
  (plan) => {
    selectedNode.value = evaluatePlan(plan)[0]?.node ?? plan
  },
)

const planTime = computed(() => accumulatedTime(props.plan))
const resultRows = computed(() => accumulatedRows(props.plan))
const relationNames = computed(() => {
  const relations = new Set<string>()

  function visit(node: PlanNode): void {
    if (node.relation) relations.add(node.relation)
    node.children?.forEach(visit)
  }

  visit(props.plan)
  return [...relations]
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

function formatInteger(value: number): string {
  return integerFormatter.format(value)
}

function formatTime(value: number): string {
  return value >= 1_000
    ? `${timeFormatter.format(value / 1_000)} s`
    : `${timeFormatter.format(value)} ms`
}
</script>

<template>
  <main class="analysis-screen">
    <section class="analysis-summary" aria-label="Resumo da execução">
      <div class="summary-metric">
        <span>Tempo do plano</span>
        <strong>{{ formatTime(planTime) }}</strong>
      </div>
      <div class="summary-metric">
        <span>Resultado</span>
        <strong>{{ formatInteger(resultRows) }} {{ resultRows === 1 ? 'linha' : 'linhas' }}</strong>
      </div>
      <div class="summary-metric" :class="{ 'summary-metric--attention': tips.length > 0 }">
        <span>Pontos de atenção</span>
        <strong>{{ tips.length }}</strong>
      </div>
      <div v-if="relationNames.length" class="summary-metric summary-metric--relations">
        <span>Relações</span>
        <div>
          <code v-for="relation in relationNames" :key="relation">{{ relation }}</code>
        </div>
      </div>
    </section>

    <div class="analysis-workspace">
      <section class="graph-pane" aria-labelledby="graph-title">
        <header class="graph-pane__header">
          <div>
            <h1 id="graph-title">Fluxo de execução</h1>
            <p>As linhas seguem das operações à esquerda até o resultado à direita.</p>
          </div>
          <span class="graph-direction">dados → resultado</span>
        </header>

        <div class="graph-canvas">
          <PlanTree
            :plan="plan"
            :selected-id="selectedNode.id"
            :attention-node-ids="attentionNodeIds"
            @select="selectedNode = $event"
          />
        </div>

        <footer class="graph-legend" aria-label="Legenda do fluxo">
          <span><i class="legend-time"></i> tempo acumulado relativo</span>
          <span><i class="legend-attention"></i> ponto de atenção</span>
          <span><i class="legend-selected"></i> operador selecionado</span>
        </footer>
      </section>

      <aside class="node-inspector" aria-labelledby="inspector-title">
        <section class="inspector-section inspector-introduction">
          <p class="inspector-label">Operador selecionado</p>
          <h2 id="inspector-title">
            {{ selectedNode.type }}
            <template v-if="selectedNode.relation">em <code>{{ selectedNode.relation }}</code></template>
          </h2>
          <p>{{ selectedNode.description }}</p>
        </section>

        <section class="inspector-section">
          <div class="inspector-section__heading">
            <h3>Métricas da execução</h3>
            <RouterLink
              :to="{ name: 'learning-article', params: { slug: 'metricas-essenciais' } }"
            >
              Como ler
            </RouterLink>
          </div>
          <dl class="metrics-grid">
            <div v-if="selectedExaminedRows !== null">
              <dt>Examinadas</dt>
              <dd>{{ formatInteger(selectedExaminedRows) }}</dd>
            </div>
            <div>
              <dt>Produzidas</dt>
              <dd>{{ formatInteger(accumulatedRows(selectedNode)) }}</dd>
            </div>
            <div v-if="selectedReceivedRows !== null">
              <dt>Recebidas</dt>
              <dd>{{ formatInteger(selectedReceivedRows) }}</dd>
            </div>
            <div v-if="selectedDiscardedRows !== null">
              <dt>Descartadas</dt>
              <dd class="metric-attention">{{ formatInteger(selectedDiscardedRows) }}</dd>
            </div>
            <div>
              <dt>Execuções</dt>
              <dd>{{ formatInteger(selectedNode.metrics.loops) }}</dd>
            </div>
            <div>
              <dt>Tempo acumulado</dt>
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
              <p class="inspector-label">Ponto de atenção</p>
              <h3>{{ selectedTip.title }}</h3>
            </div>
          </div>

          <dl class="attention-structure">
            <div>
              <dt>O que o plano mostrou</dt>
              <dd>{{ selectedTip.evidence }}</dd>
            </div>
            <div>
              <dt>Como ler</dt>
              <dd>{{ selectedTip.interpretation }}</dd>
            </div>
            <div>
              <dt>Próximo passo</dt>
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
                </ElPopover>{{ selectedTip.suggestion.suffix }}
              </dd>
            </div>
            <div>
              <dt>Como confirmar</dt>
              <dd>{{ selectedTip.validation }}</dd>
            </div>
          </dl>

          <p class="heuristic-limit">
            Este sinal indica onde investigar; ele não determina sozinho qual alteração será melhor.
          </p>
          <RouterLink
            class="heuristic-learning-link"
            :to="{
              name: 'learning-article',
              params: { slug: 'heuristicas-nao-sao-diagnosticos' },
            }"
          >
            Entenda como interpretar uma heurística
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
          <ElCollapseItem name="advanced" title="Métricas avançadas">
            <dl>
              <div><dt>Estimativa</dt><dd>{{ formatInteger(selectedNode.metrics.estimatedRows) }}</dd></div>
              <div><dt>Tempo por execução</dt><dd>{{ formatTime(selectedNode.metrics.totalTimeMs) }}</dd></div>
              <div v-if="selectedNode.indexName"><dt>Índice</dt><dd><code>{{ selectedNode.indexName }}</code></dd></div>
              <div v-if="selectedNode.filter"><dt>Filtro</dt><dd><code>{{ selectedNode.filter }}</code></dd></div>
              <div v-if="selectedNode.indexCondition"><dt>Index Cond</dt><dd><code>{{ selectedNode.indexCondition }}</code></dd></div>
              <div v-if="selectedNode.sortKeys"><dt>Ordenação</dt><dd><code>{{ selectedNode.sortKeys.join(', ') }}</code></dd></div>
            </dl>
          </ElCollapseItem>
        </ElCollapse>
      </aside>
    </div>
  </main>
</template>
