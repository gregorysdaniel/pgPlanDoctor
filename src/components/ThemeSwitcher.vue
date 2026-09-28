<script setup lang="ts">
import { computed } from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { useTheme, type ThemePreference } from '../composables/useTheme'

const { preference, resolvedTheme, setThemePreference } = useTheme()

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
]

const currentLabel = computed(
  () => options.find((option) => option.value === preference.value)?.label ?? 'Sistema',
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
      :aria-label="`Tema: ${currentLabel}`"
      aria-haspopup="menu"
    >
      <svg v-if="resolvedTheme === 'dark'" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M16.5 12.7A7 7 0 0 1 7.3 3.5 7 7 0 1 0 16.5 12.7Z" />
      </svg>
      <svg v-else viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="3.25" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.35 4.35l1.4 1.4M14.25 14.25l1.4 1.4M15.65 4.35l-1.4 1.4M5.75 14.25l-1.4 1.4" />
      </svg>
      <span>{{ currentLabel }}</span>
      <svg class="theme-menu-button__chevron" viewBox="0 0 20 20" aria-hidden="true">
        <path d="m6 8 4 4 4-4" />
      </svg>
    </button>

    <template #dropdown>
      <ElDropdownMenu class="theme-menu">
        <ElDropdownItem
          v-for="option in options"
          :key="option.value"
          :command="option.value"
          :class="{ 'theme-menu__item--active': preference === option.value }"
        >
          <span>{{ option.label }}</span>
          <span v-if="preference === option.value" aria-hidden="true">✓</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
