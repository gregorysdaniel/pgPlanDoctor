<script setup lang="ts">
import postgresqlLogo from '../PostgreSQL-Logo.wine.png'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="brand" :to="{ name: 'input' }" aria-label="Ir para a entrada do pgPlanDoctor">
        <span class="brand__symbol" aria-hidden="true">
          <img :src="postgresqlLogo" alt="" />
        </span>
        <span class="brand__name">pgPlanDoctor</span>
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
