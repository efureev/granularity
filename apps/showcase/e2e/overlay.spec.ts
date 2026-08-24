import { expect, test } from '@playwright/test'

import { expectNoA11yRegressions, expectTabCycle, waitForOpaque } from '@feugene/granularity-test-kit/e2e'

import { SERVICE_ENTITIES, componentPath } from './components'

/**
 * Модальный слой в открытом состоянии.
 *
 * Остальные e2e сканируют страницу как есть, то есть оверлеи всегда закрыты, и
 * ни ловушка фокуса, ни `aria-modal`, ни `inert` фона под проверку не попадают
 * вовсе. Здесь окно открывается по-настоящему.
 */

/**
 * Триггер берём по позиции, а не по подписи: подпись приходит из локали
 * витрины, и тест не должен ломаться от перевода.
 */
function modalTrigger(page: import('@playwright/test').Page) {
  return page.locator('[data-example-preview] button').first()
}

async function openFirstModal(page: import('@playwright/test').Page): Promise<void> {
  await modalTrigger(page).click()

  // Дожидаемся конца enter-анимации: на полупрозрачной панели axe считает
  // смешанный цвет и находит несуществующий контрастный дефект.
  await waitForOpaque(page, '[data-gr-modal-panel]')
}

test.describe('модальное окно', () => {
  test('открытое окно проходит axe', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await openFirstModal(page)
    const dialog = page.locator('[data-gr-overlay-root][role="dialog"]')
    await expect(dialog).toBeVisible()

    await expectNoA11yRegressions(page, { include: '[data-gr-overlay-root]' })
  })

  test('объявляет себя модальным и даёт себе имя', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await openFirstModal(page)

    const dialog = page.locator('[data-gr-overlay-root][role="dialog"]')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Имя есть всегда: либо `aria-labelledby` от заголовка, либо `aria-label`.
    const labelledBy = await dialog.getAttribute('aria-labelledby')
    const label = await dialog.getAttribute('aria-label')
    expect(Boolean(labelledBy) || Boolean(label)).toBe(true)
  })

  test('фон уходит из таб-порядка, а Tab не выходит за панель', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await openFirstModal(page)
    await expect(page.locator('[data-gr-modal-panel]')).toBeVisible()

    // Приложение под окном помечено `inert` — иначе таб уходил бы в невидимое.
    await expect(page.locator('#app')).toHaveAttribute('inert', /.*/)

    // Десяти нажатий хватает, чтобы обойти любую панель по кругу.
    await expectTabCycle(page, '[data-gr-overlay-root]')
  })

  test('Esc закрывает окно и возвращает фокус на триггер', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    const trigger = modalTrigger(page)
    await openFirstModal(page)

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-gr-modal-panel]')).toHaveCount(0)

    await expect(trigger).toBeFocused()
    // Фон возвращается в таб-порядок — иначе страница осталась бы мёртвой.
    await expect(page.locator('#app')).not.toHaveAttribute('inert', /.*/)
  })

  test('drawer и просмотрщик снимают своё поддерево после закрытия', async ({ page }) => {
    // Панель уезжает по leave-анимации, и поддерево слоя обязано исчезнуть
    // вместе с ней: оставшийся `fixed inset-0` перехватывал бы клики страницы.
    await page.goto(componentPath('GrDrawer'))
    await page.locator('#live-examples').waitFor()

    await modalTrigger(page).click()
    await expect(page.locator('[data-gr-drawer-panel]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-gr-drawer]')).toHaveCount(0)
    await expect(page.locator('#app')).not.toHaveAttribute('inert', /.*/)
  })
})

/**
 * Панель автокомплита: сканирующий страницу axe до неё не доходит вовсе —
 * в закрытом виде она `display: none`, а её содержимое правило `listbox`
 * проверяет только на живых узлах.
 */
/**
 * Модальный поповер — тот же модальный класс, что окно и drawer, но якорный:
 * панель остаётся у триггера, а страница под ней выключается. Проверяем именно
 * это, потому что по умолчанию поповер немодален и обязан таким остаться.
 */
test.describe('модальный поповер', () => {
  async function openModalPopover(page: import('@playwright/test').Page) {
    await page.goto(componentPath('GrPopover'))
    await page.locator('#live-examples').waitFor()

    // Подпись демо — литерал, а не строка локали: демо не пользуются i18n.
    const trigger = page.getByRole('button', { name: 'Request a refund' })
    await trigger.click()
    await expect(page.locator('[data-gr-popover-panel][aria-modal="true"]')).toBeVisible()

    return trigger
  }

  test('объявляет себя модальным и выключает фон', async ({ page }) => {
    await openModalPopover(page)

    await expect(page.locator('#app')).toHaveAttribute('inert', /.*/)
  })

  test('Tab не выходит за панель, Esc возвращает фокус на триггер', async ({ page }) => {
    const trigger = await openModalPopover(page)

    await expectTabCycle(page, '[data-gr-popover-panel][aria-modal="true"]')

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-gr-popover-panel][aria-modal="true"]')).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page.locator('#app')).not.toHaveAttribute('inert', /.*/)
  })
})

test.describe('панель автокомплита', () => {
  /** Открывает панель первого демо и отдаёт его инпут вместе с его же панелью. */
  async function openPanel(page: import('@playwright/test').Page) {
    await page.goto(componentPath('GrAutocomplete'))
    await page.locator('#live-examples').waitFor()

    // Демо приезжают асинхронно, и появление каждого следующего сдвигает
    // страницу: клик, попавший в этот момент, уходит мимо поля. Ждём их все и
    // при промахе повторяем.
    const inputs = page.locator('[data-testid="gr-autocomplete-input"]')
    await expect(inputs).toHaveCount(5)

    const input = inputs.first()
    await expect.poll(async () => {
      if (await input.getAttribute('aria-expanded') !== 'true')
        await input.click()
      return input.getAttribute('aria-expanded')
    }).toBe('true')

    // Панели всех трёх демо лежат в общем портале, а порядок там — порядок
    // монтирования, то есть порядок разрешения async-компонентов. Свою панель
    // берём по `aria-controls`, а не «первую в DOM».
    const listboxId = await input.getAttribute('aria-controls')
    const panel = page.locator(`[data-gr-autocomplete-panel]:has(#${listboxId})`)
    const options = panel.locator('[data-gr-autocomplete-option]')
    await expect(options.first()).toBeVisible()

    return { input, panel, options }
  }

  test('открытая панель проходит axe', async ({ page }) => {
    const { panel } = await openPanel(page)

    await expectNoA11yRegressions(page, { include: '[data-gr-autocomplete-panel]' })
    await expect(panel).toBeVisible()
  })

  test('Tab уходит из виджета, а не в панель', async ({ page }) => {
    const { input } = await openPanel(page)

    await page.keyboard.press('Tab')

    // Опции не табируемы — иначе Tab начинал бы обход списка, из которого
    // пользователь не видит выхода.
    await expect(input).not.toBeFocused()
    const focusedIsOption = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[data-gr-autocomplete-panel]')),
    )
    expect(focusedIsOption).toBe(false)
  })

  test('выбор мышью оставляет фокус на поле', async ({ page }) => {
    const { input, panel, options } = await openPanel(page)

    await options.first().click()
    await expect(panel).toBeHidden()
    await expect(input).toBeFocused()
  })
})

/**
 * Панель селекта: тот же случай, что и у автокомплита — сканирующий страницу
 * axe до неё не доходит, потому что в закрытом виде она `display: none`.
 */
test.describe('панель селекта', () => {
  async function openPanel(page: import('@playwright/test').Page) {
    await page.goto(componentPath('GrSelect'))
    await page.locator('#live-examples').waitFor()

    // Демо приезжают асинхронно и сдвигают страницу: ждём весь набор и при
    // промахе повторяем клик.
    const triggers = page.locator('[data-gr-select-trigger]')
    await expect.poll(async () => triggers.count()).toBeGreaterThan(3)

    const trigger = triggers.first()
    await expect.poll(async () => {
      if (await trigger.getAttribute('aria-expanded') !== 'true')
        await trigger.click()
      return trigger.getAttribute('aria-expanded')
    }).toBe('true')

    const listboxId = await trigger.getAttribute('aria-controls')
    const panel = page.locator(`[data-gr-select-panel]:has(#${listboxId})`)
    await expect(panel.locator('[data-gr-select-option]').first()).toBeVisible()

    return { trigger, panel }
  }

  test('открытая панель проходит axe', async ({ page }) => {
    const { panel } = await openPanel(page)

    await expectNoA11yRegressions(page, { include: '[data-gr-select-panel]' })
    await expect(panel).toBeVisible()
  })

  test('Tab уходит из виджета, а не в панель', async ({ page }) => {
    const { trigger } = await openPanel(page)

    await page.keyboard.press('Tab')

    await expect(trigger).not.toBeFocused()
    const focusedInPanel = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[data-gr-select-panel]')),
    )
    expect(focusedInPanel).toBe(false)
  })

  test('выбор мышью оставляет фокус на триггере', async ({ page }) => {
    const { trigger, panel } = await openPanel(page)

    await panel.locator('[data-gr-select-option]').first().click()
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

/**
 * Сервис диалогов: единственный компонент пакета, чей UI живёт в собственном
 * хосте вне `#app`, и единственный без страницы компонента — он документирован
 * страницей композабла `useDialogService`.
 *
 * Юнит-тесты сервиса (`useDialogService.test.ts`) закрывают очередь, FIFO, `signal`
 * и даже атрибут `inert` у нижнего окна. Но в jsdom `inert` — просто атрибут:
 * фокус в помеченное поддерево всё равно ходит. Изоляция фона и ловушка фокуса
 * проверяются только здесь.
 */
test.describe('сервис диалогов', () => {
  const servicePage = SERVICE_ENTITIES.GrDialogService

  /** Триггер конкретного demo: `data-preview-key` не зависит ни от порядка карточек, ни от локали. */
  function previewTrigger(page: import('@playwright/test').Page, key: string) {
    return page.locator(`[data-preview-key="${key}"] button`).first()
  }

  /** Окна сервиса. Хост тоже носит `data-gr-overlay-root`, поэтому сужаем по `aria-modal`. */
  function dialogLayers(page: import('@playwright/test').Page) {
    return page.locator('[data-gr-overlay-root][aria-modal]')
  }

  async function openDialog(page: import('@playwright/test').Page, key: string) {
    await page.goto(servicePage.path)
    await page.locator(servicePage.ready).waitFor()

    const trigger = previewTrigger(page, key)
    await trigger.click()

    // Ждём конца enter-анимации: на полупрозрачной панели axe считает смешанный
    // цвет и находит несуществующий контрастный дефект.
    await waitForOpaque(page, '[data-gr-modal-panel]')

    return trigger
  }

  test('открытый confirm проходит axe', async ({ page }) => {
    await openDialog(page, 'use-dialog-service-confirm')
    await expect(dialogLayers(page)).toHaveCount(1)

    await expectNoA11yRegressions(page, { include: '[data-gr-overlay-root][aria-modal]' })
  })

  test('объявляет себя модальным и даёт себе имя', async ({ page }) => {
    await openDialog(page, 'use-dialog-service-confirm')

    const dialog = dialogLayers(page).first()
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Заголовок диалог получает от сервиса, но имя обязано быть при любом вызове.
    const labelledBy = await dialog.getAttribute('aria-labelledby')
    const label = await dialog.getAttribute('aria-label')
    expect(Boolean(labelledBy) || Boolean(label)).toBe(true)
  })

  test('фон уходит из таб-порядка, а Tab не выходит за панель', async ({ page }) => {
    await openDialog(page, 'use-dialog-service-confirm')

    // Хост сервиса лежит в портале рядом с `#app`, поэтому страница гасится целиком.
    await expect(page.locator('#app')).toHaveAttribute('inert', /.*/)

    await expectTabCycle(page, '[data-gr-overlay-root][aria-modal]')
  })

  test('Esc закрывает окно и возвращает фокус на триггер', async ({ page }) => {
    const trigger = await openDialog(page, 'use-dialog-service-confirm')

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-gr-modal-panel]')).toHaveCount(0)

    await expect(trigger).toBeFocused()
    await expect(page.locator('#app')).not.toHaveAttribute('inert', /.*/)
  })

  test('вложенный диалог не пускает фокус в нижний', async ({ page }) => {
    await openDialog(page, 'use-dialog-service-nested')

    // Второй диалог сервис спрашивает из `onConfirm` первого и показывает поверх:
    // нижний остаётся на экране и ждёт ответа верхнего.
    await page.locator('[data-testid="gr-confirm-confirm"]').first().click()
    await expect(dialogLayers(page)).toHaveCount(2)

    const layers = dialogLayers(page)
    await expect(layers.first()).toHaveAttribute('inert', /.*/)
    await expect(layers.last()).not.toHaveAttribute('inert', /.*/)

    // Главное, чего не проверяет jsdom: `inert` реально запрещает фокус, поэтому
    // обход по Tab не может свалиться в нижнее окно.
    await expectTabCycle(page, '[data-gr-overlay-root][aria-modal]')
  })
})

/**
 * Панель пикера в стеке слоёв.
 *
 * Пикер немодален и живёт в том же стеке, что и окно: Esc обязан закрыть
 * верхний слой — панель, — а не окно под ней. Проверить это можно только
 * по-настоящему открыв оба: jsdom не знает ни `inert`, ни порядка слоёв, а
 * витринный axe-скан снимает страницу с закрытыми оверлеями.
 */
test.describe('пикер поверх окна', () => {
  const page = 'extras/gr-date-picker'

  async function openDialogWithPicker(browserPage: import('@playwright/test').Page) {
    await browserPage.goto(page)
    await browserPage.locator('#live-examples').waitFor()

    // Подпись — литерал самого демо, а не строка локали витрины: она стабильна
    // и однозначно указывает на нужный пример.
    await browserPage.getByRole('button', { name: 'Schedule delivery', exact: true }).click()

    await waitForOpaque(browserPage, '[data-gr-modal-panel]')
  }

  test('Esc закрывает панель пикера, а окно остаётся', async ({ page: browserPage }) => {
    await openDialogWithPicker(browserPage)

    // Поле — то, что внутри окна: на странице есть и другие демо. Состояние
    // панели читаем по нему же: сама панель уезжает в портал, и там их столько,
    // сколько пикеров на странице.
    const field = browserPage.locator('[data-gr-modal-panel] [data-gr-date-picker-field]')
    await field.click()
    await expect(field).toHaveAttribute('aria-expanded', 'true')

    await browserPage.keyboard.press('Escape')

    await expect(field).toHaveAttribute('aria-expanded', 'false')
    await expect(browserPage.locator('[data-gr-modal-panel]')).toHaveCount(1)

    // Второй Esc — уже окну: очередь стека, а не два слоя за одно нажатие.
    await browserPage.keyboard.press('Escape')
    await expect(browserPage.locator('[data-gr-modal-panel]')).toHaveCount(0)
  })

  test('панель пикера не заперта ловушкой фокуса окна', async ({ page: browserPage }) => {
    await openDialogWithPicker(browserPage)

    const field = browserPage.locator('[data-gr-modal-panel] [data-gr-date-picker-field]')
    await field.click()
    await expect(field).toHaveAttribute('aria-expanded', 'true')

    // Панель уезжает в портал, то есть вне панели окна: ловушка фокуса обязана
    // считать её своей, иначе фокус на дне календаря был бы «снаружи» окна и
    // ловушка утащила бы его обратно.
    const focusedKey = await browserPage.evaluate(() => document.activeElement?.getAttribute('data-key') ?? null)
    expect(focusedKey).toBeTruthy()
  })
})

/**
 * Порядок отрисовки: панель, открытая изнутри окна, обязана быть **над** ним.
 *
 * Проверяется не числом в стиле, а попаданием: `elementFromPoint` в центре
 * панели возвращает то, что пользователь там видит. Числа проверяет юнит-тест
 * `useFloating`; здесь важен результат в настоящем браузере, потому что панель
 * телепортирована в общий портал и лежит рядом с корнем окна.
 *
 * Регрессия, ради которой гейт заведён: панель уходила под окно, а все
 * существовавшие проверки (Esc, фокус, `inert`) этого не видели.
 */
test.describe('панель поверх окна', () => {
  /** Что реально нарисовано в центре элемента. */
  async function topmostAt(locator: import('@playwright/test').Locator): Promise<string> {
    const box = await locator.boundingBox()
    expect(box, 'панель не отрисована').not.toBeNull()

    return locator.page().evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y)
      if (!element)
        return 'ничего'

      const panel = element.closest('[data-gr-select-panel], [data-gr-popover-panel], [data-gr-date-picker-panel]')
      return panel ? 'панель' : (element.closest('[data-gr-modal-panel]') ? 'окно' : 'страница')
    }, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 })
  }

  test('панель селекта внутри GrModal рисуется поверх окна', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await page.getByRole('button', { name: 'Open form with poppers', exact: true }).click()
    await waitForOpaque(page, '[data-gr-modal-panel]')

    await page.locator('[data-gr-modal-panel] [data-gr-select-trigger], [data-gr-modal-panel] [data-testid="gr-select-trigger"]').first().click()

    const panel = page.locator('[data-gr-select-panel]').first()
    await expect(panel).toBeVisible()
    expect(await topmostAt(panel)).toBe('панель')
  })

  /**
   * Порядок отрисовки против порядка создания.
   *
   * Диалог объявлен в шаблоне демо **раньше** окон, то есть его якорь встал в
   * контейнер портала первым. Пока высота у всех модальных слоёв была одна,
   * он оказывался под окном, открытым позже, — и оставался невидимым, хотя
   * стек считал верхним именно его и гасил окно `inert`. Экран выглядел
   * зависшим: видно окно, которое не отвечает, и не видно того, что отвечает.
   */
  test('диалог, открытый поверх окна, нарисован поверх него', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await page.getByRole('button', { name: 'Открыть лесенку', exact: true }).click()
    await waitForOpaque(page, '[data-gr-modal-panel]')

    await page.getByRole('button', { name: 'Диалог поверх окна', exact: true }).click()

    const dialog = page.getByRole('dialog').filter({ hasText: 'Выбор стратегии' })
    await expect(dialog).toBeVisible()

    const box = await dialog.boundingBox()
    expect(box, 'диалог не отрисован').not.toBeNull()

    // Проверяем нарисованное, а не числа: расхождение было именно в отрисовке.
    const painted = await page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y)
      const root = element?.closest('[role="dialog"]')

      return root?.textContent?.includes('Выбор стратегии') ? 'диалог' : 'что-то другое'
    }, { x: box!.x + box!.width / 2, y: box!.y + 30 })

    expect(painted).toBe('диалог')
  })

  test('окно, открытое позже, лежит выше открытого раньше', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await page.getByRole('button', { name: 'Открыть лесенку', exact: true }).click()
    await waitForOpaque(page, '[data-gr-modal-panel]')
    await page.getByRole('button', { name: 'Открыть окно 2', exact: true }).click()

    const heights = await page.evaluate(() =>
      [...document.querySelectorAll('[data-gr-overlay-root]')].map(root => ({
        z: (root as HTMLElement).style.zIndex,
        inert: root.hasAttribute('inert'),
      })))

    // «Верхний» для отрисовки и «верхний» для `inert` — один и тот же слой.
    expect(heights.at(-1)?.z).toContain('+ 1')
    expect(heights.at(-1)?.inert).toBe(false)
    expect(heights.at(-2)?.inert).toBe(true)
  })

  test('панель пикера внутри GrDialog рисуется поверх окна', async ({ page }) => {
    await page.goto('extras/gr-date-picker')
    await page.locator('#live-examples').waitFor()

    await page.getByRole('button', { name: 'Schedule delivery', exact: true }).click()
    await waitForOpaque(page, '[data-gr-modal-panel]')

    await page.locator('[data-gr-modal-panel] [data-gr-date-picker-field]').click()

    const panel = page.locator('[data-gr-date-picker-panel]').last()
    await expect(panel).toBeVisible()
    expect(await topmostAt(panel)).toBe('панель')
  })
})
