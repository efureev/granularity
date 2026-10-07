import { expect, test } from '@playwright/test'

import { companionPath, componentPath } from './components'

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

/**
 * Панель не выше, чем есть места.
 *
 * `flip` переворачивает панель на другую сторону, `shift` двигает её вдоль края —
 * но сжать её не может ни тот, ни другой. Панель выше вьюпорта после обоих
 * остаётся выше вьюпорта, а слой позиционируется `fixed`, поэтому страница до её
 * низа не доскроллит: содержимое просто недостижимо. Дефект чисто геометрический
 * и виден только замером в живом браузере — в jsdom раскладки нет вовсе.
 */
test.describe('высота якорной панели', () => {
  test('длинная панель у нижнего края сжимается со скроллом, а не уезжает за экран', async ({ page }) => {
    await page.goto(componentPath('GrPopover'))
    await page.locator('#live-examples').waitFor()

    const trigger = page.getByRole('button', { name: /Открыть длинную панель/ })
    await trigger.scrollIntoViewIfNeeded()

    // Ставим триггер к нижнему краю: там, где места под панель заведомо мало.
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('button')]
        .find(b => b.textContent?.includes('Открыть длинную панель'))
      const box = el!.getBoundingClientRect()
      window.scrollBy(0, box.top - (window.innerHeight - box.height - 40))
    })

    await trigger.click()

    // Панелей на странице столько же, сколько поповеров в примерах; свою
    // находим по `aria-controls` триггера, как и в тесте выше.
    const panelId = await trigger.getAttribute('aria-controls')
    if (!panelId)
      throw new Error('у триггера нет `aria-controls`')

    const panel = page.locator(`#${panelId}`)
    await expect(panel).toBeVisible()

    const measured = await panel.evaluate((el) => {
      const box = el.getBoundingClientRect()
      return {
        top: box.top,
        bottom: box.bottom,
        viewport: window.innerHeight,
        overflow: el.scrollHeight - el.clientHeight,
        available: el.style.getPropertyValue('--gr-floating-available-height'),
      }
    })

    // Слой сообщил замер — без него потолок разрешился бы в фолбэк `100vh`.
    expect(measured.available).toMatch(/^\d+px$/)

    // Панель целиком на экране: это и есть то, чего не давали `flip` и `shift`.
    expect(measured.top).toBeGreaterThanOrEqual(-1)
    expect(measured.bottom).toBeLessThanOrEqual(measured.viewport + 1)

    // И содержимое при этом не обрезано, а прокручивается: потолок без скролла
    // прятал бы низ панели ровно так же, как раньше его прятал край экрана.
    expect(measured.overflow).toBeGreaterThan(0)
  })
})

/**
 * Лента в узкой колонке.
 *
 * Трек `1fr` — это `minmax(auto, 1fr)`, и его минимум равен наибольшему
 * минимальному вкладу элементов. У грид-элемента с `overflow: visible` этот
 * вклад равен min-content, то есть для строки с `white-space: nowrap` — её
 * полной ширине. Пока это было так, `truncate` потребителя не срабатывал вовсе:
 * усекать было нечего, колонка раздавалась под текст и выносила строку за край.
 * В jsdom дефекта не существует — раскладки там нет.
 */
test.describe('лента в узкой колонке', () => {
  test('строка сжимается и усекает текст, а не выносит себя за край', async ({ page }) => {
    await page.goto(componentPath('GrTimeline'))
    await page.locator('#live-examples').waitFor()

    // Демо стартует на самой узкой ступени — переключать ничего не нужно.
    const box = page.locator('[data-demo-narrow-box]')
    await expect(box).toBeVisible()

    const measured = await box.evaluate((el) => {
      const title = el.querySelector('[data-gr-timeline-title] .truncate')
        ?? el.querySelector('[data-gr-timeline-title]')

      return {
        boxOverflow: el.scrollWidth - el.clientWidth,
        titleScroll: title ? title.scrollWidth : 0,
        titleClient: title ? title.clientWidth : 0,
        titleOverflow: title ? getComputedStyle(title).textOverflow : '',
      }
    })

    // Ровно то число, которым дефект был записан в аудите потребителя.
    expect(measured.boxOverflow).toBe(0)

    // И текст именно усечён, а не уместился случайно: без этой проверки тест
    // зеленел бы на коротком заголовке, ничего не доказывая.
    expect(measured.titleOverflow).toBe('ellipsis')
    expect(measured.titleScroll).toBeGreaterThan(measured.titleClient)
  })
})

/**
 * Ряд вкладок, который не влезает.
 *
 * Полоса прокрутки у ряда скрыта намеренно, поэтому продолжение за краем не
 * выдаёт себя ничем: вкладки достижимы стрелками, но догадаться, что они там
 * есть, нечем. Признак — затухание маской у того края, за которым ещё есть
 * вкладки. Ни состояние, ни маска в jsdom не существуют: размеры там нули.
 */
test.describe('ряд вкладок за краем', () => {
  test('гаснет тот край, за которым есть продолжение', async ({ page }) => {
    await page.goto(componentPath('GrTabs'))
    await page.locator('#live-examples').waitFor()

    // Демо стартует на самой узкой ступени — переключать ничего не нужно.
    const tablist = page.locator('[data-demo-tabs-box] [role="tablist"]')
    await expect(tablist).toBeVisible()

    // В начале ряда продолжение только справа.
    await expect(tablist).toHaveAttribute('data-overflow', 'end')

    // И оно именно нарисовано, а не только записано в атрибут.
    const masked = await tablist.evaluate(el => getComputedStyle(el).maskImage)
    expect(masked).not.toBe('none')
    expect(masked).toContain('gradient')

    async function scrollTo(ratio: number): Promise<void> {
      await tablist.evaluate((el, value) => {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) * value
      }, ratio)
    }

    await scrollTo(0.5)
    await expect(tablist).toHaveAttribute('data-overflow', 'both')

    await scrollTo(1)
    await expect(tablist).toHaveAttribute('data-overflow', 'start')

    await scrollTo(0)
    await expect(tablist).toHaveAttribute('data-overflow', 'end')
  })
})

/**
 * Потолок списочной панели считается от места, а не от константы.
 *
 * `GrSelect`, `GrAutocomplete` и `GrTreeSelect` держали высоту фиксированным
 * `dropdownMaxHeight` (280/280/320) и о вьюпорте не знали: на коротком экране
 * панель честно строила свои 280 пикселей и уезжала за нижний край вместе с
 * концом списка. Слой умеет измерять доступное место и публикует его в
 * `--gr-floating-available-height`; отсюда потолок панели, а `min-h-0` внутри
 * отдаёт сжатие списку — прокручивается он, а не панель.
 *
 * Дефект геометрический и проявляется только на коротком вьюпорте, поэтому
 * замер здесь, а не в jsdom.
 */
test.describe('высота списочной панели', () => {
  const cases = [
    { component: 'GrSelect', label: 'Search a city', list: '[role="listbox"]' },
    { component: 'GrAutocomplete', label: 'Search a city', list: '[role="listbox"]' },
    { component: 'GrTreeSelect', label: 'Filter and pick several areas', list: '[role="tree"]' },
  ] as const

  for (const item of cases) {
    test(`${item.component}: панель на коротком экране сжимается, а не уезжает за край`, async ({ page }) => {
      // Короткий экран — единственное условие, при котором дефект виден вовсе:
      // на обычном места хватает и фиксированному потолку.
      await page.setViewportSize({ width: 1280, height: 420 })
      await page.goto(componentPath(item.component))
      await page.locator('#live-examples').waitFor()

      const trigger = page.getByLabel(item.label).first()
      await trigger.scrollIntoViewIfNeeded()

      // Триггер по центру экрана: `flip` тут не спасает — мало и сверху, и
      // снизу, и панели остаётся только сжаться.
      await trigger.evaluate((el) => {
        const box = el.getBoundingClientRect()
        window.scrollBy(0, box.top - (window.innerHeight - box.height) / 2)
      })

      await trigger.click()

      // Панели всех примеров страницы живут в общем портале, и в DOM их
      // столько же, сколько демо. Свою находим по `aria-controls` триггера.
      const listId = await trigger.evaluate(el =>
        (el.closest('[aria-controls]') ?? el.querySelector('[aria-controls]'))?.getAttribute('aria-controls') ?? null,
      )
      if (!listId)
        throw new Error('у триггера нет `aria-controls` — панель не открылась')

      const list = page.locator(`#${listId}`)
      await expect(list).toBeVisible()

      const measured = await list.evaluate((node) => {
        // Потолок несёт поверхность панели — прямой потомок слоя: `data-*` и
        // координаты стоят на слое, а классы панели на узле внутри него.
        const surface = node.closest('[data-gr-overlay-root]')!.firstElementChild!

        const isScroller = (el: Element): boolean => {
          const overflow = getComputedStyle(el).overflowY
          return (overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight + 1
        }

        const box = surface.getBoundingClientRect()
        return {
          top: box.top,
          bottom: box.bottom,
          viewport: window.innerHeight,
          available: getComputedStyle(surface).getPropertyValue('--gr-floating-available-height').trim(),
          maxHeight: getComputedStyle(surface).maxHeight,
          surfaceScrolls: isScroller(surface),
          scrollers: [...surface.querySelectorAll('*')].filter(isScroller).length,
        }
      })

      // Слой сообщил замер — без него потолок разрешился бы в фолбэк `100vh`.
      expect(measured.available).toMatch(/^[\d.]+px$/)
      expect(measured.maxHeight).toBe(measured.available)

      // Замер ниже прежней константы: иначе тест зеленел бы и со статическим
      // потолком, ничего о нём не сказав.
      expect(Number.parseFloat(measured.available)).toBeLessThan(280)

      // Панель целиком на экране — то, чего фиксированный потолок не давал.
      expect(measured.top).toBeGreaterThanOrEqual(-1)
      expect(measured.bottom).toBeLessThanOrEqual(measured.viewport + 1)

      // Сжимается список, а не панель, и полоса прокрутки при этом одна.
      expect(measured.surfaceScrolls, 'панель прокручивается сама').toBe(false)
      expect(measured.scrollers, 'скроллер внутри панели должен быть ровно один').toBe(1)
    })
  }
})

/**
 * Заливка области `GrColorPicker` — не «похожая», а точная.
 *
 * Квадрат собран тремя слоями: шкала насыщенности при светлоте 50% и пара
 * вуалей, белой сверху и чёрной снизу. Утверждение, ради которого он собран
 * именно так: осветление и затемнение в HSL — линейная интерполяция к белому и
 * к чёрному, то есть ровно то, что делает наложение с альфой, и цвет под ручкой
 * обязан совпадать с hex до последнего разряда.
 *
 * Проверить это можно только пикселем: вычисленные стили покажут три градиента
 * и на неверной формуле тоже.
 */
async function pixelAt(
  page: import('@playwright/test').Page,
  shot: { toString: (encoding: 'base64') => string },
  ratio: { x: number, y: number },
): Promise<[number, number, number]> {
  return page.evaluate(async ({ base64, x, y }) => {
    const response = await fetch(`data:image/png;base64,${base64}`)
    const bitmap = await createImageBitmap(await response.blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext('2d')!
    context.drawImage(bitmap, 0, 0)

    // Держимся внутри рамки: у самого края в пробу попала бы она, а не заливка.
    const px = Math.min(Math.max(Math.round(bitmap.width * x), 3), bitmap.width - 4)
    const py = Math.min(Math.max(Math.round(bitmap.height * y), 3), bitmap.height - 4)

    const { data } = context.getImageData(px, py, 1, 1)
    return [data[0], data[1], data[2]] as [number, number, number]
  }, { base64: shot.toString('base64'), x: ratio.x, y: ratio.y })
}

test.describe('заливка области выбора цвета', () => {
  test('пиксель под ручкой совпадает с выбранным цветом', async ({ page }) => {
    await page.goto(componentPath('GrColorPicker'))
    await page.locator('#live-examples').waitFor()

    const trigger = page.getByLabel('Accent color').first()
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const area = page.locator('[data-gr-color-picker-area]').first()
    await expect(area).toBeVisible()

    // Ручка закрывает ровно тот пиксель, который надо померить.
    await page.addStyleTag({ content: '[data-gr-color-picker-area-thumb] { display: none !important; }' })

    const panel = area.locator('xpath=ancestor::*[@data-gr-color-picker-panel][1]')
    const hexField = panel.locator('input[data-gr-color-picker-hex]')

    // Несколько точек шкалы: светлая половина, тёмная и насыщенный край.
    for (const hex of ['#8b5cf6', '#f3d6a1', '#2c1a4d', '#0ea5e9']) {
      await hexField.fill(hex)
      await hexField.press('Enter')
      // Значение вернулось из модели — цвет применён, а не только набран.
      await expect(hexField).toHaveValue(hex)

      const { s, l } = await area.evaluate(node => ({
        s: Number(node.querySelector<HTMLInputElement>('[data-gr-color-picker-area-axis="saturation"]')!.value),
        l: Number(node.querySelector<HTMLInputElement>('[data-gr-color-picker-area-axis="lightness"]')!.value),
      }))

      // Снимаем саму область: доля от её снимка не зависит ни от прокрутки
      // страницы, ни от того, в каких координатах считается клип.
      const [r, g, b] = await pixelAt(page, await area.screenshot(), { x: s / 100, y: (100 - l) / 100 })

      const expected = [
        Number.parseInt(hex.slice(1, 3), 16),
        Number.parseInt(hex.slice(3, 5), 16),
        Number.parseInt(hex.slice(5, 7), 16),
      ]

      // Допуск в 4 единицы из 255 — на округление позиции ручки до целого
      // пикселя, а не на приблизительность формулы: она точна.
      for (const [index, channel] of [r, g, b].entries())
        expect(Math.abs(channel - expected[index]), `${hex}: канал ${index}`).toBeLessThanOrEqual(4)
    }
  })
})

/**
 * Раскрытая строка внутри виртуального списка.
 *
 * В jsdom этой пары не существует: там нет ни раскладки, ни высот, а раскрытие
 * с виртуализацией держится именно на них. Здесь проверяется то, что видит
 * пользователь: строка раскрывается, список от этого не дёргается, и раскрытие
 * переживает прокрутку мимо себя.
 *
 * Сам замер (что виртуализатор меряет группу, а не строку) гейтится юнит-тестом
 * `GrDataTable.expand.test.ts`: он подменяет высоту группы и ловит подмену
 * цели. В браузере эта разница в тысячах пикселей списка не видна, и проверка
 * здесь была бы зелёной на сломанной версии.
 */
test.describe('раскрытие внутри виртуального списка', () => {
  test('раскрытая строка не сбивает раскладку ни при раскрытии, ни при прокрутке', async ({ page }) => {
    await page.goto(componentPath('GrDataTable'))
    await page.locator('#live-examples').waitFor()

    // Своё демо: на странице несколько таблиц, и только у этой есть и распорка,
    // и кнопка раскрытия.
    const table = page.locator('[data-gr-datatable]')
      .filter({ has: page.locator('[data-gr-datatable-spacer]') })
      .filter({ has: page.locator('[data-gr-datatable-expand]') })
      .first()

    await table.scrollIntoViewIfNeeded()
    await expect(table).toBeVisible()

    const groupHeight = (detail: boolean) => table.evaluate((node, want) => {
      const group = [...node.querySelectorAll('[data-gr-datatable-row-group]')]
        .find(el => !!el.querySelector('[data-gr-datatable-detail]') === want)
      return group ? group.getBoundingClientRect().height : 0
    }, detail)

    const plain = await groupHeight(false)

    await table.locator('[data-gr-datatable-expand]').first().click()

    // Второй ярус лежит в группе своей строки, а не отдельной строкой рядом:
    // иначе замер виртуализатора до него не дотянулся бы.
    const expanded = await groupHeight(true)
    expect(expanded, 'раскрытая группа не стала выше').toBeGreaterThan(plain)
    await expect(table.locator('[data-gr-datatable-row-group]').filter({
      has: page.locator('[data-gr-datatable-detail]'),
    })).toHaveCount(1)

    /** Первая отрисованная строка при заданном смещении. */
    const firstRowAt = async (top: number) => {
      await table.evaluate((node, value) => {
        node.scrollTop = value
        node.dispatchEvent(new Event('scroll'))
      }, top)

      // Замер уточняет высоты и на несколько пикселей подправляет смещение —
      // это штатная компенсация примитива, чтобы список не дёргался. Допуск
      // меньше строки, поэтому на проверку соответствия она не влияет.
      await expect
        .poll(() => table.evaluate((node, value) => Math.abs(node.scrollTop - value), top))
        .toBeLessThan(32)

      return table.locator('[data-gr-datatable-row]').first().locator('td').nth(1).innerText()
    }

    const firstPass = await firstRowAt(6000)
    // Уезжаем далеко за раскрытые строки и возвращаемся на то же место.
    await firstRowAt(120000)
    const secondPass = await firstRowAt(6000)

    // Одно смещение — одна строка. Разойдись они, раскладка «плывёт»: высоты
    // раскрытых групп не пережили прокрутку мимо них.
    expect(secondPass, 'то же смещение показало другую строку').toBe(firstPass)

    // И раскрытие путешествие пережило. Смотреть на него надо у себя дома:
    // вне окна раскрытой строки нет в разметке — на то и виртуализация.
    await firstRowAt(0)
    await expect(table.locator('[data-gr-datatable-detail]')).toHaveCount(1)
  })
})

/**
 * Липкая первая колонка `GrTable`.
 *
 * В jsdom этого нет: там ни прокрутки, ни ширин, ни `position: sticky`. Юнит
 * гейтит правила, здесь — что они работают: колонка стоит на месте, а под ней
 * ничего не просвечивает.
 */
test.describe('липкая колонка таблицы', () => {
  test('первая колонка стоит при горизонтальной прокрутке, и под ней непрозрачно', async ({ page }) => {
    await page.goto(componentPath('GrTable'))
    await page.locator('#live-examples').waitFor()

    const scroller = page.locator('[data-gr-table-scroll]')
      .filter({ has: page.locator('table[class*="first-child"]') })
      .first()

    await scroller.scrollIntoViewIfNeeded()
    await expect(scroller).toBeVisible()

    const probe = () => scroller.evaluate((node) => {
      const box = node.getBoundingClientRect()
      const first = node.querySelector('tbody tr > *:first-child')!
      const second = node.querySelector('tbody tr > *:nth-child(2)')!

      return {
        scrollLeft: Math.round(node.scrollLeft),
        firstLeft: Math.round(first.getBoundingClientRect().left - box.left),
        secondLeft: Math.round(second.getBoundingClientRect().left - box.left),
        // Полупрозрачный фон видно по наличию альфы в записи цвета.
        translucent: [...node.querySelectorAll('tbody tr > *:first-child')]
          .map(cell => getComputedStyle(cell).backgroundColor)
          .filter(color => /rgba|\/\s*0?\.\d/.test(color)),
      }
    })

    const before = await probe()
    expect(before.scrollLeft, 'таблица не прокручена — проверять нечего').toBe(0)

    await scroller.evaluate((node) => {
      node.scrollLeft = 200
    })
    await expect.poll(() => scroller.evaluate(node => node.scrollLeft)).toBeGreaterThan(0)

    const after = await probe()

    // Колонка осталась на месте, а соседняя уехала: это и есть липкость.
    expect(Math.abs(after.firstLeft - before.firstLeft), 'первая колонка уехала').toBeLessThanOrEqual(1)
    expect(after.secondLeft, 'вторая колонка не сдвинулась — прокрутки не было').toBeLessThan(before.secondLeft)

    /*
     * Оттенки полосы и подсветки полупрозрачны, и наследование фона строки
     * давало сквозь липкую ячейку уезжающие числа. Поэтому альфы у неё быть не
     * должно ни на одной строке.
     */
    expect(after.translucent, 'фон липкой ячейки полупрозрачен — сквозь неё видно').toEqual([])
  })
})

/**
 * Прикреплённая группа кнопок: скруглены только внешние углы.
 *
 * Внутренние углы срезает `<style>` группы, а радиус кнопке ставит утилита. В
 * granum CSS компонента живёт в слое `granum.components`, утилита — в
 * `granum.utilities`, и более поздний слой побеждает при любой специфичности:
 * правило группы «внутренний угол — 0» молча проигрывало, и группа выглядела
 * рядом отдельных кнопок. jsdom каскадных слоёв не знает — замер здесь.
 */
test.describe('прикреплённая группа кнопок', () => {
  test('скруглены только внешние углы', async ({ page }) => {
    await page.goto(componentPath('GrButtonGroup'))
    await page.locator('[data-gr-button-group][data-attached][data-orientation="horizontal"]').first().waitFor()
    const radii = await page.evaluate(() => {
      const group = document.querySelector('[data-gr-button-group][data-attached][data-orientation="horizontal"]')
      if (!group)
        throw new Error('прикреплённая горизонтальная группа не найдена')
      return [...group.querySelectorAll('[data-gr-button]')].map((button) => {
        const style = getComputedStyle(button)
        // Порядок логических углов: start-start, start-end, end-end, end-start.
        return [style.borderStartStartRadius, style.borderStartEndRadius, style.borderEndEndRadius, style.borderEndStartRadius]
          .map(value => Number.parseFloat(value))
      })
    })

    expect(radii.length).toBeGreaterThanOrEqual(3)
    const [first, ...rest] = radii
    const last = rest.pop()!

    expect(first[0]).toBeGreaterThan(0)
    expect(first[3]).toBeGreaterThan(0)
    expect([first[1], first[2]]).toEqual([0, 0])
    for (const middle of rest)
      expect(middle).toEqual([0, 0, 0, 0])
    expect([last[0], last[3]]).toEqual([0, 0])
    expect(last[1]).toBeGreaterThan(0)
    expect(last[2]).toBeGreaterThan(0)
  })
})

/**
 * Поле формы без сдвигов раскладки.
 *
 * Подпись сбоку стояла по верху строки, а подсказка — над контролом: у строки
 * с подсказкой подпись висела над полем, у строки без неё — нет, и таблица
 * подписей была рваной. А ошибка по submit добавляла строку под каждым полем,
 * и форма в диалоге прыгала. Оба дефекта — геометрия, в jsdom их не увидеть.
 */
test.describe('GrFormField: раскладка без сдвигов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrFormField'))
    await page.locator('[data-demo="start-rows"]').waitFor()
  })

  test('подпись сбоку стоит на линии своего контрола — с подсказкой, ошибкой и без', async ({ page }) => {
    const rows = await page.locator('[data-demo="start-rows"] [data-gr-form-field]').evaluateAll(fields =>
      fields.map((field) => {
        const label = field.querySelector('label')!.getBoundingClientRect()
        const control = field.querySelector('[data-gr-form-field-control] > :not([data-gr-form-field-hint]):not([data-gr-form-field-error])')!
          .getBoundingClientRect()

        return { labelMid: label.top + label.height / 2, controlMid: control.top + control.height / 2 }
      }))

    expect(rows).toHaveLength(3)
    for (const row of rows)
      expect(Math.abs(row.labelMid - row.controlMid)).toBeLessThanOrEqual(1)
  })

  test('подсказка при подписи сбоку — под контролом', async ({ page }) => {
    const field = page.locator('[data-demo="start-rows"] [data-gr-form-field]').nth(1)
    const hint = (await field.locator('[data-gr-form-field-hint]').boundingBox())!
    const input = (await field.locator('input').boundingBox())!

    expect(hint.y).toBeGreaterThanOrEqual(input.y + input.height)
  })

  test('`reserveMessage`: ошибки по submit не меняют высоту полей', async ({ page }) => {
    const form = page.locator('[data-demo="reserved"]')
    const heights = () => form.locator('[data-gr-form-field]').evaluateAll(fields => fields.map(field => field.getBoundingClientRect().height))
    const before = await heights()

    await form.getByRole('button', { name: 'Проверить' }).click()
    await expect(form.locator('[data-gr-form-field-error-item]')).toHaveCount(2)

    expect(await heights()).toEqual(before)
  })
})

/**
 * Переполненная зона `left` рисовалась поверх действий справа: «Reports»
 * ложился на «Search». Действия — глобальный интерфейс и не сжимаются; уступает
 * `left`, прокручиваясь у своего края.
 */
test.describe('GrNavbar: переполненная зона слева', () => {
  test('не налезает на действия, а действия видны целиком', async ({ page }) => {
    await page.goto(componentPath('GrNavbar'))
    const demo = page.locator('[data-demo="navbar-overflow"]')
    await demo.waitFor()
    // `elementFromPoint` видит только то, что во вьюпорте.
    await demo.scrollIntoViewIfNeeded()

    const geometry = await demo.evaluate((root) => {
      const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect()
      const left = root.querySelector<HTMLElement>('[data-gr-navbar-left]')!
      const leftRect = left.getBoundingClientRect()
      // Видимая часть ссылки: зона, которая обрезает переполнение, режет и её.
      const clipRight = getComputedStyle(left).overflowX === 'visible' ? Number.POSITIVE_INFINITY : leftRect.right
      const links = [...left.querySelectorAll('nav a')].map(link => Math.min(link.getBoundingClientRect().right, clipRight))
      const search = rect('[data-demo-search]')
      const hit = document.elementFromPoint(search.left + 4, search.top + search.height / 2)

      return {
        visibleLinkRight: Math.max(...links),
        rightLeft: rect('[data-gr-navbar-right]').left,
        search,
        navbar: rect('[data-gr-navbar]'),
        searchOnTop: Boolean(hit?.closest('[data-demo-search]')),
        leftScrolls: left.scrollWidth > left.clientWidth,
      }
    })

    expect(geometry.visibleLinkRight).toBeLessThanOrEqual(geometry.rightLeft)
    expect(geometry.leftScrolls).toBe(true)
    expect(geometry.searchOnTop).toBe(true)
    expect(geometry.search.left).toBeGreaterThanOrEqual(geometry.rightLeft)
    expect(geometry.search.right).toBeLessThanOrEqual(geometry.navbar.right)
  })
})

/**
 * Ряд пагинации переносился посреди навигации: «« Prev» на первой строке, а
 * «1 2 3 … 14 Next »» — на второй. Навигация — один кластер; переносится ряд
 * только между группами.
 */
test.describe('GrPagination: перенос ряда', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrPagination'))
    await page.locator('[data-demo="pagination-560"]').waitFor()
  })

  for (const width of ['560', '360']) {
    test(`${width}px: навигация одной строкой и внутри подвала`, async ({ page }) => {
      const demo = page.locator(`[data-demo="pagination-${width}"]`)
      const box = await demo.evaluate((root) => {
        const nav = root.querySelector('[data-gr-pagination-nav]')!
        const tops = [...nav.children]
          .filter(child => child.getBoundingClientRect().width > 0 && !child.classList.contains('sr-only'))
          .map(child => Math.round(child.getBoundingClientRect().top + child.getBoundingClientRect().height / 2))
        const navRect = nav.getBoundingClientRect()
        const rootRect = root.getBoundingClientRect()

        return { rows: new Set(tops).size, navRight: navRect.right, navLeft: navRect.left, rootRight: rootRect.right, rootLeft: rootRect.left }
      })

      expect(box.rows).toBe(1)
      expect(box.navLeft).toBeGreaterThanOrEqual(box.rootLeft)
      expect(box.navRight).toBeLessThanOrEqual(box.rootRight)
    })
  }
})

/**
 * Чипы `GrSelect tags` переносились, а поле оставалось высотой в одну строку:
 * второй и третий ряд висели под рамкой поверх того, что идёт ниже. Поле
 * растёт вместе с рядами — на всех размерах и с формой `pill`.
 */
test.describe('GrSelect tags: чипы внутри рамки', () => {
  test('в колонке на 190px каждый чип — внутри рамки поля', async ({ page }) => {
    await page.goto(componentPath('GrSelect'))
    const demo = page.locator('[data-demo="select-tags-wrap"]')
    await demo.waitFor()

    const fields = await demo.locator('[data-gr-select]').evaluateAll(roots => roots.map((root) => {
      const box = root.querySelector('[data-gr-select-trigger]')!.getBoundingClientRect()
      const chips = [...root.querySelectorAll('[data-gr-select-tag], [data-gr-select-tag-rest]')].map(chip => chip.getBoundingClientRect())
      const rows = new Set(chips.map(chip => Math.round(chip.top))).size

      return {
        label: root.querySelector('[data-gr-select-trigger]')!.getAttribute('aria-label'),
        rows,
        outside: chips.filter(chip => chip.top < box.top || chip.bottom > box.bottom || chip.left < box.left || chip.right > box.right).length,
        rootHeight: root.getBoundingClientRect().height,
        triggerHeight: box.height,
      }
    }))

    expect(fields).toHaveLength(3)
    for (const field of fields) {
      expect(field.outside, `${field.label}: чипов за рамкой`).toBe(0)
      expect(Math.abs(field.rootHeight - field.triggerHeight), `${field.label}: рамка не совпадает с полем`).toBeLessThanOrEqual(1)
    }
    // Замер имеет смысл, только если ряды и правда переносятся.
    expect(fields.some(field => field.rows > 1)).toBe(true)
  })
})

/**
 * Подписи делений отступали от дорожки на постоянные 0.625rem, и крупная ручка
 * (`--gr-slider-thumb-size` + слот `#thumb`) ложилась на них: на значении 21
 * бегунок на 36px закрывал «21°». Отступ теперь считается от бегунка.
 */
test.describe('GrSlider: подписи делений и крупная ручка', () => {
  test('ручка на 36px не закрывает подписи — ни в колонке, ни в ряду', async ({ page }) => {
    await page.goto(componentPath('GrSlider'))
    const demo = page.locator('[data-demo="slider-big-thumb"]')
    await demo.waitFor()

    const sliders = await demo.locator('[data-gr-slider]').evaluateAll(roots => roots.map((root) => {
      const thumb = root.querySelector('[role="slider"]')!.getBoundingClientRect()
      const labels = [...root.querySelectorAll('[data-gr-slider-mark-label]')].map(label => label.getBoundingClientRect())
      const overlaps = labels.filter(label =>
        label.left < thumb.right && label.right > thumb.left && label.top < thumb.bottom && label.bottom > thumb.top)
      const rootBox = root.getBoundingClientRect()
      const style = getComputedStyle(root)
      const reserveEnd = root.getAttribute('data-orientation') === 'vertical'
        ? rootBox.right + Number.parseFloat(style.marginRight)
        : rootBox.bottom + Number.parseFloat(style.marginBottom)
      const labelsEnd = root.getAttribute('data-orientation') === 'vertical'
        ? Math.max(...labels.map(label => label.right))
        : Math.max(...labels.map(label => label.bottom))

      return { thumb: thumb.width, overlaps: overlaps.length, labelsInsideReserve: labelsEnd <= reserveEnd + 0.5 }
    }))

    expect(sliders).toHaveLength(2)
    for (const slider of sliders) {
      expect(slider.thumb).toBeCloseTo(36, 0)
      expect(slider.overlaps).toBe(0)
      expect(slider.labelsInsideReserve).toBe(true)
    }
  })
})

/**
 * На телефоне «Reset layout», «Edit layout» и свои действия панели дашборда
 * вылезали за край: группа действий не переносилась. Каждая панель на
 * странице — не шире своей колонки.
 */
test.describe('GrDashboardToolbar: узкая колонка', () => {
  test.use({ viewport: { width: 390, height: 900 } })

  test('панель переносит действия, а не вылезает за край', async ({ page }) => {
    await page.goto(companionPath('GrDashboardToolbar'))
    const toolbars = page.locator('[data-gr-dashboard-toolbar]')
    await toolbars.first().waitFor()

    const overflow = await toolbars.evaluateAll(nodes => nodes.map(node => node.scrollWidth - node.clientWidth))
    expect(overflow.length).toBeGreaterThan(0)
    for (const extra of overflow)
      expect(extra).toBeLessThanOrEqual(1)
  })
})

/**
 * В узкой панели (232px) несжимаемый ключ глубокого узла забирал всю строку, и
 * значение обрезалось до нуля: у `amount_paid` не было видно ничего. У значения
 * теперь остаётся минимум ширины.
 */
test.describe('GrJsonViewer: узкая панель', () => {
  test('на 232px каждое значение видно хотя бы частью', async ({ page }) => {
    await page.goto(componentPath('GrJsonViewer'))
    const viewer = page.locator('[data-gr-json-viewer]').first()
    await viewer.waitFor()
    await viewer.evaluate((node) => {
      (node as HTMLElement).style.width = '232px'
    })
    await viewer.getByRole('button', { name: /expand all|развернуть/i }).first().click().catch(() => {})

    const widths = await viewer.locator('[data-gr-json-viewer-value]').evaluateAll(nodes =>
      nodes.filter(node => (node.textContent ?? '').trim() !== '').map(node => node.getBoundingClientRect().width))

    expect(widths.length).toBeGreaterThan(0)
    expect(Math.min(...widths)).toBeGreaterThan(12)
  })
})
