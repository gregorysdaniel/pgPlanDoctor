<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElAlert, ElButton, ElCollapse, ElCollapseItem } from 'element-plus'

defineProps<{
  error: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  analyze: []
  useExample: []
}>()

const model = defineModel<string>({ required: true })
const gutter = ref<HTMLElement | null>(null)

const lineNumbers = computed(() => {
  const count = Math.max(20, model.value.split('\n').length)
  return Array.from({ length: count }, (_, index) => index + 1)
})

const hasContent = computed(() => model.value.trim().length > 0)

function synchronizeScroll(event: Event): void {
  if (!gutter.value) return
  gutter.value.scrollTop = (event.target as HTMLTextAreaElement).scrollTop
}
</script>

<template>
  <main class="input-screen">
    <div class="input-hero">
      <section class="input-copy" aria-labelledby="input-title">
        <p class="input-eyebrow">PostgreSQL · EXPLAIN ANALYZE</p>
        <h1 id="input-title">Analise um <mark>plano de execução.</mark></h1>
        <p class="input-lead">
          Cole a saída em JSON para visualizar os operadores, as linhas processadas e os pontos que merecem conferência.
        </p>

        <section class="analysis-scope" aria-labelledby="analysis-scope-title">
          <h2 id="analysis-scope-title">A análise apresenta</h2>
          <ul>
            <li>
              <span class="analysis-scope__symbol" aria-hidden="true">↔</span>
              <div>
                <strong>Fluxo de linhas</strong>
                <span>Quantidade produzida e descartada em cada operador.</span>
              </div>
            </li>
            <li>
              <span class="analysis-scope__symbol" aria-hidden="true">◷</span>
              <div>
                <strong>Tempo acumulado</strong>
                <span>Tempo por operador considerando o número de execuções.</span>
              </div>
            </li>
            <li>
              <span class="analysis-scope__symbol" aria-hidden="true">◎</span>
              <div>
                <strong>Pontos de atenção</strong>
                <span>Evidência, interpretação e uma forma de conferir cada sinal.</span>
              </div>
            </li>
          </ul>
        </section>

        <div class="safety-note">
          <span class="safety-note__icon" aria-hidden="true">!</span>
          <p>
            <strong>EXPLAIN ANALYZE executa a consulta.</strong>
            Revise comandos que alteram dados antes de gerar o plano.
          </p>
        </div>

        <ElCollapse id="como-gerar" class="input-help">
          <ElCollapseItem name="postgresql">
            <template #title>Gerar o JSON no PostgreSQL</template>
            <p>Adicione o comando antes da consulta:</p>
            <code>EXPLAIN (ANALYZE, FORMAT JSON)</code>
          </ElCollapseItem>
        </ElCollapse>
      </section>

      <section class="plan-editor" aria-label="Editor do plano de execução">
        <header class="plan-editor__header">
          <div class="plan-editor__identity">
            <span aria-hidden="true">{ }</span>
            <div>
              <strong>Plano em JSON</strong>
              <small>EXPLAIN ANALYZE</small>
            </div>
          </div>
          <span class="format-badge">PostgreSQL</span>
        </header>

        <div class="code-editor">
          <div ref="gutter" class="code-editor__gutter" aria-hidden="true">
            <span v-for="line in lineNumbers" :key="line">{{ line }}</span>
          </div>
          <textarea
            v-model="model"
            class="code-editor__textarea"
            aria-label="Plano de execução em JSON"
            placeholder="Cole aqui a saída de EXPLAIN (ANALYZE, FORMAT JSON)..."
            spellcheck="false"
            @scroll="synchronizeScroll"
            @keydown.ctrl.enter.prevent="emit('analyze')"
          ></textarea>
        </div>

        <footer class="plan-editor__footer">
          <span class="editor-status" :class="{ 'editor-status--ready': hasContent }">
            <span aria-hidden="true"></span>
            {{ hasContent ? 'JSON pronto para análise' : 'Aguardando o plano em JSON' }}
          </span>

          <div class="plan-editor__actions">
            <ElButton @click="emit('useExample')">Usar exemplo</ElButton>
            <ElButton
              type="primary"
              :disabled="!hasContent"
              :loading="loading"
              @click="emit('analyze')"
            >
              Analisar plano
            </ElButton>
          </div>
        </footer>

        <ElAlert
          v-if="error"
          class="parse-error"
          :closable="false"
          :title="error"
          type="error"
          show-icon
        />
      </section>
    </div>
  </main>
</template>
