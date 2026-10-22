import type { RouteComponent, RouteLocationGeneric, RouteRecordRaw } from 'vue-router'

type Page = () => Promise<RouteComponent | { default: RouteComponent }>

export interface DesignPages {
  readonly overview: Page
  readonly foundation: Page
  readonly themes: Page
  readonly theme: Page
  readonly component: Page
  readonly notFound: Page
}

/**
 * Маршруты приложения. Тема — первый сегмент пути: адрес — её единственный
 * источник, документ следует ему (`router.ts`). Префикс принимает только темы
 * сборки — чужое слово в начале пути даёт «не найдено», а не тему без стилей.
 * Адреса без темы ведут в текущую: ссылки и закладки до этого переезда живы.
 */
export function buildRoutes(themes: readonly string[], currentTheme: () => string, pages: DesignPages): RouteRecordRaw[] {
  const theme = `:theme(${themes.join('|')})`
  const toCurrent = (to: { readonly fullPath: string }): string => `/${currentTheme()}${to.fullPath}`
  return [
    { path: '/', redirect: () => `/${currentTheme()}` },
    { path: `/${theme}`, name: 'overview', component: pages.overview },
    { path: `/${theme}/foundations/:foundation`, name: 'foundation', component: pages.foundation },
    { path: `/${theme}/themes`, name: 'themes', component: pages.themes },
    { path: `/${theme}/themes/:slug`, name: 'theme', component: pages.theme },
    { path: `/${theme}/components/:component`, name: 'component', component: pages.component },
    // Сегмент после компонента — id темы: адрес ведёт на страницу компонента в этой теме, чужое слово — в тему адреса.
    {
      path: `/${theme}/components/:component/:version`,
      redirect: to => ({
        name: 'component',
        params: { theme: themes.includes(String(to.params.version)) ? String(to.params.version) : String(to.params.theme), component: String(to.params.component) },
        query: to.query,
      }),
    },
    { path: '/foundations/:rest(.*)*', redirect: toCurrent },
    { path: '/themes/:rest(.*)*', redirect: toCurrent },
    { path: '/components/:rest(.*)*', redirect: toCurrent },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pages.notFound },
  ]
}

type Place = Pick<RouteLocationGeneric, 'name' | 'params' | 'query'>

/** Сменилась только тема — страница та же: прокрутку не сбрасываем. */
export function themeOnlyChange(to: Place, from: Place): boolean {
  if (to.name !== from.name || to.params.theme === from.params.theme)
    return false
  const rest = (route: Place): string => JSON.stringify({ ...route.params, theme: undefined, query: route.query })
  return rest(to) === rest(from)
}
