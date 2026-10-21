import { expect, type Page, test } from '@playwright/test'
import { loadThemeData } from '@feugene/granularity-tokens'

const [clay, slate] = await Promise.all([loadThemeData('clay'), loadThemeData('slate')])

/** Ошибки консоли страницы — сценарий обязан пройти начисто. */
function consoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      errors.push(message.text())
  })
  page.on('pageerror', error => errors.push(error.message))
  return errors
}

const html = (page: Page) => page.locator('html')

async function pickTheme(page: Page, title: string): Promise<void> {
  await page.getByRole('combobox', { name: 'Тема' }).selectOption({ label: title })
}

/**
 * Тема — первый сегмент адреса: переключатель в шапке ведёт на ту же страницу
 * под другой темой, документ и таблицы основ идут за адресом, выбор переживает
 * перезагрузку и ведёт корень.
 */
test('переключатель темы: адрес, пара на корне, данные основ, перезагрузка', async ({ page }) => {
  const errors = consoleErrors(page)
  await page.goto('/slate/foundations/typography')
  await expect(html(page)).toHaveAttribute('data-theme', 'slate-light')
  await expect(page.getByText(slate.root['gr-font-ui'], { exact: true })).toBeVisible()

  await pickTheme(page, 'Глина')
  await expect(page).toHaveURL(/\/clay\/foundations\/typography$/)
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-light')
  await expect(page.getByText(clay.root['gr-font-ui'], { exact: true })).toBeVisible()
  await expect(page.getByText(slate.root['gr-font-ui'], { exact: true })).toHaveCount(0)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--gr-font-ui').trim())).toBe(clay.root['gr-font-ui'])

  await page.reload()
  await expect(page).toHaveURL(/\/clay\/foundations\/typography$/)
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-light')

  await page.goto('/')
  await expect(page).toHaveURL(/\/clay$/)
  await page.goto('/foundations/color')
  await expect(page).toHaveURL(/\/clay\/foundations\/color$/)

  await page.getByRole('button', { name: 'Тёмный режим' }).click()
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-dark')
  await expect(page).toHaveURL(/\/clay\/foundations\/color$/)

  expect(errors).toEqual([])
})

test('«Применить ко всему приложению» — переход на ту же страницу под этой темой', async ({ page }) => {
  const errors = consoleErrors(page)
  await page.goto('/slate/themes/clay')
  await page.getByRole('button', { name: 'Применить ко всему приложению' }).click()

  await expect(page).toHaveURL(/\/clay\/themes\/clay$/)
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-light')
  await expect(page.getByText('Тема всего приложения')).toBeVisible()
  expect(errors).toEqual([])
})

test('выбор в другой вкладке: адрес идёт за темой документа', async ({ context }) => {
  const [first, second] = [await context.newPage(), await context.newPage()]
  await first.goto('/slate/foundations/space')
  await second.goto('/slate/themes')

  await pickTheme(second, 'Глина')
  await expect(second).toHaveURL(/\/clay\/themes$/)
  await expect(first).toHaveURL(/\/clay\/foundations\/space$/)
  await expect(html(first)).toHaveAttribute('data-theme', 'clay-light')
})

test('чужое слово вместо темы — «не найдено», а панель ведёт в тему документа', async ({ page }) => {
  await page.goto('/ink/foundations/color')
  await expect(page.getByRole('heading', { name: 'Такой страницы нет' })).toBeVisible()
  await expect(html(page)).toHaveAttribute('data-theme', 'slate-light')
  await expect(page.getByRole('link', { name: 'Каталог тем' })).toHaveAttribute('href', '/slate/themes')
})
