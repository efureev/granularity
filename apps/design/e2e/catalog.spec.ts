import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { GR_BASE_THEME_ID, grThemeCatalog } from '@feugene/granularity-tokens'

/**
 * Каталог тем и вкладки страницы темы. axe — по всей странице, включая
 * `color-contrast`: образцы тем стоят островами рядом с текстом страницы.
 * Эталоны блока «Компоненты» страницы темы держит `themes.spec.ts`.
 */
async function axeViolations(page: Page): Promise<string[]> {
  const result = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)
}

test('каталог: axe без нарушений, карточка ведёт на страницу темы', async ({ page }) => {
  await page.goto(`/${GR_BASE_THEME_ID}/themes`)
  await page.getByRole('region', { name: 'Темы каталога рядом' }).locator('code').first().waitFor()

  expect(await axeViolations(page)).toEqual([])

  const other = grThemeCatalog.find(theme => theme.id !== GR_BASE_THEME_ID)!
  await page.locator('article').getByRole('link', { name: other.title, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/themes/${other.id}$`))
})

for (const tab of ['tokens', 'hooks'] as const) {
  test(`страница темы: вкладка ${tab} без нарушений axe`, async ({ page }) => {
    await page.goto(`/${GR_BASE_THEME_ID}/themes/clay?tab=${tab}`)
    await page.getByRole('tabpanel').locator('table').first().waitFor()

    expect(await axeViolations(page)).toEqual([])
  })
}

test('страница темы: вид токенов переключается, назад — в каталог', async ({ page }) => {
  await page.goto(`/${GR_BASE_THEME_ID}/themes/clay?tab=tokens`)
  await expect(page.getByRole('heading', { name: 'Токены темы «Глина»' })).toBeVisible()

  await page.getByRole('radio', { name: /^Примитивы/ }).click()
  await expect(page.getByRole('heading', { name: /^Семейства шрифтов/ })).toBeVisible()

  await page.getByRole('link', { name: 'Каталог тем' }).first().click()
  await expect(page).toHaveURL(new RegExp(`/${GR_BASE_THEME_ID}/themes$`))
})
