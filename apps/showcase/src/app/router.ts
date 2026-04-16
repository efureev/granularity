import { createRouter, createWebHistory } from 'vue-router'

import ShowcaseLayout from '../layouts/ShowcaseLayout.vue'
import { showcaseChildRoutes } from './routeDefinitions'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ShowcaseLayout,
      children: [...showcaseChildRoutes],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 96,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
    }
  },
})