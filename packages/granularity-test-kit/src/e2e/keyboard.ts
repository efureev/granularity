import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Клавиатурные помощники для e2e.
 *
 * Ни одного селектора приложения здесь нет и быть не должно: слой отвечает на
 * вопрос «доберётся ли до этого клавиатура», а что именно проверяют — знает
 * потребитель.
 */

/**
 * Что сейчас в фокусе — в виде, пригодном для сообщения об ошибке.
 *
 * `extraAttrs` дописывает атрибуты компонента к общему списку: без них
 * сообщение про `button[] «»` не говорит ничего, а найти по нему нужный узел
 * среди десятка одинаковых кнопок на странице невозможно.
 */
export async function focusedDescription(page: Page, extraAttrs: string[] = []): Promise<string> {
  return page.evaluate((extra) => {
    const active = document.activeElement
    if (!active)
      return 'null'

    const attrs = ['data-testid', ...extra]
      .filter(name => active.hasAttribute(name))
      .map(name => `${name}=${active.getAttribute(name) || ''}`)
      .join(',')

    return `${active.tagName.toLowerCase()}[${attrs}] «${active.textContent?.trim().slice(0, 24) ?? ''}»`
  }, extraAttrs)
}

/**
 * Есть ли у активного элемента атрибут. Наружу не отдаётся: снаружи его не звал
 * никто, а внутри на нём стоит `tabUntil`.
 */
async function focusedHasAttribute(page: Page, attribute: string): Promise<boolean> {
  return page.evaluate(name => document.activeElement?.hasAttribute(name) ?? false, attribute)
}

/**
 * Жмёт Tab, пока фокус не встанет на элемент с атрибутом, и возвращает число
 * нажатий. Бросает, если за `limit` нажатий не дошёл — это и есть проверка
 * «до элемента можно добраться с клавиатуры», а не «элемент существует».
 */
export async function tabUntil(page: Page, attribute: string, limit = 25): Promise<number> {
  for (let presses = 1; presses <= limit; presses++) {
    await page.keyboard.press('Tab')
    if (await focusedHasAttribute(page, attribute))
      return presses
  }

  throw new Error(
    `за ${limit} нажатий Tab фокус не дошёл до [${attribute}]; последний фокус — ${await focusedDescription(page)}`,
  )
}

/**
 * Обход слоя по Tab: сверяет **посещённые** элементы с табируемыми внутри слоя.
 *
 * Проверки «фокус не ушёл за пределы слоя» для этого мало: ловушка, которая
 * пришпилила фокус к одной кнопке (или к самой панели с `tabindex="-1"`), её
 * проходит — фокус и правда не ушёл. Такой дефект видно только сравнением
 * `activeElement` до и после нажатия, поэтому сверяем множества.
 */
export async function expectTabCycle(page: Page, layerSelector: string, presses = 10): Promise<void> {
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
