import { computed, readonly, ref } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'pg-plan-doctor-theme'
const preference = ref<ThemePreference>('system')
const resolvedTheme = ref<ResolvedTheme>('light')

let initialized = false
let colorSchemeQuery: MediaQueryList | null = null

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function resolveTheme(): ResolvedTheme {
  if (preference.value !== 'system') return preference.value

  return colorSchemeQuery?.matches ? 'dark' : 'light'
}

function applyTheme(): void {
  resolvedTheme.value = resolveTheme()
  document.documentElement.dataset.theme = resolvedTheme.value
}

function handleSystemThemeChange(): void {
  if (preference.value === 'system') applyTheme()
}

function initializeTheme(): void {
  if (initialized || typeof window === 'undefined') return

  colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

  try {
    const storedPreference = window.localStorage.getItem(STORAGE_KEY)
    if (isThemePreference(storedPreference)) preference.value = storedPreference
  } catch {
    preference.value = 'system'
  }

  colorSchemeQuery.addEventListener('change', handleSystemThemeChange)
  applyTheme()
  initialized = true
}

function setThemePreference(value: ThemePreference): void {
  preference.value = value

  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // O tema continua funcionando durante a sessão quando o armazenamento está indisponível.
  }

  applyTheme()
}

export function useTheme() {
  return {
    preference: readonly(preference),
    resolvedTheme: readonly(resolvedTheme),
    isDark: computed(() => resolvedTheme.value === 'dark'),
    initializeTheme,
    setThemePreference,
  }
}
