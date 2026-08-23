import { expect, test } from '@playwright/test'

import { createA11yBaseline, expectNoA11yRegressions } from '@feugene/granularity-test-kit/e2e'

import { a11yKnownIssues } from './a11y-baseline'
import { companionComponentNames, registryComponentNames, scanTargets } from './components'

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
 * a11y, и рост долга.
 *
 * Список целей — `scanTargets` (`components.ts`): страницы компонентов витрины плюс
 * сущности, документированные не своей страницей. Полноту списка относительно
 * реестра пакета проверяет отдельный тест в конце файла.
 *
 * Механика гейта — `@feugene/granularity-test-kit/e2e`; здесь остаются данные:
 * что сканировать, где живёт долг и какая область у превью.
 *
 * `color-contrast` ВКЛЮЧЁН (2026-07-28, ANALYSIS §54). Раньше он был выключен
 * из-за `--gr-muted-fg`, который системно не добирал AA на `--gr-muted` и
 * `--gr-secondary`; токен исправлен в обеих темах, и правило вернулось в гейт.
 * Это не косметика: пока оно молчало, мимо гейта прошли контрастные регрессии
 * `GrAlert` и `GrBadge` (текст тоном на подложке того же тона — до 1.92:1).
 * Визуальный слой их тоже не ловил — там допуск 2 % пикселей.
 */

const baseline = createA11yBaseline(a11yKnownIssues)

for (const target of scanTargets) {
  test(`a11y: ${target.name} has no un-baselined serious/critical violations`, async ({ page }) => {
    await page.goto(target.path)
    await page.locator(target.ready).waitFor()
    // Демо приезжают асинхронными компонентами, а `ready` — это заголовок
    // секции: он появляется раньше них. Без ожидания axe успевал просканировать
    // пустые рамки превью и объявить страницу чистой, ничего не проверив.
    await expect.poll(async () => page.evaluate(() => [...document.querySelectorAll('[data-example-preview]')]
      .filter(preview => preview.childElementCount === 0)
      .length)).toBe(0)

    await expectNoA11yRegressions(page, {
      include: '[data-example-preview]',
      known: baseline.knownIssuesFor(target.name),
    })
  })
}

/**
 * Сторож источника списка. Набор выше выводится из витрины, а обязателен —
 * реестр пакета: компонент, до которого витрина не доросла, обязан ронять гейт,
 * а не тихо выпадать из него. Так `GrDialogService` и потерялся — он есть в
 * реестре, но не в `componentApi.generated.json`, откуда брался список.
 *
 * Реестров теперь два: ядро и companion. Страницы компаньонов до 2.6 не
 * сканировались вовсе — ни этим гейтом, ни визуальным слоем.
 */
test('каждый компонент реестра покрыт e2e', () => {
  const covered = new Set(scanTargets.map(target => target.name))
  const uncovered = [...registryComponentNames, ...companionComponentNames].filter(name => !covered.has(name))

  expect(
    uncovered,
    `Нет ни страницы витрины, ни записи в SERVICE_ENTITIES: ${uncovered.join(', ')}`,
  ).toEqual([])
})
