<script setup lang="ts">
import { computed } from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { PhCaretDown, PhCheck, PhMonitor, PhMoon, PhSun } from '@phosphor-icons/vue'
import { useTheme, type ThemePreference } from '../composables/useTheme'
import { useI18n } from '../i18n'

const { preference, setThemePreference } = useTheme()
const { t } = useI18n()

const options = computed<Array<{ value: ThemePreference; label: string }>>(() => [
  { value: 'system', label: t('theme.system') },
  { value: 'light', label: t('theme.light') },
  { value: 'dark', label: t('theme.dark') },
])

const currentLabel = computed(
  () => options.value.find((option) => option.value === preference.value)?.label ?? t('theme.system'),
)

function selectTheme(command: string | number | object): void {
  if (command === 'system' || command === 'light' || command === 'dark') {
    setThemePreference(command)
  }
}
</script>

<template>
  <ElDropdown :teleported="false" trigger="click" @command="selectTheme">
    <button
      class="theme-menu-button"
      type="button"
      :aria-label="`${t('theme.label')}: ${currentLabel}`"
      aria-haspopup="menu"
    >
      <PhMonitor v-if="preference === 'system'" :size="16" weight="duotone" aria-hidden="true" />
      <PhSun v-else-if="preference === 'light'" :size="16" weight="duotone" aria-hidden="true" />
      <PhMoon v-else :size="16" weight="duotone" aria-hidden="true" />
      <span>{{ currentLabel }}</span>
      <PhCaretDown class="theme-menu-button__chevron" :size="14" weight="bold" aria-hidden="true" />
    </button>

    <template #dropdown>
      <ElDropdownMenu class="theme-menu">
        <ElDropdownItem
          v-for="option in options"
          :key="option.value"
          :command="option.value"
          :class="{ 'theme-menu__item--active': preference === option.value }"
        >
          <PhMonitor v-if="option.value === 'system'" :size="18" weight="duotone" aria-hidden="true" />
          <PhSun v-else-if="option.value === 'light'" :size="18" weight="duotone" aria-hidden="true" />
          <PhMoon v-else :size="18" weight="duotone" aria-hidden="true" />
          <span>{{ option.label }}</span>
          <PhCheck
            v-if="preference === option.value"
            class="theme-menu__check"
            :size="16"
            weight="bold"
            aria-hidden="true"
          />
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
