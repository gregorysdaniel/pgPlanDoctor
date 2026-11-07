import { readonly, ref } from 'vue'
import { evaluatePlan } from '../domain/heuristics'
import type { PlanNode } from '../domain/plan'
import { translate } from '../i18n'

export interface RecentPlan {
  id: string
  source: string
  analyzedAt: string
  nodeCount: number
  attentionCount: number
  rootType: string
  relations: readonly string[]
}

const STORAGE_KEY = 'pg-plan-doctor-recent-plans'
const MAXIMUM_RECENT_PLANS = 10
const recentPlans = ref<RecentPlan[]>([])

let initialized = false

function isRecentPlan(value: unknown): value is RecentPlan {
  if (typeof value !== 'object' || value === null) return false

  const plan = value as Record<string, unknown>

  return (
    typeof plan.id === 'string' &&
    typeof plan.source === 'string' &&
    typeof plan.analyzedAt === 'string' &&
    !Number.isNaN(Date.parse(plan.analyzedAt)) &&
    Number.isInteger(plan.nodeCount) &&
    Number(plan.nodeCount) > 0 &&
    Number.isInteger(plan.attentionCount) &&
    Number(plan.attentionCount) >= 0 &&
    typeof plan.rootType === 'string' &&
    Array.isArray(plan.relations) &&
    plan.relations.every((relation) => typeof relation === 'string')
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

export function formatRecentPlanTitle(plan: RecentPlan): string {
  if (plan.relations.length === 1) {
    return translate('recent.singleRelation', {
      type: plan.rootType,
      relation: plan.relations[0],
    })
  }
  if (plan.relations.length > 1) {
    return translate('recent.twoRelations', {
      type: plan.rootType,
      first: plan.relations[0],
      second: plan.relations[1],
    })
  }
  return translate('recent.generic', { type: plan.rootType })
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
    source: normalizedSource,
    analyzedAt: new Date().toISOString(),
    nodeCount: countNodes(plan),
    attentionCount: evaluatePlan(plan).length,
    rootType: plan.type,
    relations: collectRelations(plan),
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
