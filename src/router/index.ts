import { createRouter, createWebHashHistory } from 'vue-router'
import { watch } from 'vue'
import LearningIndex from '../components/LearningIndex.vue'
import Glossary from '../components/Glossary.vue'
import ProjectInfo from '../components/ProjectInfo.vue'
import { usePlanSession } from '../composables/usePlanSession'
import { findLearningArticle } from '../content/learningContent'
import LearningArticleView from '../views/LearningArticleView.vue'
import PlanAnalysisView from '../views/PlanAnalysisView.vue'
import PlanInputView from '../views/PlanInputView.vue'
import { locale, translate } from '../i18n'

const { loadedPlan } = usePlanSession()

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 72, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'input',
      component: PlanInputView,
      meta: { titleKey: 'title.home', section: 'input' },
    },
    {
      path: '/analise',
      name: 'analysis',
      component: PlanAnalysisView,
      meta: { titleKey: 'title.analysis', section: 'input' },
      beforeEnter: () => loadedPlan.value !== null || { name: 'input' },
    },
    {
      path: '/aprender',
      name: 'learning',
      component: LearningIndex,
      meta: { titleKey: 'title.learning', section: 'learning' },
    },
    {
      path: '/aprender/glossario',
      name: 'glossary',
      component: Glossary,
      meta: { titleKey: 'title.glossary', section: 'learning' },
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
      meta: { titleKey: 'title.about', section: 'about' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'input' },
    },
  ],
})

function updateDocumentTitle(): void {
  const to = router.currentRoute.value
  if (to.name === 'learning-article') {
    const article = findLearningArticle(String(to.params.slug))
    document.title = article ? `${article.title} | pgPlanDoctor` : translate('title.learning')
    return
  }

  document.title = typeof to.meta.titleKey === 'string'
    ? translate(to.meta.titleKey)
    : translate('title.home')
}

router.afterEach(updateDocumentTitle)
watch(locale, updateDocumentTitle)
