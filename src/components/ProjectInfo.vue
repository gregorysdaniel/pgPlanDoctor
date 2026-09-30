<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'

interface HeuristicValidation {
  id: string
  heuristic: string
  comparison: string
}

const feedbackFormUrl = import.meta.env.VITE_FEEDBACK_FORM_URL
const benchmarkGithubUrl = import.meta.env.VITE_BENCHMARK_GITHUB_URL
const { t } = useI18n()

const heuristicValidations = computed<HeuristicValidation[]>(() => [
  {
    id: 'R01',
    heuristic: t('about.r01.name'),
    comparison: t('about.r01.comparison'),
  },
  {
    id: 'R02',
    heuristic: t('about.r02.name'),
    comparison: t('about.r02.comparison'),
  },
  {
    id: 'R03',
    heuristic: t('about.r03.name'),
    comparison: t('about.r03.comparison'),
  },
  {
    id: 'R04',
    heuristic: t('about.r04.name'),
    comparison: t('about.r04.comparison'),
  },
  {
    id: 'R05',
    heuristic: t('about.r05.name'),
    comparison: t('about.r05.comparison'),
  },
  {
    id: 'R06',
    heuristic: t('about.r06.name'),
    comparison: t('about.r06.comparison'),
  },
])
</script>

<template>
  <main class="project-info">
    <article class="project-info__document">
      <header class="project-info__header">
        <h1>{{ t('about.title') }}</h1>
        <p v-html="t('about.intro')"></p>
        <p class="project-info__feedback-prompt">
          {{ t('about.feedbackPrompt') }}
          <a :href="feedbackFormUrl" target="_blank" rel="noopener noreferrer">
            {{ t('about.feedbackLink') }}
          </a>
        </p>
      </header>

      <section>
        <h2>{{ t('about.howTitle') }}</h2>
        <p>{{ t('about.howText') }}</p>
        <p>{{ t('about.attentionText') }}</p>
      </section>

      <section>
        <h2>{{ t('about.validationTitle') }}</h2>
        <p>{{ t('about.validationText') }}</p>

        <div class="validation-table" tabindex="0" :aria-label="t('about.benchmarkAria')">
          <table>
            <thead>
              <tr>
                <th>{{ t('about.rule') }}</th>
                <th>{{ t('about.heuristic') }}</th>
                <th>{{ t('about.comparison') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in heuristicValidations" :key="item.id">
                <td><code>{{ item.id }}</code></td>
                <td>{{ item.heuristic }}</td>
                <td>{{ item.comparison }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="project-info__note">
          {{ t('about.protocol') }}
        </p>
        <a
          class="project-info__external-link"
          :href="benchmarkGithubUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('about.github') }}
        </a>
      </section>

      <section>
        <h2>{{ t('about.limitsTitle') }}</h2>
        <p>{{ t('about.limitsText') }}</p>
      </section>

    </article>
  </main>
</template>
