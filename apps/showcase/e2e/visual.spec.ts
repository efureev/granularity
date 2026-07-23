import { expect, test } from '@playwright/test'

import { componentPath } from './components'

/**
 * Визуальная регрессия: снимок области «Live examples» для набора компонентов.
 *
 * Снапшоты детерминированы (анимации отключены в конфиге, тема форсится в light)
 * и хранятся в `e2e/__screenshots__`. Первый прогон создаёт эталоны
 * (`--update-snapshots`), последующие — сравнивают.
 *
 * Список — репрезентативная выборка (форм-контролы, оверлеи, данные), а не все
 * компоненты: цель слоя — ловить непреднамеренные визуальные сдвиги токенов/стилей,
 * а не покрыть каждый пиксель.
 */
const VISUAL_COMPONENTS = [
  'GrButton',
  'GrAutocomplete',
  'GrSelect',
  'GrSlider',
  'GrInput',
  'GrBadge',
  'GrAlert',
  'GrTabs',
  'GrCard',
  'GrSwitch',
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
