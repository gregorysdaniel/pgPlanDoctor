<script setup lang="ts">
import {
  PhArrowRight,
  PhBookOpenText,
  PhChartBar,
  PhMagnifyingGlass,
  PhTreeStructure,
} from '@phosphor-icons/vue'
import { learningArticles } from '../content/learningContent'
</script>

<template>
  <main class="learning-index">
    <header class="learning-index__header">
      <div class="learning-index__title">
        <span class="learning-index__icon" aria-hidden="true">
          <PhBookOpenText :size="36" weight="duotone" />
        </span>
        <div>
          <h1>Aprender a interpretar planos</h1>
          <p>
            Uma introdução ao caminho da consulta, à leitura do EXPLAIN ANALYZE e à investigação
            de sinais encontrados em planos de execução.
          </p>
        </div>
      </div>

    </header>

    <section class="learning-path" aria-labelledby="learning-path-title">
      <h2 id="learning-path-title">Conteúdos</h2>

      <ol>
        <li v-for="article in learningArticles" :key="article.slug">
          <RouterLink :to="{ name: 'learning-article', params: { slug: article.slug } }">
            <span class="learning-path__article-icon" aria-hidden="true">
              <PhTreeStructure v-if="article.slug === 'da-consulta-ao-plano'" :size="30" weight="duotone" />
              <PhBookOpenText v-else-if="article.slug === 'como-gerar-e-percorrer-um-plano'" :size="30" weight="duotone" />
              <PhChartBar v-else-if="article.slug === 'metricas-essenciais'" :size="30" weight="duotone" />
              <PhMagnifyingGlass v-else :size="30" weight="duotone" />
            </span>
            <span class="learning-path__copy">
              <strong>{{ article.title }}</strong>
              <span>{{ article.summary }}</span>
            </span>
            <PhArrowRight class="learning-path__arrow" :size="22" weight="bold" aria-hidden="true" />
          </RouterLink>
        </li>
      </ol>
    </section>
  </main>
</template>
