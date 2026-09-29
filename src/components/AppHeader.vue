<script setup lang="ts">
import { PhTreeStructure } from '@phosphor-icons/vue'

const emit = defineEmits<{
  home: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <button class="brand" type="button" aria-label="Ir para a entrada do PlanoClaro" @click="emit('home')">
        <span class="brand__symbol" aria-hidden="true">
          <PhTreeStructure :size="34" weight="duotone" />
        </span>
        <span class="brand__name">PlanoClaro</span>
      </button>

      <div class="app-header__actions">
        <slot />
      </div>
    </div>
  </header>
</template>
