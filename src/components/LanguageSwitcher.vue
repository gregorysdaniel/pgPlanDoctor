<script setup lang="ts">
import { computed } from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { PhCaretDown, PhCheck, PhGlobe } from '@phosphor-icons/vue'
import { type AppLocale, useI18n } from '../i18n'

const { locale, setLocale, t } = useI18n()

const options = computed<Array<{ value: AppLocale; label: string; shortLabel: string }>>(() => [
  { value: 'pt-BR', label: t('language.portuguese'), shortLabel: 'PT' },
  { value: 'en', label: t('language.english'), shortLabel: 'EN' },
])

const currentOption = computed(
  () => options.value.find((option) => option.value === locale.value) ?? options.value[0],
)

function selectLanguage(command: string | number | object): void {
  if (command === 'pt-BR' || command === 'en') setLocale(command)
}
</script>

<template>
  <ElDropdown :teleported="false" trigger="click" @command="selectLanguage">
    <button
      class="language-menu-button"
      type="button"
      :aria-label="`${t('language.label')}: ${currentOption.label}`"
      aria-haspopup="menu"
    >
      <PhGlobe :size="16" weight="bold" aria-hidden="true" />
      <span>{{ currentOption.shortLabel }}</span>
      <PhCaretDown class="language-menu-button__chevron" :size="14" weight="bold" aria-hidden="true" />
    </button>

    <template #dropdown>
      <ElDropdownMenu class="language-menu">
        <ElDropdownItem
          v-for="option in options"
          :key="option.value"
          :command="option.value"
          :class="{ 'language-menu__item--active': locale === option.value }"
        >
          <span>{{ option.label }}</span>
          <PhCheck
            v-if="locale === option.value"
            class="language-menu__check"
            :size="16"
            weight="bold"
            aria-hidden="true"
          />
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
