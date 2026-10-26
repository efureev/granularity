import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { GR_BASE_THEME_ID, grThemeCatalog } from '@feugene/granularity-tokens'

/**
 * Страница каждой темы каталога: острова её режимов с настоящими компонентами.
 * axe — без нарушений, включая `color-contrast`: так тема проверяется в
 * браузере, а не только формулами гейтов пакета токенов. Эталон — раздел
 * «Компоненты» в каждом режиме: на нём видны токены компонентов и пропсы по
 * умолчанию темы.
 */
for (const { id } of grThemeCatalog) {
  test.describe(`/themes/${id}`, () => {
    // Эталон — про цвета и токены, не про движение. Бегущий индикатор загрузки
    // выносит остров в композитный слой, и сглаживание текста зависело от того,
    // первым ли идёт тест: без движения снимок от порядка не зависит.
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test.beforeEach(async ({ page }) => {
      await page.goto(`/${GR_BASE_THEME_ID}/themes/${id}`)
      await page.locator('section', { hasText: 'Компоненты' }).locator('[data-gr-button]').first().waitFor()
      // Inter приходит с Google Fonts подмножествами по `unicode-range`: в холодном
      // браузере кириллица не успевала к снимку и рисовалась запасным шрифтом.
      // `load` с образцом текста запускает загрузку обоих подмножеств и ждёт их.
      await page.evaluate(async () => {
        await Promise.all(['400', '500', '600'].map(weight => document.fonts.load(`${weight} 14px Inter`, 'Светлый Latin')))
        await document.fonts.ready
      })
    })

    test('axe: острова режимов без нарушений', async ({ page }) => {
      const result = await new AxeBuilder({ page })
        .include('[data-gr-config-provider]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)).toEqual([])
    })

    test('эталон компонентов в каждом режиме', async ({ page }) => {
      const islands = page.locator('section', { hasText: 'Компоненты' }).locator('[data-gr-config-provider] > div')
      const count = await islands.count()

      expect(count).toBeGreaterThan(0)
      for (let index = 0; index < count; index++)
        await expect(islands.nth(index)).toHaveScreenshot(`${id}-components-${index}.png`)
    })
  })
}
