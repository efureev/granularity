import { expect, test } from '@playwright/test'

import { componentPath } from './components'

/**
 * Поведение, которого в jsdom нет вовсе.
 *
 * Юнит-тесты пакета живут в jsdom, а там нет ни перемещения фокуса по `Tab`, ни
 * активации кнопки по `Enter`, ни layout: `trigger('click')` проверяет
 * обработчик, но не то, что до него можно добраться с клавиатуры, а
 * `ResizeObserver` отсутствует как класс. Ровно поэтому половина клавиатурного
 * контракта `GrBreadcrumbs` из `docs/keyboard.md` и вся его арифметика
 * схлопывания по ширине до сих пор не проверялись в живом браузере.
 *
 * Файл — общая площадка: остальные интерактивные компоненты из системного
 * пункта аудита добавляются сюда же.
 */

/** Что сейчас в фокусе — в виде, пригодном для сообщения об ошибке. */
async function focusedDescription(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => {
    const active = document.activeElement
    if (!active) return 'null'

    const attrs = ['data-testid', 'data-gr-breadcrumbs-item', 'data-gr-breadcrumbs-ellipsis']
      .filter(name => active.hasAttribute(name))
      .join(',')

    return `${active.tagName.toLowerCase()}[${attrs}] «${active.textContent?.trim().slice(0, 24) ?? ''}»`
  })
}

/**
 * На странице несколько путей, схлопнут только один — с ним и работаем.
 *
 * Индекс вычисляется один раз и дальше используется позиционно: фильтр «тот, у
 * кого есть кнопка «…»» пересчитывается на каждом обращении и перестал бы
 * находить путь ровно тогда, когда кнопка исчезает, то есть сразу после
 * раскрытия — а проверять надо именно то, что после него.
 */
async function collapsedBreadcrumbs(page: import('@playwright/test').Page) {
  const index = await page.locator('[data-gr-breadcrumbs]').evaluateAll(nodes =>
    nodes.findIndex(node => node.querySelector('[data-testid="gr-breadcrumbs-ellipsis"]')))

  expect(index, 'на странице нет схлопнутого пути').toBeGreaterThanOrEqual(0)

  return page.locator('[data-gr-breadcrumbs]').nth(index)
}

test.describe('GrBreadcrumbs: клавиатура', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrBreadcrumbs'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-testid="gr-breadcrumbs-ellipsis"]').first().waitFor()
  })

  test('до кнопки «…» можно дойти табом, а `Enter` раскрывает путь', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const ellipsis = breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]')

    // Начинаем с пункта перед кнопкой и делаем ровно один шаг: это и есть
    // проверка, что кнопка стоит в порядке обхода, а не выпала из него.
    await breadcrumbs.locator('[data-gr-breadcrumbs-item]').first().focus()
    await page.keyboard.press('Tab')

    await expect(ellipsis).toBeFocused()

    await page.keyboard.press('Enter')

    await expect(ellipsis).toHaveCount(0)
  })

  test('после раскрытия фокус переезжает на первый раскрытый пункт', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')

    await expect(items).toHaveCount(3)

    await breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]').focus()
    await page.keyboard.press('Enter')

    await expect(items).toHaveCount(6)

    // Кнопка исчезла вместе со схлопыванием: фокус обязан остаться в пути, на
    // том месте, где кнопка и стояла, — иначе он улетел бы на `<body>`.
    await expect(items.nth(1)).toBeFocused()
  })

  test('следующий `Tab` идёт вперёд по пути, а не в его начало', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')

    await breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]').focus()
    await page.keyboard.press('Enter')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('Tab')

    await expect(items.first(), `фокус вернулся в начало: ${await focusedDescription(page)}`).not.toBeFocused()
    await expect(items.nth(2)).toBeFocused()
  })
})

test.describe('GrBreadcrumbs: схлопывание по ширине', () => {
  /** Демо с `autoCollapse` — единственное, где путь однострочный. */
  function autoCollapsed(page: import('@playwright/test').Page) {
    return page.locator('[data-gr-breadcrumbs]').filter({
      has: page.locator('[data-gr-breadcrumbs-list].flex-nowrap'),
    })
  }

  test('узкий контейнер прячет середину, широкий возвращает её', async ({ page }) => {
    await page.goto(componentPath('GrBreadcrumbs'))
    await page.locator('#live-examples').waitFor()

    const breadcrumbs = autoCollapsed(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')
    const ellipsis = breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]')

    await expect(items).toHaveCount(6)
    await expect(ellipsis).toHaveCount(0)

    // Ширину меняет само демо — так же, как её менял бы поворот телефона.
    await page.getByRole('radio', { name: 'Narrow' }).click()

    await expect(ellipsis).toHaveCount(1)
    const narrow = await items.count()
    expect(narrow).toBeLessThan(6)

    // Последний пункт остаётся всегда: он отвечает «где я сейчас».
    await expect(items.last()).toContainText('CHANGELOG.md')

    await page.getByRole('radio', { name: 'Wide' }).click()

    await expect(ellipsis).toHaveCount(0)
    await expect(items).toHaveCount(6)
  })
})
