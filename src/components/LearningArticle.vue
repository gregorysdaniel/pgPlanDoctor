<script setup lang="ts">
import { computed } from 'vue'
import {
  PhArrowLeft,
  PhArrowRight,
  PhArrowSquareOut,
  PhInfo,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import type { LearningArticle } from '../content/learningContent'
import type { LearningReference } from '../content/learningContent'
import { getAdjacentLearningArticles } from '../content/learningContent'
import { useI18n } from '../i18n'

const props = defineProps<{
  article: LearningArticle
}>()

const { t } = useI18n()

const adjacentArticles = computed(() => getAdjacentLearningArticles(props.article))

function scrollToSection(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function referenceNumber(reference: LearningReference): number {
  return props.article.references.findIndex((item) => item.url === reference.url) + 1
}
</script>

<template>
  <main class="learning-article">
    <div class="learning-article__shell">
      <nav class="learning-breadcrumb" :aria-label="t('learning.breadcrumbAria')">
        <RouterLink :to="{ name: 'learning' }">
          <PhArrowLeft :size="17" weight="bold" aria-hidden="true" />
          {{ t('learning.allContents') }}
        </RouterLink>
      </nav>

      <div class="learning-article__layout">
        <article class="learning-article__content">
          <header class="learning-article__header">
            <h1>{{ article.title }}</h1>
            <p>{{ article.summary }}</p>
          </header>

          <section
            v-for="section in article.sections"
            :id="section.id"
            :key="section.id"
            class="learning-section"
          >
            <h2>
              {{ section.title }}
              <button
                v-if="section.source"
                class="learning-section__reference-marker"
                type="button"
                :aria-label="t('learning.reference', { number: referenceNumber(section.source) })"
                @click="scrollToSection(`recommended-content-${referenceNumber(section.source)}`)"
              >[{{ referenceNumber(section.source) }}]</button>
            </h2>
            <p v-for="paragraph in section.paragraphs" :key="paragraph" v-html="paragraph"></p>

            <pre v-if="section.code"><code>{{ section.code }}</code></pre>

            <ul v-if="section.bullets">
              <li v-for="item in section.bullets" :key="item" v-html="item"></li>
            </ul>

            <aside
              v-if="section.callout"
              class="learning-callout"
              :class="`learning-callout--${section.callout.tone ?? 'information'}`"
            >
              <PhWarningCircle
                v-if="section.callout.tone === 'attention'"
                :size="27"
                weight="duotone"
                aria-hidden="true"
              />
              <PhInfo v-else :size="27" weight="duotone" aria-hidden="true" />
              <div>
                <strong>{{ section.callout.title }}</strong>
                <p>{{ section.callout.text }}</p>
              </div>
            </aside>

          </section>

          <section class="learning-references" aria-labelledby="learning-references-title">
            <h2 id="learning-references-title">{{ t('learning.recommended') }}</h2>
            <ol>
              <li
                v-for="(reference, index) in article.references"
                :id="`recommended-content-${index + 1}`"
                :key="reference.url"
              >
                <a :href="reference.url" target="_blank" rel="noopener noreferrer">
                  <span>
                    <strong>{{ reference.label }}</strong>
                    <small v-if="reference.description">{{ reference.description }}</small>
                  </span>
                  <PhArrowSquareOut :size="17" weight="bold" aria-hidden="true" />
                </a>
              </li>
            </ol>
          </section>

          <nav class="learning-pagination" :aria-label="t('learning.paginationAria')">
            <RouterLink
              v-if="adjacentArticles.previous"
              class="learning-pagination__previous"
              :to="{ name: 'learning-article', params: { slug: adjacentArticles.previous.slug } }"
            >
              <PhArrowLeft :size="20" weight="bold" aria-hidden="true" />
              <span>
                <small>{{ t('learning.previous') }}</small>
                <strong>{{ adjacentArticles.previous.title }}</strong>
              </span>
            </RouterLink>
            <span v-else></span>

            <RouterLink
              v-if="adjacentArticles.next"
              class="learning-pagination__next"
              :to="{ name: 'learning-article', params: { slug: adjacentArticles.next.slug } }"
            >
              <span>
                <small>{{ t('learning.next') }}</small>
                <strong>{{ adjacentArticles.next.title }}</strong>
              </span>
              <PhArrowRight :size="20" weight="bold" aria-hidden="true" />
            </RouterLink>
            <RouterLink v-else class="learning-pagination__next" :to="{ name: 'learning' }">
              <span>
                <small>{{ t('learning.finish') }}</small>
                <strong>{{ t('learning.back') }}</strong>
              </span>
              <PhArrowRight :size="20" weight="bold" aria-hidden="true" />
            </RouterLink>
          </nav>
        </article>

        <aside class="learning-toc" aria-labelledby="learning-toc-title">
          <h2 id="learning-toc-title">{{ t('learning.onThisPage') }}</h2>
          <ul>
            <li v-for="section in article.sections" :key="section.id">
              <button type="button" @click="scrollToSection(section.id)">
                {{ section.title }}
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </main>
</template>
