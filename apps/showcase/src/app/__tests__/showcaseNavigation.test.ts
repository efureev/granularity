import { describe, expect, it } from 'vitest'

import {
  getShowcaseEntityByPath,
  getShowcaseBreadcrumbs,
  getShowcaseComponentBySlug,
  getShowcasePageByPath,
  showcaseNavigationItems,
  showcasePageRecord,
} from '../showcase'
import { showcaseChildRoutes, showcaseLazyPageLoaders } from '../routeDefinitions'

describe('showcase navigation model', () => {
  it('описывает все основные разделы витрины и не теряет overview', () => {
    expect(showcaseNavigationItems.map(item => item.name)).toEqual([
      'overview',
      'foundations',
      'integration',
      'components',
      'directives',
      'composables',
      'utilities',
    ])
    expect(showcasePageRecord.overview.path).toBe('/')
  })

  it('нормализует path и корректно находит страницы с хвостовым slash', () => {
    expect(getShowcasePageByPath('/foundations/')?.name).toBe('foundations')
    expect(getShowcasePageByPath('/components?tab=api')?.name).toBe('components')
    expect(getShowcasePageByPath('/components/ds-button')?.name).toBe('components')
    expect(getShowcaseComponentBySlug('ds-button')?.name).toBe('DsButton')
  })

  it('строит breadcrumbs для overview, вложенных страниц и неизвестных route-path', () => {
    expect(getShowcaseBreadcrumbs('/')).toEqual([
      {
        label: 'Overview',
        to: '/',
      },
    ])
    expect(getShowcaseBreadcrumbs('/utilities')).toEqual([
      {
        label: 'Overview',
        to: '/',
      },
      {
        label: 'Utilities',
        to: '/utilities',
      },
    ])
    expect(getShowcaseBreadcrumbs('/components/ds-button')).toEqual([
      {
        label: 'Overview',
        to: '/',
      },
      {
        label: 'Components',
        to: '/components',
      },
      {
        label: 'DsButton',
        to: '/components/ds-button',
      },
    ])
    expect(getShowcaseBreadcrumbs('/missing')).toEqual([
      {
        label: 'Overview',
        to: '/',
      },
    ])
    expect(getShowcaseEntityByPath('/components/ds-button')?.name).toBe('DsButton')
  })

  it('подключает ленивые route loaders для всех разделов shell-навигации', () => {
    expect(Object.keys(showcaseLazyPageLoaders)).toHaveLength(9)
    expect(showcaseChildRoutes).toHaveLength(11)
    expect(showcaseChildRoutes.every(route => typeof route.component === 'function')).toBe(true)
  })
})