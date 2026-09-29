/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEEDBACK_FORM_URL: string
  readonly VITE_BENCHMARK_GITHUB_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
