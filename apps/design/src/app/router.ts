import { useTheme } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'
import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { buildRoutes, themeOnlyChange } from './routes'
import { THEME_STORAGE_KEY } from './theme'
import { ensureThemeData } from './viewedTheme'

// `useTheme` — только внутри функций: модуль импортируется раньше, чем
// `initThemeEarly` в `main.ts` поднимет состояние с манифестом сборки.
const appTheme = () => useTheme({ storageKey: THEME_STORAGE_KEY })

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: buildRoutes(themeManifest.themes.map(theme => theme.id), () => appTheme().theme.value, {
    overview: () => import('./pages/OverviewPage.vue'),
    foundation: () => import('./pages/FoundationPage.vue'),
    themes: () => import('./pages/ThemesPage.vue'),
    theme: () => import('./pages/ThemePage.vue'),
    component: () => import('./pages/ComponentPage.vue'),
    notFound: () => import('./pages/NotFoundPage.vue'),
  }),
  scrollBehavior(to, from) {
    // Вкладка макета и выбор версии живут в адресе той же страницы, смена темы —
    // в его префиксе: прокрутку при них не сбрасываем.
    if (to.name === 'component' && from.name === 'component' && to.params.component === from.params.component)
      return false
    if (themeOnlyChange(to, from))
      return false
    return { top: 0 }
  },
})

/** Тема, на которую идёт переход: её смену документом не нужно отражать в адрес. */
let pending: string | undefined

// Тема адреса включается до того, как страница отрисуется: лист, пара на
// корне, пропсы темы и её данные — всё готово к первому кадру. Данные — первыми:
// не загрузились — переход отменён, а документ остался в прежней теме.
router.beforeEach(async (to) => {
  const id = to.params.theme
  if (typeof id !== 'string')
    return
  await ensureThemeData(id)
  pending = id
  const theme = appTheme()
  if (theme.theme.value !== id)
    await theme.setTheme(id)
})
router.afterEach(() => {
  pending = undefined
})

/**
 * Тему документа сменили мимо адреса — другая вкладка записала выбор: адрес
 * идёт за документом, иначе они разошлись бы.
 */
export function followDocumentTheme(): void {
  watch(() => appTheme().theme.value, (id) => {
    const current = router.currentRoute.value.params.theme
    if (id !== pending && typeof current === 'string' && current !== id)
      void router.replace({ params: { theme: id } })
  })
}
