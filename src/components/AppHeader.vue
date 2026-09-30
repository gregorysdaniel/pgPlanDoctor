<script setup lang="ts">
import { PhTreeStructure } from '@phosphor-icons/vue'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="brand" :to="{ name: 'input' }" aria-label="Ir para a entrada do PlanoClaro">
        <span class="brand__symbol" aria-hidden="true">
          <PhTreeStructure :size="30" weight="duotone" />
        </span>
        <span class="brand__name">PlanoClaro</span>
      </RouterLink>

      <nav class="app-header__nav" aria-label="Navegação principal">
        <slot name="nav" />
      </nav>

      <div class="app-header__actions">
        <slot />
      </div>
    </div>
  </header>
</template>
