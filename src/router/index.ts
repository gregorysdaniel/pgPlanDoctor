import { createRouter, createWebHashHistory } from 'vue-router'
import LearningIndex from '../components/LearningIndex.vue'
import ProjectInfo from '../components/ProjectInfo.vue'
import { usePlanSession } from '../composables/usePlanSession'
import { findLearningArticle } from '../content/learningContent'
import LearningArticleView from '../views/LearningArticleView.vue'
import PlanAnalysisView from '../views/PlanAnalysisView.vue'
import PlanInputView from '../views/PlanInputView.vue'

const { loadedPlan } = usePlanSession()

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'input',
      component: PlanInputView,
      meta: { title: 'pgPlanDoctor', section: 'input' },
    },
    {
      path: '/analise',
      name: 'analysis',
      component: PlanAnalysisView,
      meta: { title: 'Análise do plano | pgPlanDoctor', section: 'input' },
      beforeEnter: () => loadedPlan.value !== null || { name: 'input' },
    },
    {
      path: '/aprender',
      name: 'learning',
      component: LearningIndex,
      meta: { title: 'Aprender | pgPlanDoctor', section: 'learning' },
    },
    {
      path: '/aprender/:slug',
      name: 'learning-article',
      component: LearningArticleView,
      props: true,
      meta: { section: 'learning' },
      beforeEnter: (to) =>
        findLearningArticle(String(to.params.slug)) !== null || { name: 'learning' },
    },
    {
      path: '/sobre',
      name: 'about',
      component: ProjectInfo,
      meta: { title: 'Sobre o projeto | pgPlanDoctor', section: 'about' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'input' },
    },
  ],
})

router.afterEach((to) => {
  if (to.name === 'learning-article') {
    const article = findLearningArticle(String(to.params.slug))
    document.title = article ? `${article.title} | pgPlanDoctor` : 'Aprender | pgPlanDoctor'
    return
  }

  document.title = typeof to.meta.title === 'string' ? to.meta.title : 'pgPlanDoctor'
})
