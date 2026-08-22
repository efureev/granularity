import { expect, test } from '@playwright/test'

import { componentPath } from './components'

/**
 * Правило во всю ширину и скруглённая панель.
 *
 * Линия, нарисованная рамкой бокса, начинается у самого края поля панели — а на
 * этой глубине угол ещё скруглён, и её конец ложится поверх дуги. Вместо двух
 * самостоятельных линий глаз видит клин, в который они сходятся у каждого угла.
 * Дефект чисто геометрический: ни ошибки сборки, ни падения типов, ни axe —
 * увидеть его можно только замером в браузере, потому этот тест и живёт здесь,
 * а не в jsdom, где классов UnoCSS не существует вовсе.
 */

/** Где по горизонтали начинается видимая линия — в координатах панели. */
async function lineStart(page: import('@playwright/test').Page, panelId: string): Promise<{
  start: number
  depth: number
  arcOuter: number
  arcInner: number
}> {
  return page.evaluate((id) => {
    // Скругление и поле живут на боксе содержимого, а `aria-controls` ведёт на
    // корень слоя — он их не несёт.
    const layer = document.getElementById(id)
    const panel = layer?.matches('[data-gr-dropdown-content]')
      ? layer
      : layer?.querySelector('[data-gr-dropdown-content]')
    const list = panel?.querySelector('[data-gr-dropdown-menu-list]')
    if (!panel || !list) throw new Error('панель или список не найдены')

    const panelStyle = getComputedStyle(panel)
    const radius = Number.parseFloat(panelStyle.borderTopLeftRadius)
    const border = Number.parseFloat(panelStyle.borderTopWidth)
    const depth = border + Number.parseFloat(panelStyle.paddingTop)

    const listLeft = list.getBoundingClientRect().left - panel.getBoundingClientRect().left

    // Линия рамкой начинается у самого края бокса; линия псевдоэлементом —
    // на его инсете. Меряем то, что реально нарисовано.
    const listStyle = getComputedStyle(list)
    const before = getComputedStyle(list, '::before')
    const drawnByBorder = Number.parseFloat(listStyle.borderTopWidth) > 0
    const inset = drawnByBorder ? 0 : Number.parseFloat(before.left || '0')

    const inner = radius - border

    return {
      start: listLeft + (Number.isFinite(inset) ? inset : 0),
      depth,
      // Внешняя и внутренняя границы штриха рамки панели на глубине линии.
      arcOuter: radius - Math.sqrt(radius * radius - (radius - depth) ** 2),
      arcInner: border + inner - Math.sqrt(inner * inner - (inner - (depth - border)) ** 2),
    }
  }, panelId)
}

test.describe('линии у края скруглённой панели', () => {
  test('`borderTop` не упирается в дугу угла', async ({ page }) => {
    await page.goto(componentPath('GrDropdownMenu'))
    await page.locator('#live-examples').waitFor()

    // Панель уезжает в общий портал, и на странице их столько же, сколько меню.
    // Свою находим по `aria-controls` триггера.
    const trigger = page.locator('[data-testid="menu-edge-lines"] button')
    await trigger.click()

    const panelId = await trigger.getAttribute('aria-controls')
    if (!panelId) throw new Error('у триггера нет `aria-controls`')

    await expect(page.locator(`#${panelId}`)).toBeVisible()

    const { start, depth, arcOuter, arcInner } = await lineStart(page, panelId)

    // Проверка осмысленна только пока линия попадает в полосу скругления:
    // изменись поле панели настолько, что линия выйдет из неё, — и тест обязан
    // об этом сказать, а не молча зеленеть.
    expect(depth).toBeLessThan(arcOuter + 16)

    // Запас в 2 px от внутренней границы рамки: конец линии должен стоять на
    // прямом участке края, а не на дуге.
    expect(start).toBeGreaterThan(arcInner + 2)
  })
})
