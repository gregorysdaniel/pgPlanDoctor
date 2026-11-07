<script setup lang="ts">
import pgPlanDoctorLogo from '../pg-plan-doctor-logo.png'
import { useI18n } from '../i18n'

const { t } = useI18n()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="brand" :to="{ name: 'input' }" aria-label="pgPlanDoctor">
        <span class="brand__symbol" aria-hidden="true">
          <img :src="pgPlanDoctorLogo" alt="" />
        </span>
        <span class="brand__name">pgPlanDoctor</span>
      </RouterLink>

      <nav class="app-header__nav" :aria-label="t('nav.aria')">
        <slot name="nav" />
      </nav>

      <div class="app-header__actions">
        <slot />
      </div>
    </div>
  </header>
</template>
