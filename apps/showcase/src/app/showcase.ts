import type { RouteRecordName } from 'vue-router'
import type {
  ShowcaseBreadcrumb,
  ShowcaseNavigationItem,
  ShowcasePage,
  ShowcasePageName,
  ShowcaseSection,
} from './showcaseModel.ts'

export {
  showcaseComposableEntities,
  showcaseComponentEntities,
  showcaseDirectiveEntities,
  showcaseEntityRegistry,
  showcaseUtilityEntities,
} from './showcaseEntities.ts'
import {
  showcaseComposableEntities,
  showcaseComponentEntities,
  showcaseDirectiveEntities,
  showcaseEntityRegistry,
  showcaseUtilityEntities,
} from './showcaseEntities.ts'
export {
  showcaseComponentDetailSections,
  showcasePackageDetailSections,
  showcasePages,
} from './showcasePages.ts'
import {
  showcaseComponentDetailSections,
  showcasePackageDetailSections,
  showcasePages,
} from './showcasePages.ts'
export type {
  ShowcaseBreadcrumb,
  ShowcaseNavigationItem,
  ShowcasePage,
  ShowcasePageName,
  ShowcaseSection,
} from './showcaseModel.ts'

export const showcasePageRecord = Object.fromEntries(
  showcasePages.map(page => [page.name, page]),
) as Record<ShowcasePageName, ShowcasePage>

export const showcaseNavigationItems: ShowcaseNavigationItem[] = showcasePages.map(({
  name,
  path,
  title,
  shortTitle,
  description,
}) => ({
  name,
  path,
  title,
  shortTitle,
  description,
}))

function normalizeShowcasePath(path: string): string {
  const [pathname = '/'] = path.split(/[?#]/)
  const normalizedPath = pathname.replace(/\/+$/, '')

  return normalizedPath || '/'
}

export function getShowcaseEntityByPath(path: string) {
  const normalizedPath = normalizeShowcasePath(path)

  return showcaseEntityRegistry.find(entity => entity.path === normalizedPath)
}

export function getShowcaseComponentBySlug(componentSlug: string) {
  const normalizedSlug = componentSlug.trim().toLowerCase()

  return showcaseComponentEntities.find(entity => entity.path === `/components/${normalizedSlug}`)
}

export function getShowcasePackageEntityByPath(path: string) {
  const entity = getShowcaseEntityByPath(path)

  if (!entity || entity.kind === 'component')
    return undefined

  return entity
}

export function getShowcasePageByName(
  name: RouteRecordName | null | undefined,
): ShowcasePage | undefined {
  if (typeof name !== 'string')
    return undefined

  return showcasePages.find(page => page.name === name)
}

export function getShowcasePageByPath(path: string): ShowcasePage | undefined {
  const normalizedPath = normalizeShowcasePath(path)

  const exactPage = showcasePages.find(page => page.path === normalizedPath)
  if (exactPage)
    return exactPage

  return showcasePages.find((page) => {
    if (page.path === '/')
      return false

    return normalizedPath.startsWith(`${page.path}/`)
  })
}

export function getShowcaseSectionsForPath(path: string): ShowcaseSection[] {
  const entity = getShowcaseEntityByPath(path)
  if (entity) {
    return entity.kind === 'component'
      ? showcaseComponentDetailSections
      : showcasePackageDetailSections
  }

  return getShowcasePageByPath(path)?.sections ?? showcasePageRecord.overview.sections
}

export function getShowcaseBreadcrumbs(path: string): ShowcaseBreadcrumb[] {
  const currentEntity = getShowcaseEntityByPath(path)
  const currentPage = getShowcasePageByPath(path)

  if (currentEntity && currentPage && currentPage.path !== '/') {
    return [
      {
        label: showcasePageRecord.overview.shortTitle,
        to: showcasePageRecord.overview.path,
      },
      {
        label: currentPage.shortTitle,
        to: currentPage.path,
      },
      {
        label: currentEntity.title,
        to: currentEntity.path,
      },
    ]
  }

  if (!currentPage || currentPage.path === '/') {
    return [
      {
        label: showcasePageRecord.overview.shortTitle,
        to: showcasePageRecord.overview.path,
      },
    ]
  }

  return [
    {
      label: showcasePageRecord.overview.shortTitle,
      to: showcasePageRecord.overview.path,
    },
    {
      label: currentPage.shortTitle,
      to: currentPage.path,
    },
  ]
}