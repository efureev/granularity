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
 * Как выглядит primary-кнопка и как обязана по токенам темы. Эталон — инлайн-проба:
 * она слоям не подчиняется. Утилиты кнопки живут в слое granum и проигрывают
 * сбросу, если granum объявлен раньше него: `tailwind-compat` фон кнопок не трогает,
 * но обнуляет `padding` и наследует `font-weight`.
 */
function buttonLook(page: Page, name: string): Promise<{ fill: string, weight: string, padding: string, token: { fill: string, weight: string } }> {
  return page.getByRole('button', { name, exact: true }).evaluate((button) => {
    const probe = document.createElement('span')
    probe.style.backgroundColor = 'var(--gr-button-primary-bg, var(--gr-primary))'
    probe.style.fontWeight = 'var(--gr-button-font-weight, var(--gr-font-medium))'
    button.after(probe)
    const token = { fill: getComputedStyle(probe).backgroundColor, weight: getComputedStyle(probe).fontWeight }
    probe.remove()
    const style = getComputedStyle(button)
    return { fill: style.backgroundColor, weight: style.fontWeight, padding: style.paddingInlineStart, token }
  })
}

function expectOwnLook(look: Awaited<ReturnType<typeof buttonLook>>): void {
  expect(look.fill).toBe(look.token.fill)
  expect(look.weight).toBe(look.token.weight)
  expect(look.padding).not.toBe('0px')
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
  // Минификатор сборки меняет кавычки в значении — сравниваем без них.
  const fontUi = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--gr-font-ui').trim())
  expect(fontUi.replaceAll('"', '\'')).toBe(clay.root['gr-font-ui'])

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

/**
 * Перезагрузка в дополнительной теме: скрипт в `<head>` ставит пару и ссылку на лист
 * до первого кадра, а лист, объявляющий слои granum, не обгоняет сброс приложения —
 * в dev его держит порядок слоёв в `index.html`, на сборке — место скрипта после стилей.
 */
test('кнопка идёт за темой: смена, перезагрузка, скрипт до первого кадра', async ({ page }) => {
  await page.goto('/slate/foundations/accessibility')
  const slateLook = await buttonLook(page, 'Найти')
  expectOwnLook(slateLook)

  await pickTheme(page, 'Глина')
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-light')
  // Фон переходит плавно (`transition`) — ждём, пока он сядет на значение темы.
  await expect.poll(async () => {
    const look = await buttonLook(page, 'Найти')
    return look.fill === look.token.fill && look.fill !== slateLook.fill
  }).toBe(true)

  await page.route('**/*', route => (route.request().resourceType() === 'script' ? route.abort() : route.continue()))
  await page.reload()
  await expect(html(page)).toHaveAttribute('data-theme', 'clay-light')
  await expect(page.locator('link[data-granum-theme="clay"]')).toHaveAttribute('blocking', 'render')
  await page.unroute('**/*')

  await page.reload()
  await expect(page.locator('link[data-granum-theme="clay"]')).toHaveAttribute('data-granum-state', 'load')
  const clayLook = await buttonLook(page, 'Найти')
  expectOwnLook(clayLook)
  expect(clayLook.fill).not.toBe(slateLook.fill)
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
