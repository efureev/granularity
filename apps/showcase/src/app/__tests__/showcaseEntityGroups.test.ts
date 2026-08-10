import { describe, expect, it } from 'vitest'

import {
  showcaseComponentEntities,
  showcaseComposableEntities,
  showcaseDirectiveEntities,
  showcaseUtilityEntities,
} from '../showcase'
import { compareEntityGroups, getEntityGroupOrder } from '../showcaseEntityGroups'
import type { ShowcasePageName } from '../showcase'
import type { ShowcaseEntityRegistryItem } from '../../content/model'

const packagePages: Array<[ShowcasePageName, ShowcaseEntityRegistryItem[]]> = [
  ['directives', showcaseDirectiveEntities],
  ['composables', showcaseComposableEntities],
  ['utilities', showcaseUtilityEntities],
]

function sortGroups(pageName: ShowcasePageName, groups: string[]) {
  return [...groups].sort((left, right) => compareEntityGroups(pageName, left, right))
}

describe('порядок групп сущностей витрины', () => {
  it('закрепляет порядок групп компонентов', () => {
    expect(getEntityGroupOrder('components')).toEqual([
      'actions',
      'feedback',
      'navigation',
      'overlays',
      'forms',
      'data',
      'utilities',
      'misc',
    ])
  })

  it('закрепляет порядок групп package-страниц', () => {
    expect(getEntityGroupOrder('directives')).toEqual([
      'ungrouped',
      'runtime',
      'overlays',
      'feedback',
      'validation',
    ])
    expect(getEntityGroupOrder('composables')).toEqual(getEntityGroupOrder('directives'))
    expect(getEntityGroupOrder('utilities')).toEqual(getEntityGroupOrder('directives'))
  })

  it('сортирует группы по заданному порядку, а не по алфавиту', () => {
    expect(sortGroups('components', ['forms', 'actions', 'data', 'feedback'])).toEqual([
      'actions',
      'feedback',
      'forms',
      'data',
    ])
  })

  it('уводит неизвестные группы в конец и упорядочивает их детерминированно', () => {
    expect(sortGroups('components', ['zeta', 'forms', 'alpha'])).toEqual(['forms', 'alpha', 'zeta'])
  })

  it('не зависит от локали процесса', () => {
    expect(compareEntityGroups('components', 'actions', 'actions')).toBe(0)
    expect(compareEntityGroups('components', 'forms', 'data')).toBeLessThan(0)
    expect(compareEntityGroups('components', 'data', 'forms')).toBeGreaterThan(0)
  })

  it('покрывает все группы, реально встречающиеся в реестрах', () => {
    const componentGroups = new Set(showcaseComponentEntities.map(entity => entity.group || 'misc'))

    expect([...componentGroups].filter(group => !getEntityGroupOrder('components').includes(group))).toEqual([])

    for (const [pageName, entities] of packagePages) {
      const groups = new Set(entities.map(entity => entity.group || 'ungrouped'))

      expect([...groups].filter(group => !getEntityGroupOrder(pageName).includes(group))).toEqual([])
    }
  })
})
