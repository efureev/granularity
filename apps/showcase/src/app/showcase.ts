import type { RouteRecordName } from 'vue-router'
import type {
  ShowcaseBreadcrumb,
  ShowcaseNavigationItem,
  ShowcasePage,
  ShowcasePageName,
  ShowcaseSection,
} from './showcaseModel.ts'

export {
  showcaseComponentEntities,
  showcaseComposableEntities,
  showcaseDirectiveEntities,
  showcaseEntityRegistry,
  showcaseUtilityEntities,
} from './showcaseEntities.ts'
import {
  showcaseComponentEntities,
  showcaseEntityRegistry,
} from './showcaseEntities.ts'

export {
  showcaseComponentDetailSections,
  showcaseExtraComponentDetailSections,
  showcasePackageDetailSections,
  showcasePages,
} from './showcasePages.ts'
import {
  showcaseComponentDetailSections,
  showcaseExtraComponentDetailSections,
  showcasePackageDetailSections,
  showcasePages,
} from './showcasePages.ts'
import { getCompanionComponentByPath } from '../content/companion/companionPackages.ts'

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

/**
 * Разделы шапки. Уже́ полного списка: `overview` живёт в логотипе, а страницы
 * с `topNavigation: false` попадают только в поиск и в ссылки по месту.
 */
export const showcaseTopNavigationItems: ShowcaseNavigationItem[] = showcaseNavigationItems
  .filter(item => item.name !== 'overview')
  .filter(item => showcasePages.find(page => page.name === item.name)?.topNavigation !== false)

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

  if (getCompanionComponentByPath(path)) {
    return showcaseExtraComponentDetailSections
  }

  return getShowcasePageByPath(path)?.sections ?? showcasePageRecord.overview.sections
}

export function getShowcaseBreadcrumbs(path: string): ShowcaseBreadcrumb[] {
  const currentEntity = getShowcaseEntityByPath(path)
  const currentPage = getShowcasePageByPath(path)

  // Companion-компоненты живут не в основном registry, поэтому крошку до
  // конкретного компонента строим отдельно (Overview / Extras / <Component>).
  const companionComponent = getCompanionComponentByPath(path)
  if (companionComponent && currentPage && currentPage.path !== '/') {
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
        label: companionComponent.title,
        to: `/extras/${companionComponent.slug}`,
      },
    ]
  }

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
