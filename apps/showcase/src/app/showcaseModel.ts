export type ShowcasePageName
  = | 'overview'
    | 'foundations'
    | 'components'
    | 'architecture'
    | 'extras'
    | 'directives'
    | 'composables'
    | 'utilities'

export type ShowcaseSection = {
  id: string
  title: string
  description: string
  bullets: string[]
}

export type ShowcasePage = {
  name: ShowcasePageName
  path: string
  title: string
  shortTitle: string
  description: string
  eyebrow: string
  status: 'ready' | 'next'
  /**
   * Показывать ли раздел в верхней навигации. Страница без него остаётся
   * полноценной: свои секции, локали, крошки и запись в поиске у неё есть,
   * не хватает только пункта в шапке.
   *
   * Шапка липкая и попадает в снимок `#live-examples`, поэтому лишний пункт —
   * это +10px её высоты и расхождение всех 74 визуальных эталонов разом.
   */
  topNavigation?: boolean
  sections: ShowcaseSection[]
}

export type ShowcaseNavigationItem = Pick<ShowcasePage, 'name' | 'path' | 'title' | 'shortTitle' | 'description'>
export type ShowcaseBreadcrumb = {
  label: string
  to: string
}
