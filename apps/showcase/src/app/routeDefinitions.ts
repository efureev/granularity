import type { RouteRecordRaw } from 'vue-router'

export const showcaseLazyPageLoaders = {
  overview: () => import('../pages/OverviewPage.vue'),
  foundations: () => import('../pages/FoundationsPage.vue'),
  components: () => import('../pages/ComponentsPage.vue'),
  componentDetail: () => import('../pages/ComponentDetailPage.vue'),
  packageEntityDetail: () => import('../pages/PackageEntityDetailPage.vue'),
  directives: () => import('../pages/DirectivesPage.vue'),
  composables: () => import('../pages/ComposablesPage.vue'),
  utilities: () => import('../pages/UtilitiesPage.vue'),
} as const

export const showcaseChildRoutes = [
  {
    path: '',
    name: 'overview',
    component: showcaseLazyPageLoaders.overview,
  },
  {
    path: 'foundations',
    name: 'foundations',
    component: showcaseLazyPageLoaders.foundations,
  },
  {
    path: 'components',
    name: 'components',
    component: showcaseLazyPageLoaders.components,
  },
  {
    path: 'components/:componentSlug',
    name: 'component-detail',
    component: showcaseLazyPageLoaders.componentDetail,
  },
  {
    path: 'directives',
    name: 'directives',
    component: showcaseLazyPageLoaders.directives,
  },
  {
    path: 'directives/:entitySlug',
    name: 'directive-detail',
    component: showcaseLazyPageLoaders.packageEntityDetail,
  },
  {
    path: 'composables',
    name: 'composables',
    component: showcaseLazyPageLoaders.composables,
  },
  {
    path: 'composables/:entitySlug',
    name: 'composable-detail',
    component: showcaseLazyPageLoaders.packageEntityDetail,
  },
  {
    path: 'utilities',
    name: 'utilities',
    component: showcaseLazyPageLoaders.utilities,
  },
  {
    path: 'utilities/:entitySlug',
    name: 'utility-detail',
    component: showcaseLazyPageLoaders.packageEntityDetail,
  },
] as const satisfies readonly RouteRecordRaw[]