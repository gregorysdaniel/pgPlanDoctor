<script setup lang="ts">
import PlanAnalysis from '../components/PlanAnalysis.vue'
import { usePlanSession } from '../composables/usePlanSession'

const { loadedPlan } = usePlanSession()
</script>

<template>
  <PlanAnalysis v-if="loadedPlan" :plan="loadedPlan" />
</template>
