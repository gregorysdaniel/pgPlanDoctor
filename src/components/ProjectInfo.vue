<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'

interface HeuristicValidation {
  id: string
  heuristic: string
  activation: string
  comparison: string
}

interface TechnicalStep {
  title: string
  description: string
}

const feedbackFormUrl = import.meta.env.VITE_FEEDBACK_FORM_URL
const benchmarkGithubUrl = import.meta.env.VITE_BENCHMARK_GITHUB_URL
const { t } = useI18n()

const technicalSteps = computed<TechnicalStep[]>(() => [
  {
    title: t('about.pipeline.parse.title'),
    description: t('about.pipeline.parse.text'),
  },
  {
    title: t('about.pipeline.model.title'),
    description: t('about.pipeline.model.text'),
  },
  {
    title: t('about.pipeline.rules.title'),
    description: t('about.pipeline.rules.text'),
  },
  {
    title: t('about.pipeline.render.title'),
    description: t('about.pipeline.render.text'),
  },
])

const heuristicValidations = computed<HeuristicValidation[]>(() => [
  {
    id: 'R01',
    heuristic: t('about.r01.name'),
    activation: t('about.r01.activation'),
    comparison: t('about.r01.comparison'),
  },
  {
    id: 'R02',
    heuristic: t('about.r02.name'),
    activation: t('about.r02.activation'),
    comparison: t('about.r02.comparison'),
  },
  {
    id: 'R03',
    heuristic: t('about.r03.name'),
    activation: t('about.r03.activation'),
    comparison: t('about.r03.comparison'),
  },
  {
    id: 'R04',
    heuristic: t('about.r04.name'),
    activation: t('about.r04.activation'),
    comparison: t('about.r04.comparison'),
  },
  {
    id: 'R05',
    heuristic: t('about.r05.name'),
    activation: t('about.r05.activation'),
    comparison: t('about.r05.comparison'),
  },
  {
    id: 'R06',
    heuristic: t('about.r06.name'),
    activation: t('about.r06.activation'),
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

        <div class="project-info__technical-list">
          <div v-for="step in technicalSteps" :key="step.title">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>

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
                <th>{{ t('about.activation') }}</th>
                <th>{{ t('about.comparison') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in heuristicValidations" :key="item.id">
                <td><code>{{ item.id }}</code></td>
                <td>{{ item.heuristic }}</td>
                <td>{{ item.activation }}</td>
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
        <ul class="project-info__limits">
          <li>{{ t('about.limitHeuristics') }}</li>
          <li>{{ t('about.limitExecution') }}</li>
          <li>{{ t('about.limitFormat') }}</li>
        </ul>
      </section>

    </article>
  </main>
</template>
