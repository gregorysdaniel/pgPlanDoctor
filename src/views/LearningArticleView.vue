<script setup lang="ts">
import { computed } from 'vue'
import LearningArticle from '../components/LearningArticle.vue'
import { findLearningArticle } from '../content/learningContent'

const props = defineProps<{
  slug: string
}>()

const article = computed(() => findLearningArticle(props.slug))
</script>

<template>
  <LearningArticle v-if="article" :article="article" />
</template>
