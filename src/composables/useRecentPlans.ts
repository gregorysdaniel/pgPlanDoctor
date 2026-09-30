import { readonly, ref } from 'vue'
import { evaluatePlan } from '../domain/heuristics'
import type { PlanNode } from '../domain/plan'

export interface RecentPlan {
  id: string
  title: string
  source: string
  analyzedAt: string
  nodeCount: number
  attentionCount: number
}

const STORAGE_KEY = 'planoclaro-recent-plans'
const MAXIMUM_RECENT_PLANS = 10
const recentPlans = ref<RecentPlan[]>([])

let initialized = false

function isRecentPlan(value: unknown): value is RecentPlan {
  if (typeof value !== 'object' || value === null) return false

  const plan = value as Record<string, unknown>

  return (
    typeof plan.id === 'string' &&
    typeof plan.title === 'string' &&
    typeof plan.source === 'string' &&
    typeof plan.analyzedAt === 'string' &&
    !Number.isNaN(Date.parse(plan.analyzedAt)) &&
    Number.isInteger(plan.nodeCount) &&
    Number(plan.nodeCount) > 0 &&
    Number.isInteger(plan.attentionCount) &&
    Number(plan.attentionCount) >= 0
  )
}

function initializeRecentPlans(): void {
  if (initialized || typeof window === 'undefined') return

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) return

    const parsed: unknown = JSON.parse(storedValue)
    if (!Array.isArray(parsed)) return

    recentPlans.value = parsed.filter(isRecentPlan).slice(0, MAXIMUM_RECENT_PLANS)
  } catch {
    recentPlans.value = []
  } finally {
    initialized = true
  }
}

function createIdentifier(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function countNodes(plan: PlanNode): number {
  return 1 + (plan.children?.reduce((total, child) => total + countNodes(child), 0) ?? 0)
}

function collectRelations(plan: PlanNode, relations = new Set<string>()): string[] {
  if (plan.relation) relations.add(plan.relation)
  plan.children?.forEach((child) => collectRelations(child, relations))
  return [...relations]
}

function createTitle(plan: PlanNode): string {
  const relations = collectRelations(plan)

  if (relations.length === 1) return `${plan.type} em ${relations[0]}`
  if (relations.length > 1) return `${plan.type} entre ${relations[0]} e ${relations[1]}`
  return `Plano com ${plan.type}`
}

function persistRecentPlans(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentPlans.value))
  } catch {
    // O histórico continua disponível durante a sessão se o armazenamento for bloqueado ou estiver cheio.
  }
}

function addRecentPlan(source: string, plan: PlanNode): void {
  initializeRecentPlans()

  const normalizedSource = source.trim()
  const existingPlan = recentPlans.value.find((recentPlan) => recentPlan.source === normalizedSource)
  const recentPlan: RecentPlan = {
    id: existingPlan?.id ?? createIdentifier(),
    title: createTitle(plan),
    source: normalizedSource,
    analyzedAt: new Date().toISOString(),
    nodeCount: countNodes(plan),
    attentionCount: evaluatePlan(plan).length,
  }

  recentPlans.value = [
    recentPlan,
    ...recentPlans.value.filter((item) => item.id !== recentPlan.id),
  ].slice(0, MAXIMUM_RECENT_PLANS)

  persistRecentPlans()
}

export function useRecentPlans() {
  initializeRecentPlans()

  return {
    recentPlans: readonly(recentPlans),
    addRecentPlan,
  }
}
