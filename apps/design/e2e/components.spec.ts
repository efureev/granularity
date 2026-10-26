import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { GR_BASE_THEME_ID } from '@feugene/granularity-tokens'

import { catalogGroups, catalogPages, componentSlug, OWN_PAGES } from '../src/app/catalogData'

/**
 * Каталог и страницы компонентов: каждая группа и карточка на месте, страница
 * каждого компонента открывается без ошибок и предупреждений в консоли, axe —
 * включая `color-contrast` — по «Обзору» и «Темам рядом». Страницу кнопки со
 * своими вкладками держит `component.spec.ts`.
 */
/**
 * Панель вкладки и превью проявляются плавно: axe посреди перехода меряет
 * контраст полупрозрачного текста. Ждём конечные анимации; бесконечные (свет по
 * подписи, спиннеры) ждать бессмысленно.
 */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(animation => animation.effect?.getComputedTiming().iterations !== Number.POSITIVE_INFINITY)
    .map(animation => animation.finished.catch(() => undefined))))
}

async function axeViolations(page: Page): Promise<string[]> {
  await settle(page)
  const result = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)
}

function consoleProblems(page: Page): string[] {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      problems.push(message.text())
  })
  page.on('pageerror', error => problems.push(error.message))
  return problems
}

const pages = catalogPages()

test('каталог: группы холста, карточка на каждую страницу, axe без нарушений', async ({ page }) => {
  const problems = consoleProblems(page)
  await page.goto(`/${GR_BASE_THEME_ID}/components`)

  for (const group of catalogGroups)
    await expect(page.getByRole('heading', { level: 2, name: group.title, exact: true })).toBeVisible()
  await expect(page.locator('main article')).toHaveCount(pages.length)

  expect(await axeViolations(page)).toEqual([])
  expect(problems).toEqual([])
})

test('каталог: поиск оставляет подходящие карточки, карточка ведёт на страницу', async ({ page }) => {
  await page.goto(`/${GR_BASE_THEME_ID}/components`)
  await page.getByRole('searchbox', { name: 'Найти компонент' }).fill('табли')

  await expect(page.locator('main article').getByRole('link', { name: 'Table', exact: true })).toBeVisible()
  await expect(page.locator('main article').getByRole('link', { name: 'Input', exact: true })).toHaveCount(0)

  await page.locator('main article').getByRole('link', { name: 'DataTable', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${GR_BASE_THEME_ID}/components/data-table$`))
})

test('переход между компонентами: вкладки показывают новый компонент, а не прежний', async ({ page }) => {
  await page.goto(`/${GR_BASE_THEME_ID}/components/button?tab=hooks`)
  await expect(page.getByRole('heading', { name: /^GrButton · / })).toBeVisible()

  // С компонента на компонент — меню: страница компонента переиспользуется маршрутом.
  const menu = page.getByRole('navigation', { name: 'Разделы дизайн-системы' })
  await menu.getByRole('button', { name: 'Поля ввода' }).click()
  await menu.getByRole('link', { name: 'Input', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${GR_BASE_THEME_ID}/components/input$`))
  await page.getByRole('tab', { name: 'Хуки' }).click()

  await expect(page.getByRole('heading', { name: 'Хуков нет' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /^GrButton · / })).toHaveCount(0)

  await page.getByRole('tab', { name: 'Токены' }).click()
  await expect(page.getByRole('tabpanel').getByText('Своих токенов вида', { exact: false })).toBeVisible()
})

for (const { name } of pages.filter(item => !OWN_PAGES.includes(componentSlug(item.name)))) {
  test(`${name}: «Обзор» и «Темы рядом» без ошибок и нарушений axe`, async ({ page }) => {
    const problems = consoleProblems(page)
    const id = componentSlug(name)

    await page.goto(`/${GR_BASE_THEME_ID}/components/${id}`)
    await expect(page.getByRole('heading', { level: 1, name: name.replace(/^Gr/, ''), exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Состояния и поведение' })).toBeVisible()
    expect(await axeViolations(page), 'overview').toEqual([])

    await page.getByRole('tab', { name: 'Темы рядом' }).click()
    await expect(page.getByRole('list', { name: 'Компонент в темах сборки' })).toBeVisible()
    expect(await axeViolations(page), 'themes').toEqual([])

    expect(problems).toEqual([])
  })
}
