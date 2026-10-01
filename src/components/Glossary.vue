<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhArrowLeft, PhBookBookmark, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import {
  glossaryCategoryOrder,
  glossaryTerms,
} from '../content/glossaryContent'
import { useI18n } from '../i18n'

const { localeCode, t } = useI18n()
const query = ref('')

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase(localeCode.value)
}

const filteredTerms = computed(() => {
  const normalizedQuery = normalize(query.value.trim())

  return glossaryTerms.value.filter((term) => {
    if (!normalizedQuery) return true

    return normalize([
      term.term,
      term.definition,
      term.detail,
      ...(term.aliases ?? []),
    ].join(' ')).includes(normalizedQuery)
  })
})

const groupedTerms = computed(() =>
  glossaryCategoryOrder
    .map((category) => ({
      category,
      terms: filteredTerms.value.filter((term) => term.category === category),
    }))
    .filter((group) => group.terms.length > 0),
)

function categoryLabel(category: (typeof glossaryCategoryOrder)[number]): string {
  return t(`glossary.category.${category}`)
}
</script>

<template>
  <main class="glossary-page">
    <div class="glossary-page__shell">
      <nav class="learning-breadcrumb" :aria-label="t('learning.breadcrumbAria')">
        <RouterLink :to="{ name: 'learning' }">
          <PhArrowLeft :size="17" weight="bold" aria-hidden="true" />
          {{ t('learning.allContents') }}
        </RouterLink>
      </nav>

      <header class="glossary-header">
        <span class="glossary-header__icon" aria-hidden="true">
          <PhBookBookmark :size="27" weight="duotone" />
        </span>
        <div>
          <h1>{{ t('glossary.title') }}</h1>
          <p>{{ t('glossary.lead') }}</p>
        </div>
      </header>

      <div class="glossary-tools">
        <label class="glossary-search">
          <PhMagnifyingGlass :size="19" aria-hidden="true" />
          <input
            v-model="query"
            type="search"
            :aria-label="t('glossary.searchLabel')"
            :placeholder="t('glossary.searchPlaceholder')"
          />
          <button
            v-if="query"
            type="button"
            :aria-label="t('glossary.clearSearch')"
            @click="query = ''"
          >
            <PhX :size="17" weight="bold" aria-hidden="true" />
          </button>
        </label>
      </div>

      <div v-if="groupedTerms.length" class="glossary-groups">
        <section
          v-for="group in groupedTerms"
          :key="group.category"
          class="glossary-group"
          :aria-labelledby="`glossary-category-${group.category}`"
        >
          <h2 :id="`glossary-category-${group.category}`">
            {{ categoryLabel(group.category) }}
          </h2>

          <div class="glossary-list">
            <article v-for="term in group.terms" :id="term.id" :key="term.id" tabindex="-1">
              <header>
                <h3>{{ term.term }}</h3>
              </header>
              <p>{{ term.definition }}</p>
              <p class="glossary-term__detail">{{ term.detail }}</p>
              <p v-if="term.aliases?.length" class="glossary-term__aliases">
                <strong>{{ t('glossary.alsoKnownAs') }}</strong>
                {{ term.aliases.join(' · ') }}
              </p>
            </article>
          </div>
        </section>
      </div>

      <section v-else class="glossary-empty" aria-live="polite">
        <h2>{{ t('glossary.emptyTitle') }}</h2>
        <p>{{ t('glossary.emptyLead') }}</p>
      </section>
    </div>
  </main>
</template>
