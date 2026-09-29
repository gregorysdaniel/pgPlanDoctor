<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElAlert, ElButton, ElPopover } from 'element-plus'
import {
  PhArrowsLeftRight,
  PhBracketsCurly,
  PhClockCounterClockwise,
  PhFileCode,
  PhMagnifyingGlass,
  PhPlay,
  PhQuestion,
  PhWarningCircle,
} from '@phosphor-icons/vue'

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
        <h1 id="input-title">Cole um plano de execução</h1>
        <p class="input-lead">
          Execute <code>EXPLAIN (ANALYZE, FORMAT JSON)</code> no PostgreSQL e cole o resultado abaixo. O plano é analisado localmente e não é enviado a um servidor.
        </p>

        <section class="analysis-scope" aria-labelledby="analysis-scope-title">
          <h2 id="analysis-scope-title">Informações exibidas</h2>
          <ul>
            <li>
              <span class="analysis-scope__icon" aria-hidden="true">
                <PhArrowsLeftRight :size="28" weight="duotone" />
              </span>
              <div>
                <strong>Fluxo de linhas</strong>
                <span>Quantidade produzida e descartada em cada operador.</span>
              </div>
            </li>
            <li>
              <span class="analysis-scope__icon" aria-hidden="true">
                <PhClockCounterClockwise :size="28" weight="duotone" />
              </span>
              <div>
                <strong>Tempo acumulado</strong>
                <span>Tempo por operador considerando o número de execuções.</span>
              </div>
            </li>
            <li>
              <span class="analysis-scope__icon" aria-hidden="true">
                <PhMagnifyingGlass :size="28" weight="duotone" />
              </span>
              <div>
                <strong>Pontos de atenção</strong>
                <span>Evidência, interpretação e uma forma de conferir cada sinal.</span>
              </div>
            </li>
          </ul>
        </section>

        <div class="safety-note">
          <span class="safety-note__icon" aria-hidden="true">
            <PhWarningCircle :size="30" weight="duotone" />
          </span>
          <p>
            <strong>EXPLAIN ANALYZE executa a consulta.</strong>
            Revise comandos que alteram dados antes de gerar o plano.
          </p>
        </div>

      </section>

      <section class="plan-editor" aria-label="Editor do plano de execução">
        <header class="plan-editor__header">
          <div class="plan-editor__identity">
            <span aria-hidden="true"><PhBracketsCurly :size="24" weight="bold" /></span>
            <div>
              <strong>Plano de execução</strong>
              <small>Formato JSON</small>
            </div>
          </div>

          <ElPopover
            placement="bottom-end"
            trigger="click"
            :teleported="false"
            :width="360"
            popper-class="plan-help-popover"
          >
            <template #reference>
              <ElButton class="plan-editor__help">
                <PhQuestion :size="18" weight="bold" aria-hidden="true" />
                Como obter o JSON
              </ElButton>
            </template>
            <strong>Comando no PostgreSQL</strong>
            <p>Adicione esta linha antes da consulta:</p>
            <code>EXPLAIN (ANALYZE, FORMAT JSON)</code>
          </ElPopover>
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
          <span class="editor-shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> para analisar</span>

          <div class="plan-editor__actions">
            <ElButton @click="emit('useExample')">
              <PhFileCode :size="18" weight="duotone" aria-hidden="true" />
              Carregar exemplo
            </ElButton>
            <ElButton
              type="primary"
              :disabled="!hasContent"
              :loading="loading"
              @click="emit('analyze')"
            >
              <PhPlay :size="18" weight="fill" aria-hidden="true" />
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
