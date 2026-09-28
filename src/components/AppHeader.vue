<script setup lang="ts">
const emit = defineEmits<{
  home: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <button class="brand" type="button" aria-label="Ir para a entrada do PlanoClaro" @click="emit('home')">
        <span class="brand__symbol" aria-hidden="true">
          <svg viewBox="0 0 42 30">
            <path d="M3 3H8V27H3M39 3H34V27H39" />
            <circle cx="15" cy="9" r="2.5" />
            <circle cx="28" cy="10" r="2.5" />
            <circle cx="22" cy="22" r="2.5" />
            <path d="M17.5 9.2 25.5 9.8M26.8 12.3 23.2 19.7M16.4 11.2 20.6 19.8" />
          </svg>
        </span>
        <span class="brand__name">PlanoClaro</span>
      </button>

      <nav class="app-navigation" aria-label="Navegação principal">
        <slot name="navigation" />
      </nav>

      <div class="app-header__actions">
        <slot />
      </div>
    </div>
  </header>
</template>
