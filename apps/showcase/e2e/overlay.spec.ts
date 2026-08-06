import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { componentPath } from './components'

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

    // Десяти нажатий хватает, чтобы обойти любую панель по кругу; если ловушка
    // не держит, фокус успеет уйти в хром браузера или на страницу.
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const insideLayer = await page.evaluate(() => {
        const layer = document.querySelector('[data-gr-overlay-root]')
        return Boolean(layer && document.activeElement && layer.contains(document.activeElement))
      })
      expect(insideLayer, `Tab №${i + 1} увёл фокус за пределы окна`).toBe(true)
    }
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
test.describe('панель автокомплита', () => {
  /** Открывает панель первого демо и отдаёт его инпут вместе с его же панелью. */
  async function openPanel(page: import('@playwright/test').Page) {
    await page.goto(componentPath('GrAutocomplete'))
    await page.locator('#live-examples').waitFor()

    // Демо приезжают асинхронно, и появление каждого следующего сдвигает
    // страницу: клик, попавший в этот момент, уходит мимо поля. Ждём все три и
    // при промахе повторяем.
    const inputs = page.locator('[data-testid="gr-autocomplete-input"]')
    await expect(inputs).toHaveCount(3)

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
