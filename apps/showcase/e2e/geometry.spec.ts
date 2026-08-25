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
    // Скругление и рамку несёт поверхность панели, а её рисует `GrPopover`:
    // меню стоит на нём и добавляет внутри только поле. Меряем от поверхности,
    // а не от ближайшей обёртки, — сколько узлов между ними, вопрос сборки
    // компонента, а геометрия угла от этого не зависит.
    const layer = document.getElementById(id)
    const surface = layer?.matches('[data-gr-popover-panel]')
      ? layer
      : (layer?.querySelector('[data-gr-popover-panel]')
        ?? layer?.closest('[data-gr-popover-panel]'))
    const list = surface?.querySelector('[data-gr-dropdown-menu-list]')
    if (!surface || !list)
      throw new Error('поверхность панели или список не найдены')

    const surfaceStyle = getComputedStyle(surface)
    const radius = Number.parseFloat(surfaceStyle.borderTopLeftRadius)
    const border = Number.parseFloat(surfaceStyle.borderTopWidth)
    if (!(radius > 0))
      throw new Error(`поверхность не несёт скругления (radius=${surfaceStyle.borderTopLeftRadius}) — замер измеряет не тот узел`)

    const surfaceRect = surface.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()

    // Линия рисуется по верхнему краю списка, поэтому глубина — расстояние от
    // внешнего края поверхности до него: в него уже входят и рамка, и все поля
    // по дороге.
    const depth = listRect.top - surfaceRect.top
    const listLeft = listRect.left - surfaceRect.left

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
    if (!panelId)
      throw new Error('у триггера нет `aria-controls`')

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

/**
 * Подсветка строки не должна закрывать её содержимое.
 *
 * Поверхность строки `GrTree` — абсолютный `::before`, а подпись, шеврон и
 * отметка лежат в потоке: в одном контексте наложения позиционированный слой
 * красится поверх потокового содержимого. При полупрозрачных дефолтах это лишь
 * лёгкое затенение, поэтому витрина дефект не ловила; стоит потребителю задать
 * публичному токену непрозрачное значение — и строка становится пустой полосой.
 *
 * Меряем то, что видит глаз: снимок области подписи и доля пикселей, заметно
 * темнее фона. Вычисленные стили тут не годятся — они и на сломанной версии
 * выглядят законно.
 */
async function inkRatio(page: import('@playwright/test').Page, clip: { x: number, y: number, width: number, height: number }): Promise<number> {
  const shot = await page.screenshot({ clip })

  return page.evaluate(async (base64) => {
    const response = await fetch(`data:image/png;base64,${base64}`)
    const bitmap = await createImageBitmap(await response.blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext('2d')!
    context.drawImage(bitmap, 0, 0)

    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
    let ink = 0

    for (let i = 0; i < data.length; i += 4) {
      // Подпись тёмная, подсветка светлая: считаем всё заметно темнее середины.
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (luma < 128)
        ink += 1
    }

    return ink / (bitmap.width * bitmap.height)
  }, shot.toString('base64'))
}

async function averageLuma(page: import('@playwright/test').Page, clip: { x: number, y: number, width: number, height: number }): Promise<number> {
  const shot = await page.screenshot({ clip })

  return page.evaluate(async (base64) => {
    const response = await fetch(`data:image/png;base64,${base64}`)
    const bitmap = await createImageBitmap(await response.blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext('2d')!
    context.drawImage(bitmap, 0, 0)

    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
    let sum = 0

    for (let i = 0; i < data.length; i += 4)
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    return sum / (bitmap.width * bitmap.height)
  }, shot.toString('base64'))
}

test.describe('подсветка строки дерева', () => {
  test('не закрывает подпись при непрозрачном фоне', async ({ page }) => {
    await page.goto(componentPath('GrTree'))
    await page.locator('#live-examples').waitFor()

    // Ровно то, что делает потребитель: публичный токен без альфы.
    await page.addStyleTag({
      content: '.gr-tree__row { --gr-tree-row-hover-bg: #cbd5e1; --gr-tree-row-current-bg: #cbd5e1; }',
    })

    const label = page.locator('[data-example-preview] .gr-tree__label').first()
    await label.scrollIntoViewIfNeeded()

    const box = await label.boundingBox()
    if (!box)
      throw new Error('подпись строки не найдена')

    const before = await inkRatio(page, box)
    expect(before, 'подпись не видна ещё до наведения').toBeGreaterThan(0.02)

    await label.hover()
    // Ждём, пока применится фон наведения: сравнение идёт по пикселям.
    await page.waitForTimeout(150)

    const after = await inkRatio(page, box)

    expect(after, 'подсветка закрыла подпись').toBeGreaterThan(before * 0.6)
  })

  /**
   * Парная проверка: слой уведён под содержимое отрицательным `z-index`, и без
   * своего контекста наложения он уезжает за фон ближайшего предка с заливкой —
   * подсветка пропадает совсем. Одной проверки «подпись видна» мало: она
   * зелёная и когда подсветки нет вовсе.
   */
  test('подсветка при этом видна', async ({ page }) => {
    await page.goto(componentPath('GrTree'))
    await page.locator('#live-examples').waitFor()

    await page.addStyleTag({
      content: '.gr-tree__row { --gr-tree-row-hover-bg: #cbd5e1; --gr-tree-row-current-bg: #cbd5e1; }',
    })

    const row = page.locator('[data-example-preview] .gr-tree__row').first()
    await row.scrollIntoViewIfNeeded()

    const box = await row.boundingBox()
    if (!box)
      throw new Error('строка не найдена')

    // Правый край строки: подписи там нет, значит меняется ровно фон.
    const strip = { x: box.x + box.width - 40, y: box.y + 2, width: 30, height: Math.max(box.height - 4, 1) }

    const before = await averageLuma(page, strip)
    await row.hover()
    await page.waitForTimeout(150)
    const after = await averageLuma(page, strip)

    expect(Math.abs(after - before), 'фон строки не изменился — подсветки нет').toBeGreaterThan(4)
  })
})

