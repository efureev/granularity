import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: () => import('./pages/OverviewPage.vue'),
    },
    {
      path: '/foundations/:foundation',
      name: 'foundation',
      component: () => import('./pages/FoundationPage.vue'),
    },
    {
      path: '/themes',
      name: 'themes',
      component: () => import('./pages/ThemesPage.vue'),
    },
    {
      path: '/themes/:theme',
      name: 'theme',
      component: () => import('./pages/ThemePage.vue'),
    },
    {
      path: '/components/:component/:version?',
      name: 'component',
      component: () => import('./pages/ComponentPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior(to, from) {
    // Вкладка макета и выбор версии живут в адресе той же страницы — прокрутку
    // при них не сбрасываем.
    if (to.name === 'component' && from.name === 'component' && to.params.component === from.params.component)
      return false
    return { top: 0 }
  },
})
