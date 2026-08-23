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

const FREEZE_STYLE_ID = 'gr-a11y-freeze-motion'

/**
 * Остановить переходы и анимации на время скана.
 *
 * axe читает вычисленный цвет, а кадр посреди движения даёт смешанный: активный
 * пункт `GrSidebar` на середине `transition-colors` — это текст `#7d818b` на
 * фоне `#afabf3`, то есть 1.84:1 там, где в покое 8.59:1. Правило находит
 * дефект, которого у страницы в покое нет, и падение выглядит случайным: всё
 * решает, попал ли скан в 150 мс перехода.
 *
 * Само движение на витрине заводит dev-сервер: UnoCSS отдаёт правила по
 * требованию, и класс, впервые встреченный при монтировании демо, доезжает
 * кадром позже вставки узла. Половину случаев — появление слоя — закрывает
 * точечный `waitForOpaque`, но `transition-colors` и `animate-pulse` он не
 * ловит.
 *
 * Стиль снимается сразу после скана: `a11yRegressions` зовут и посреди
 * сценария, где следующим шагом ждут анимацию.
 */
async function freezeMotion(page: Page): Promise<void> {
  await page.evaluate((id) => {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `*, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }`
    document.head.append(style)
  }, FREEZE_STYLE_ID)
}

async function releaseMotion(page: Page): Promise<void> {
  await page.evaluate(id => document.getElementById(id)?.remove(), FREEZE_STYLE_ID)
}

/** Прогон axe по области страницы за вычетом зафиксированного долга. */
export async function a11yRegressions(page: Page, options: A11yScanOptions): Promise<A11yRegression[]> {
  const { include, tags = WCAG_TAGS, impacts = BLOCKING_IMPACTS, known = [] } = options

  await freezeMotion(page)
  try {
    const results = await new AxeBuilder({ page })
      .include(include)
      .withTags([...tags])
      .analyze()

    return selectRegressions(results.violations, { impacts, known })
  }
  finally {
    await releaseMotion(page)
  }
}

/** То же, но с утверждением: в отчёт уходит сам список, а не «expected 3 to be 0». */
export async function expectNoA11yRegressions(page: Page, options: A11yScanOptions): Promise<void> {
  const regressions = await a11yRegressions(page, options)

  expect(regressions, JSON.stringify(regressions, null, 2)).toEqual([])
}
