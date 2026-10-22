import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { GR_BASE_THEME_ID, grThemeCatalog } from '@feugene/granularity-tokens'

/**
 * Страница кнопки: настоящая кнопка в теме адреса. axe — по каждой вкладке,
 * включая `color-contrast`: острова тем и образцы токенов стоят рядом с текстом
 * страницы. Карточка темы — ссылка на ту же страницу под этой темой, вкладка
 * переезжает вместе с ней.
 */
const TABS = ['overview', 'style', 'themes', 'tokens', 'hooks'] as const

async function axeViolations(page: import('@playwright/test').Page): Promise<string[]> {
  const result = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)
}

for (const tab of TABS) {
  test(`axe: вкладка ${tab} без нарушений`, async ({ page }) => {
    await page.goto(`/${GR_BASE_THEME_ID}/components/button?tab=${tab}`)
    await page.getByRole('tabpanel').locator('[data-gr-button], table').first().waitFor()

    expect(await axeViolations(page)).toEqual([])
  })
}

test('карточка темы ведёт на ту же вкладку под этой темой', async ({ page }) => {
  const other = grThemeCatalog.find(theme => theme.id !== GR_BASE_THEME_ID)!
  await page.goto(`/${GR_BASE_THEME_ID}/components/button?tab=tokens`)

  await page.getByRole('list', { name: 'Темы каталога' }).getByRole('link', { name: other.title }).click()

  await expect(page).toHaveURL(new RegExp(`/${other.id}/components/button\\?tab=tokens$`))
  await expect(page.locator('html')).toHaveAttribute('data-theme', new RegExp(`^${other.id}-`))
  await expect(page.getByRole('heading', { name: `Значения темы «${other.title}»` })).toBeVisible()
})

test('песочница: шаблон следует за пропсами', async ({ page }) => {
  await page.goto(`/${GR_BASE_THEME_ID}/components/button`)
  const form = page.getByRole('form', { name: 'Пропсы кнопки' })

  await form.getByRole('radio', { name: 'только' }).click()
  await form.getByRole('switch', { name: 'Недоступна' }).click()

  await expect(page.getByRole('figure').filter({ hasText: 'Шаблон' }).locator('code')).toHaveText([
    '<GrButton square aria-label="Сохранить" disabled>',
    '  <GrIcon><IconPlus /></GrIcon>',
    '</GrButton>',
  ].join('\n'))
})
