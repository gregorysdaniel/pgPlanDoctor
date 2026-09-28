<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ElAlert,
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElInput,
  ElLink,
  ElPopover,
  ElTag,
} from 'element-plus'
import PlanTree from './components/PlanTree.vue'
import { explainAnalyzeOutput, planData } from './data/planData'
import { evaluatePlan } from './domain/heuristics'
import { parseExplainJson, PlanParseError } from './domain/planParser'
import type { PlanNode } from './domain/plan'

const explainInput = ref(explainAnalyzeOutput)
const loadedPlan = ref<PlanNode>(planData)
const selectedNode = ref<PlanNode>(planData)
const parseError = ref<string | null>(null)

const selectedAccumulatedTime = computed(
  () => selectedNode.value.metrics.totalTimeMs * selectedNode.value.metrics.loops,
)
const selectedReceivedRows = computed(() => {
  if (!selectedNode.value.children?.length) return null

  return selectedNode.value.children.reduce(
    (total, child) => total + child.metrics.actualRows * child.metrics.loops,
    0,
  )
})
const selectedExaminedRows = computed(() => {
  const removedRows = selectedNode.value.metrics.rowsRemovedByFilter
  if (removedRows === undefined) return null

  return selectedNode.value.metrics.actualRows + removedRows
})
const tips = computed(() => evaluatePlan(loadedPlan.value))

function loadPlan(): void {
  try {
    const parsedPlan = parseExplainJson(explainInput.value)

    loadedPlan.value = parsedPlan
    selectedNode.value = parsedPlan
    parseError.value = null
  } catch (error) {
    parseError.value =
      error instanceof PlanParseError
        ? error.message
        : 'Não foi possível carregar o plano de execução.'
  }
}
</script>

<template>
  <main class="page">
    <header>
      <h1>Árvore de plano de execução</h1>
      <p>Visualização interativa de um plano de execução do PostgreSQL.</p>
    </header>

    <section class="content">
      <ElCard class="explain-card" shadow="never">
        <template #header>
          <strong>Entrada do EXPLAIN ANALYZE</strong>
        </template>

        <p class="explain-help">
          Cole abaixo o resultado completo de
          <code>EXPLAIN (ANALYZE, FORMAT JSON)</code>.
        </p>

        <ElInput
          v-model="explainInput"
          class="explain-input"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          :spellcheck="false"
          aria-label="Plano de execução em JSON"
        />

        <div class="explain-actions">
          <ElButton type="primary" @click="loadPlan">
            Carregar plano
          </ElButton>
        </div>

        <ElAlert
          v-if="parseError"
          class="parse-error"
          :closable="false"
          :title="parseError"
          type="error"
          show-icon
        />
      </ElCard>

      <ElCard class="tree-card" shadow="never">
        <template #header>
          <strong>Plano de execução</strong>
        </template>

        <PlanTree
          :plan="loadedPlan"
          :selected-id="selectedNode.id"
          @select="selectedNode = $event"
        />
      </ElCard>

      <aside class="sidebar">
        <ElCard class="details-card" shadow="never">
          <template #header>
            <strong>Nó selecionado</strong>
          </template>

          <h2>{{ selectedNode.type }}</h2>
          <p>{{ selectedNode.description }}</p>

          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="Relação">
              {{ selectedNode.relation ?? 'Não se aplica' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Linhas estimadas">
              {{ selectedNode.metrics.estimatedRows }}
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="selectedReceivedRows !== null" label="Linhas recebidas">
              {{ selectedReceivedRows }}
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="selectedExaminedRows !== null" label="Linhas examinadas">
              {{ selectedExaminedRows }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Linhas produzidas">
              {{ selectedNode.metrics.actualRows }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              v-if="selectedNode.metrics.rowsRemovedByFilter !== undefined"
              label="Linhas descartadas"
            >
              {{ selectedNode.metrics.rowsRemovedByFilter }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Loops">
              {{ selectedNode.metrics.loops }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Tempo por loop">
              {{ selectedNode.metrics.totalTimeMs }} ms
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Tempo acumulado">
              {{ selectedAccumulatedTime.toFixed(2) }} ms
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>

        <ElCard class="tips-card" shadow="never">
          <template #header>
            <strong>Dicas</strong>
          </template>

          <ElAlert
            v-for="tip in tips"
            :key="tip.id"
            :closable="false"
            type="warning"
            show-icon
          >
            <template #title>
              <span class="tip-title">
                {{ tip.title }}
                <ElTag size="small" type="warning" effect="plain">
                  {{ tip.node.type }} · {{ tip.node.relation }}
                </ElTag>
              </span>
            </template>

            <dl class="tip-structure">
              <div>
                <dt>Evidência</dt>
                <dd>{{ tip.evidence }}</dd>
              </div>

              <div>
                <dt>Interpretação</dt>
                <dd>{{ tip.interpretation }}</dd>
              </div>

              <div>
                <dt>Sugestão</dt>
                <dd>
                  {{ tip.suggestion.prefix }}<ElPopover
                    placement="top"
                    trigger="hover"
                    :width="320"
                  >
                    <template #reference>
                      <button class="technical-term" type="button">
                        {{ tip.suggestion.technicalTerm }}
                      </button>
                    </template>
                    <strong>O que é um {{ tip.suggestion.technicalTerm }}?</strong>
                    <p>{{ tip.suggestion.explanation }}</p>
                  </ElPopover>{{ tip.suggestion.suffix }}
                </dd>
              </div>

              <div>
                <dt>Como validar</dt>
                <dd>{{ tip.validation }}</dd>
              </div>
            </dl>

            <ElLink
              :href="tip.documentation.url"
              target="_blank"
              rel="noopener noreferrer"
              type="primary"
            >
              {{ tip.documentation.label }}
            </ElLink>
          </ElAlert>
        </ElCard>
      </aside>
    </section>
  </main>
</template>
