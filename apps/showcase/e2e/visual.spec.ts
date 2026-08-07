import { expect, test } from '@playwright/test'

import { componentPath } from './components'

/**
 * Визуальная регрессия: снимок области «Live examples» для набора компонентов.
 *
 * Снапшоты детерминированы (анимации отключены в конфиге, тема форсится) и
 * хранятся в `e2e/__screenshots__`. Первый прогон создаёт эталоны
 * (`--update-snapshots`), последующие — сравнивают.
 *
 * Допуски заданы в `playwright.config.ts` и намеренно строгие (`threshold: 0` +
 * абсолютный `maxDiffPixels`): цель слоя — ловить именно цветовые регрессии
 * токенов, а они при дефолтных допусках не видны в принципе.
 *
 * Список — не все 60 компонентов, а выборка по визуальному «языку»: форм-контролы,
 * поверхности, данные, состояния. Компонент попадает сюда, если его вид завязан на
 * токены и стабилен без взаимодействия; оверлеи, открывающиеся по клику, и всё с
 * асинхронным содержимым — нет, они дают мигающие эталоны.
 */
const VISUAL_COMPONENTS = [
  // Форм-контролы: на них завязана бо́льшая часть цветовых токенов.
  'GrButton',
  'GrInput',
  'GrTextarea',
  'GrNumberInput',
  'GrSelect',
  'GrAutocomplete',
  'GrCheckbox',
  'GrRadioGroup',
  'GrSwitch',
  'GrSlider',
  'GrRating',
  'GrSegmented',
  'GrInputTag',
  'GrFormField',
  // Поверхности и типографика.
  'GrCard',
  'GrAlert',
  'GrBadge',
  'GrDivider',
  'GrKbd',
  'GrLink',
  'GrAvatar',
  'GrEmptyState',
  // Данные и навигация.
  'GrTable',
  'GrDataTable',
  'GrTabs',
  'GrBreadcrumbs',
  'GrPagination',
  'GrList',
  'GrProgressBar',
  'GrSkeleton',
  'GrStatistic',
]

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual (${theme})`, () => {
    for (const name of VISUAL_COMPONENTS) {
      test(`${name} live examples`, async ({ page }) => {
        // Форсим тему до загрузки приложения, чтобы снапшот был стабильным.
        await page.emulateMedia({ colorScheme: theme })
        await page.addInitScript((t) => {
          try {
            localStorage.setItem('gr-theme', t)
          }
          catch {
            // ignore storage errors
          }
        }, theme)

        await page.goto(componentPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        // Даём шрифтам/иконкам дорисоваться.
        await page.waitForLoadState('networkidle')

        await expect(examples).toHaveScreenshot(`${componentPath(name).replace('/', '-')}-${theme}.png`)
      })
    }
  })
}
