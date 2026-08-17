import { describe, expect, it } from 'vitest'

import { titleWhenTruncated } from '../truncationTitle'

/**
 * jsdom раскладки не считает: `scrollWidth` и `clientWidth` там всегда нули.
 * Ширины задаются вручную — предмет проверки в самом правиле, а не в замере.
 */
function element(text: string, widths: { scroll: number, client: number }): HTMLElement {
  const node = document.createElement('span')
  node.textContent = text

  Object.defineProperty(node, 'scrollWidth', { value: widths.scroll, configurable: true })
  Object.defineProperty(node, 'clientWidth', { value: widths.client, configurable: true })

  return node
}

function hover(node: HTMLElement): void {
  titleWhenTruncated({ currentTarget: node } as unknown as Event)
}

describe('titleWhenTruncated', () => {
  it('обрезанная строка отдаёт полный текст', () => {
    const node = element('Включено в подписку', { scroll: 240, client: 80 })

    hover(node)

    expect(node.getAttribute('title')).toBe('Включено в подписку')
  })

  // Тултип, дублирующий видимую целиком подпись, — шум, а не помощь.
  it('целиком видимая строка подсказки не получает', () => {
    const node = element('Да', { scroll: 40, client: 80 })

    hover(node)

    expect(node.hasAttribute('title')).toBe(false)
  })

  // `scrollWidth` округляется вверх, и у необрезанной строки он бывает на
  // единицу больше — без запаса подсказка появлялась бы на ровном месте.
  it('разница в пиксель обрезкой не считается', () => {
    const node = element('Ровно', { scroll: 81, client: 80 })

    hover(node)

    expect(node.hasAttribute('title')).toBe(false)
  })

  // Ширина меняется: колонка расширилась, и устаревшая подсказка соврала бы.
  it('подсказка снимается, когда строка перестала обрезаться', () => {
    const node = element('Включено в подписку', { scroll: 240, client: 80 })
    hover(node)

    Object.defineProperty(node, 'clientWidth', { value: 400, configurable: true })
    hover(node)

    expect(node.hasAttribute('title')).toBe(false)
  })

  it('пустая строка подсказки не получает', () => {
    const node = element('   ', { scroll: 240, client: 80 })

    hover(node)

    expect(node.hasAttribute('title')).toBe(false)
  })

  // У поля ввода видимая строка живёт в `value`: диапазон дат «18 июл. 2026 г.
  // — 17 …» иначе остался бы без подсказки, потому что `textContent` там пуст.
  it('поле ввода отдаёт своё значение, а не содержимое узла', () => {
    const input = document.createElement('input')
    input.value = '18 июл. 2026 г. — 17 авг. 2026 г.'

    Object.defineProperty(input, 'scrollWidth', { value: 320, configurable: true })
    Object.defineProperty(input, 'clientWidth', { value: 140, configurable: true })

    hover(input)

    expect(input.getAttribute('title')).toBe('18 июл. 2026 г. — 17 авг. 2026 г.')
  })

  it('чужая цель события не роняет обработчик', () => {
    expect(() => titleWhenTruncated({ currentTarget: null } as unknown as Event)).not.toThrow()
  })
})
