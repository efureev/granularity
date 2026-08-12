import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

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
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-gr-modal-panel]')
    return Boolean(panel) && getComputedStyle(panel!).opacity === '1'
  })
}

/**
 * Обход слоя по Tab: сверяет **посещённые** элементы с табируемыми внутри слоя.
 *
 * Проверки «фокус не ушёл за пределы слоя» для этого мало: ловушка, которая
 * пришпилила фокус к одной кнопке (или к самой панели с `tabindex="-1"`), её
 * проходит — фокус и правда не ушёл. Такой дефект видно только сравнением
 * `activeElement` до и после нажатия, поэтому сверяем множества.
 */
async function expectTabCycle(
  page: import('@playwright/test').Page,
  layerSelector: string,
  presses = 10,
): Promise<void> {
  const describe = (selector: string) => {
    const layers = document.querySelectorAll(selector)
    const layer = layers[layers.length - 1] as HTMLElement | undefined
    const active = document.activeElement as HTMLElement | null
    const name = (element: HTMLElement) =>
      `${element.tagName}:${element.getAttribute('data-testid') ?? (element.textContent ?? '').trim().slice(0, 20)}`

    if (!layer)
      return { tabbables: [] as string[], active: null as string | null }

    const tabbables = [...layer.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]',
    )]
      .filter(element => Number.parseInt(element.getAttribute('tabindex') ?? '0', 10) >= 0)
      .filter(element => element.closest('[inert]') === null)
      .filter(element => element.getClientRects().length > 0)
      .map(name)

    return {
      tabbables,
      active: active && layer.contains(active) ? name(active) : null,
    }
  }

  const { tabbables } = await page.evaluate(describe, layerSelector)
  expect(tabbables.length, 'в слое нет ни одного табируемого элемента').toBeGreaterThan(0)

  const visited: string[] = []

  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab')
    const { active } = await page.evaluate(describe, layerSelector)
    expect(active, `Tab №${i + 1} увёл фокус за пределы слоя`).not.toBeNull()
    visited.push(active!)
  }

  expect(
    [...new Set(visited)].sort(),
    `Tab не обошёл слой: посетил ${JSON.stringify(visited)}, табируемые — ${JSON.stringify(tabbables)}`,
  ).toEqual([...new Set(tabbables)].sort())
}

test.describe('модальное окно', () => {
  test('открытое окно проходит axe', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()

    await openFirstModal(page)
    const dialog = page.locator('[data-gr-overlay-root][role="dialog"]')
    await expect(dialog).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include('[data-gr-overlay-root]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
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
      if (await input.getAttribute('aria-expanded') !== 'true') await input.click()
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

    const results = await new AxeBuilder({ page })
      .include('[data-gr-autocomplete-panel]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
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
      if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click()
      return trigger.getAttribute('aria-expanded')
    }).toBe('true')

    const listboxId = await trigger.getAttribute('aria-controls')
    const panel = page.locator(`[data-gr-select-panel]:has(#${listboxId})`)
    await expect(panel.locator('[data-gr-select-option]').first()).toBeVisible()

    return { trigger, panel }
  }

  test('открытая панель проходит axe', async ({ page }) => {
    const { panel } = await openPanel(page)

    const results = await new AxeBuilder({ page })
      .include('[data-gr-select-panel]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
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
    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-gr-modal-panel]')
      return Boolean(panel) && getComputedStyle(panel!).opacity === '1'
    })

    return trigger
  }

  test('открытый confirm проходит axe', async ({ page }) => {
    await openDialog(page, 'use-dialog-service-confirm')
    await expect(dialogLayers(page)).toHaveCount(1)

    const results = await new AxeBuilder({ page })
      .include('[data-gr-overlay-root][aria-modal]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
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

    await browserPage.waitForFunction(() => {
      const panel = document.querySelector('[data-gr-modal-panel]')
      return Boolean(panel) && getComputedStyle(panel!).opacity === '1'
    })
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
