import type { RouteLocationRaw, RouteRecordNameGeneric } from 'vue-router'

export interface Crumb {
  label: string
  /** Без ссылки — раздел без своей страницы или текущая страница. */
  to?: RouteLocationRaw
}

/** Названия сущностей адреса; `undefined` — такой нет, страница покажет «не найдено». */
export interface CrumbTitles {
  foundation: (id: string) => string | undefined
  theme: (id: string) => string | undefined
  component: (id: string) => string | undefined
  /** Группа каталога, в которой стоит компонент. */
  componentGroup: (id: string) => { id: string, title: string } | undefined
}

const NOT_FOUND = 'Не найдено'

/**
 * Путь страницы для шапки. Тема ссылок — явная: у адреса «не найдено» её нет,
 * и маршрут без неё не строится; путь не уводит в другую тему.
 */
export function breadcrumbs(name: RouteRecordNameGeneric | null | undefined, params: Readonly<Record<string, unknown>>, theme: string, titles: CrumbTitles): Crumb[] {
  const home: Crumb = { label: 'Обзор', to: { name: 'overview', params: { theme } } }
  const pages: Readonly<Record<string, () => Crumb[]>> = {
    overview: () => [{ label: 'Обзор' }],
    foundation: () => [home, { label: 'Основы' }, { label: titles.foundation(String(params.foundation)) ?? NOT_FOUND }],
    themes: () => [home, { label: 'Каталог тем' }],
    theme: () => [home, { label: 'Каталог тем', to: { name: 'themes', params: { theme } } }, { label: titles.theme(String(params.slug)) ?? NOT_FOUND }],
    components: () => [home, { label: 'Компоненты' }],
    component: () => {
      const id = String(params.component)
      const group = titles.componentGroup(id)
      return [
        home,
        { label: 'Компоненты', to: { name: 'components', params: { theme } } },
        ...(group ? [{ label: group.title, to: { name: 'components', params: { theme }, hash: `#group-${group.id}` } }] : []),
        { label: titles.component(id) ?? NOT_FOUND },
      ]
    },
  }
  const page = typeof name === 'string' ? pages[name] : undefined
  return page ? page() : [home, { label: NOT_FOUND }]
}
