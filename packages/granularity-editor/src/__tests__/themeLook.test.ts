import { componentSheet, lookElement } from '@feugene/granularity-test-kit/vue'
import { describe, expect, it } from 'vitest'

/**
 * Типографику текста решает тема: крупные заголовки — шрифтом заголовков темы
 * (`--gr-font-display`, как у карточек и окон ядра) с начертанием и кеглем темы,
 * цитата — токенами темы. Значения сверяет гейт тем каталога; здесь —
 * что лист читает именно их.
 */
function nest(...elements: HTMLElement[]): HTMLElement {
  elements.reduce((parent, child) => {
    parent.append(child)
    return child
  })
  return elements.at(-1)!
}

describe('GrMarkdown — вид текста у темы', () => {
  const sheet = componentSheet('GrMarkdown/styles.css')
  const doc = () => lookElement('div', { 'data-gr-markdown': '' })

  it.each([['h1', 'var(--gr-markdown-h1-size)'], ['h2', 'var(--gr-markdown-h2-size)']])('%s — шрифт заголовков темы', (tag, size) => {
    const look = sheet.look(nest(doc(), lookElement(tag, { class: 'gr-md-heading' })))

    expect(look['font-family']).toBe('var(--gr-font-display)')
    expect(look['font-weight']).toBe('var(--gr-markdown-display-weight)')
    expect(look['font-size']).toBe(size)
  })

  it('h3 — шрифт текста: мелкие уровни сканируют глазами', () => {
    const look = sheet.look(nest(doc(), lookElement('h3', { class: 'gr-md-heading' })))

    expect(look['font-family']).toBeUndefined()
    expect(look['font-weight']).toBe('600')
  })

  it('цитата', () => {
    const look = sheet.look(lookElement('blockquote', { class: 'gr-md-quote' }))

    expect(look['font-family']).toBe('var(--gr-markdown-quote-font)')
    expect(look['font-size']).toBe('var(--gr-markdown-quote-size)')
    expect(look.color).toBe('var(--gr-markdown-quote-fg)')
    expect(look['border-inline-start']).toBe('3px solid var(--gr-markdown-quote-bar)')
  })
})

describe('GrRichText — вид текста у темы', () => {
  const sheet = componentSheet('GrRichText/styles.css')
  const area = (tag: string) => nest(lookElement('div', { 'data-gr-rich-text-content': '' }), lookElement('div', { class: 'ProseMirror' }), lookElement(tag, {}))

  it('заголовок верхнего уровня — шрифт заголовков темы', () => {
    const look = sheet.look(area('h2'))

    expect(look['font-family']).toBe('var(--gr-font-display)')
    expect(look['font-weight']).toBe('var(--gr-rich-text-display-weight)')
    expect(look['font-size']).toBe('var(--gr-rich-text-h2-size)')
  })

  it('цитата', () => {
    const look = sheet.look(area('blockquote'))

    expect(look['font-family']).toBe('var(--gr-rich-text-quote-font)')
    expect(look.color).toBe('var(--gr-rich-text-quote-fg)')
    expect(look['border-left']).toBe('2px solid var(--gr-rich-text-quote-bar)')
  })

  it('ссылка — текстовая роль: на фоне поля она обязана держать AA', () => {
    expect(sheet.look(area('a')).color).toBe('var(--gr-primary-text)')
  })

  it('панель — на подложке темы, у недоступного поля прозрачна', () => {
    const toolbar = () => lookElement('div', { 'data-gr-rich-text-toolbar': '' })

    expect(sheet.look(nest(lookElement('div', { 'data-gr-rich-text': '' }), toolbar()))['background-color']).toBe('var(--gr-rich-text-toolbar-bg)')
    expect(sheet.look(nest(lookElement('div', { 'data-gr-rich-text': '', 'data-gr-off': '' }), toolbar()))['background-color']).toBe('transparent')
  })
})
