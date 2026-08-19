import type { Page } from '@playwright/test'

/**
 * Ждать конца анимации появления слоя.
 *
 * `waitFor({ state: 'visible' })` наступает раньше: элемент уже в документе и
 * занимает место, но ещё полупрозрачен. На такой панели axe считает смешанный
 * цвет и находит несуществующий контрастный дефект, а клик приходится по тому,
 * чего пользователь ещё не видит.
 *
 * Селектор, а не `Locator`: ожидание крутится **в странице**, и элемента к
 * началу может не быть вовсе.
 */
export async function waitForOpaque(page: Page, selector: string, opacity = '1'): Promise<void> {
  await page.waitForFunction(
    ({ target, value }) => {
      const element = document.querySelector(target)

      return element !== null && getComputedStyle(element).opacity === value
    },
    { target: selector, value: opacity },
  )
}
