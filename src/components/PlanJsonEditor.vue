<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { PhCaretDown, PhWarningCircle } from '@phosphor-icons/vue'
import type { PlanExample } from '../data/planData'
import { useI18n } from '../i18n'

const props = defineProps<{
  error: string | null
  loading?: boolean
  examples: PlanExample[]
}>()

const emit = defineEmits<{
  analyze: []
  useExample: [source: string]
}>()

const model = defineModel<string>({ required: true })
const { t } = useI18n()
const editor = ref<HTMLTextAreaElement | null>(null)
const scrollTop = ref(0)
let selectedExample: PlanExample | undefined
const lineNumbers = computed(() => Array.from({ length: model.value.split('\n').length }, (_, index) => index + 1))
const hasContent = computed(() => model.value.trim().length > 0)

function synchronizeScroll(): void {
  scrollTop.value = editor.value?.scrollTop ?? 0
}

function analyze(): void {
  if (hasContent.value && !props.loading) emit('analyze')
}

function loadExample(command: string | number | object): void {
  selectedExample = props.examples.find(item => item.id === command)
}

function onExampleMenuVisibilityChange(visible: boolean): void {
  if (visible || !selectedExample) return
  const source = selectedExample.source
  selectedExample = undefined
  emit('useExample', source)
}

async function focusInput(): Promise<void> {
  await nextTick()
  // Aguarda a liberação do foco pelo menu antes de focalizar o campo.
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  if (!editor.value) return
  editor.value.setSelectionRange(0, 0)
  editor.value.focus()
  editor.value.scrollTop = 0
  editor.value.scrollLeft = 0
  synchronizeScroll()
}

watch(model, synchronizeScroll, { flush: 'post' })
watch(() => props.error, (error) => {
  if (error) editor.value?.focus({ preventScroll: true })
}, { flush: 'post' })

defineExpose({ focusInput })
</script>

<template>
  <section class="plan-editor" aria-labelledby="plan-editor-title">
    <div class="plan-editor__surface" :class="{ 'plan-editor__surface--invalid': error }">
      <header class="plan-editor__header">
        <h2 id="plan-editor-title">{{ t('input.editorLabel') }}</h2>
        <ElDropdown
          trigger="click"
          placement="bottom-end"
          popper-class="plan-example-popper"
          @command="loadExample"
          @visible-change="onExampleMenuVisibilityChange"
        >
          <button class="plan-example-button" type="button" aria-haspopup="menu">
            {{ t('input.loadExample') }}
            <PhCaretDown :size="14" weight="bold" aria-hidden="true" />
          </button>
          <template #dropdown>
            <ElDropdownMenu class="plan-example-menu">
              <ElDropdownItem v-for="example in examples" :key="example.id" :command="example.id">
                <span class="plan-example-menu__copy">
                  <strong>{{ example.title }}</strong>
                  <small>{{ example.description }}</small>
                </span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </header>

      <div class="code-editor">
        <div class="code-editor__gutter" aria-hidden="true">
          <div :style="{ transform: `translateY(-${scrollTop}px)` }">
            <span v-for="line in lineNumbers" :key="line">{{ line }}</span>
          </div>
        </div>
        <textarea
          ref="editor"
          v-model="model"
          class="code-editor__textarea"
          aria-labelledby="plan-editor-title"
          :aria-invalid="Boolean(error)"
          :aria-describedby="error ? 'plan-input-error' : undefined"
          :placeholder="t('input.placeholder')"
          spellcheck="false"
          wrap="off"
          @scroll="synchronizeScroll"
        ></textarea>
      </div>
    </div>

    <p v-if="error" id="plan-input-error" class="parse-error" role="alert">
      <PhWarningCircle :size="18" weight="bold" aria-hidden="true" />
      <span>{{ error }}</span>
    </p>

    <div class="plan-editor__actions">
      <ElButton type="primary" :disabled="!hasContent" :loading="loading" @click="analyze">
        {{ t('input.analyze') }}
      </ElButton>
    </div>
  </section>
</template>
