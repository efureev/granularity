import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import type { A11yRegression } from './regressions'
import { BLOCKING_IMPACTS, selectRegressions } from './regressions'

/** Наборы правил, по которым сверяется доступность. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

export interface A11yScanOptions {
  /** Область скана: превью примера, панель оверлея, корень слоя. */
  include: string
  tags?: readonly string[]
  impacts?: readonly string[]
  /** Зафиксированный долг этой цели: идентификаторы правил axe. */
  known?: readonly string[]
}

/** Прогон axe по области страницы за вычетом зафиксированного долга. */
export async function a11yRegressions(page: Page, options: A11yScanOptions): Promise<A11yRegression[]> {
  const { include, tags = WCAG_TAGS, impacts = BLOCKING_IMPACTS, known = [] } = options

  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags([...tags])
    .analyze()

  return selectRegressions(results.violations, { impacts, known })
}

/** То же, но с утверждением: в отчёт уходит сам список, а не «expected 3 to be 0». */
export async function expectNoA11yRegressions(page: Page, options: A11yScanOptions): Promise<void> {
  const regressions = await a11yRegressions(page, options)

  expect(regressions, JSON.stringify(regressions, null, 2)).toEqual([])
}
