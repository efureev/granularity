import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { knownIssuesFor } from './a11y-baseline'
import { componentNames, componentPath } from './components'

/**
 * Доступностный слой: axe-core по страницам компонентов витрины.
 *
 * Витрина рендерит живые демо всех компонентов (в т.ч. ручных WAI-ARIA паттернов:
 * GrSelect, GrAutocomplete, GrSlider, GrTree, GrTabs, GrDropdown), поэтому это
 * естественная площадка для сквозной a11y-проверки.
 *
 * Модель гейта: для каждого компонента берём serious/critical нарушения axe,
 * вычитаем ЗАФИКСИРОВАННЫЙ долг (`a11y-baseline.ts`) и падаем на остатке. Значит
 * ловим: регрессии (новое нарушение в «чистом» компоненте), новые компоненты без
 * a11y, и рост долга. Список компонентов — из сгенерированного API-контракта, т.е.
 * новый компонент попадает под гейт автоматически.
 */

const IMPACT_BLOCKLIST = ['serious', 'critical']

async function analyze(page: import('@playwright/test').Page) {
  // Сканируем только области живых демо (`[data-example-preview]`), т.е. сам
  // отрендеренный компонент — а не хром витрины (код-сниппеты, prose-описания).
  //
  // `color-contrast` намеренно отключён: он завязан на дизайн-токен `--muted-fg`
  // (лейблы, подписи, hint'ы по всей системе) — системное решение о палитре, а не
  // структурный баг компонента. Контраст токенов — отдельный трек («Токены как
  // данные» в ANALYSIS.md), а непреднамеренные изменения цвета ловит визуальный
  // слой (`visual.spec.ts`, light+dark). Гейт защищает ARIA-контракт: роли, имена,
  // состояния, структуру, клавиатуру.
  return new AxeBuilder({ page })
    .include('[data-example-preview]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast'])
    .analyze()
}

for (const name of componentNames) {
  test(`a11y: ${name} has no un-baselined serious/critical violations`, async ({ page }) => {
    await page.goto(componentPath(name))
    await page.locator('#live-examples').waitFor()

    const results = await analyze(page)
    const known = new Set(knownIssuesFor(name))

    const regressions = results.violations
      .filter(v => IMPACT_BLOCKLIST.includes(v.impact ?? ''))
      .filter(v => !known.has(v.id))
      .map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }))

    expect(regressions, JSON.stringify(regressions, null, 2)).toEqual([])
  })
}
