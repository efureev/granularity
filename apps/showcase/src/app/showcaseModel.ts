export type ShowcasePageName =
  | 'overview'
  | 'foundations'
  | 'integration'
  | 'components'
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
  sections: ShowcaseSection[]
}

export type ShowcaseNavigationItem = Pick<ShowcasePage, 'name' | 'path' | 'title' | 'shortTitle' | 'description'>
export type ShowcaseBreadcrumb = {
  label: string
  to: string
}