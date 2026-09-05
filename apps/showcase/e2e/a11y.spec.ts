import { expect, test } from '@playwright/test'

import { a11yRegressions, createA11yBaseline, expectNoA11yRegressions } from '@feugene/granularity-test-kit/e2e'

import { a11yKnownIssues } from './a11y-baseline'
import { waitForSettledPreviews } from './readiness'
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
    await waitForSettledPreviews(page)

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

/**
 * Сторож самого измерения: axe обязан читать цвета в покое.
 *
 * Кадр посреди движения даёт смешанный цвет, и `color-contrast` находит дефект,
 * которого у страницы в покое нет. На витрине это выглядело случайным падением
 * `GrSidebar`: dev-сервер отдаёт правила UnoCSS по требованию, класс активного
 * пункта доезжает кадром позже вставки узла, и `transition-colors` играет ровно
 * в окне скана.
 *
 * Стенд свой, а не страница витрины: демо переписывают, а инвариант принадлежит
 * гейту. Проверяются оба вида движения — у перехода и у анимации разные способы
 * попасть в кадр, и заморозка обязана снимать оба.
 */
test('a11y: скан меряет покой, а не кадр движения', async ({ page }) => {
  await page.setContent(`
    <main id="probe-area">
      <style>
        /* В покое обе кнопки — белым по #4f46e5, это 8.59:1. */
        #by-animation, #by-transition { background: #4f46e5; color: #ffffff }
        /* Анимация держит середину пути постоянно: #7d818b на #afabf3 — 1.84:1. */
        #by-animation { animation: drift 10s linear infinite }
        @keyframes drift { 0%, 100% { background: #afabf3; color: #7d818b } }
        /* Переход едет из той же середины секунду, и скан приходится на путь. */
        #by-transition { background: #afabf3; color: #7d818b; transition: background-color 1s linear, color 1s linear }
        #by-transition.is-settling { background: #4f46e5; color: #ffffff }
      </style>
      <button id="by-animation" type="button">Пункт с анимацией</button>
      <button id="by-transition" type="button">Пункт с переходом</button>
    </main>
  `)
  await page.evaluate(() => document.getElementById('by-transition')?.classList.add('is-settling'))
  await page.waitForTimeout(400)

  expect(await a11yRegressions(page, { include: '#probe-area' })).toEqual([])
})
