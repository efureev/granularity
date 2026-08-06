import { afterEach, describe, expect, it } from 'vitest'

import { inertableOutside, markInert } from '../internal/inert'

afterEach(() => {
  document.body.innerHTML = ''
})

function appendChildren(): { page: HTMLElement, overlay: HTMLElement, toast: HTMLElement } {
  const page = document.createElement('main')
  const overlay = document.createElement('div')
  const toast = document.createElement('div')
  toast.setAttribute('data-gr-overlay-root', '')

  document.body.append(page, overlay, toast)
  return { page, overlay, toast }
}

describe('inert', () => {
  it('помечает и восстанавливает', () => {
    const { page } = appendChildren()

    const release = markInert([page])
    expect(page.hasAttribute('inert')).toBe(true)
    expect(page.getAttribute('aria-hidden')).toBe('true')

    release()
    expect(page.hasAttribute('inert')).toBe(false)
    expect(page.hasAttribute('aria-hidden')).toBe(false)
  })

  it('возвращает прежнее `aria-hidden`, а не стирает его', () => {
    const { page } = appendChildren()
    page.setAttribute('aria-hidden', 'false')

    markInert([page])()

    expect(page.getAttribute('aria-hidden')).toBe('false')
  })

  it('чужой `inert` не снимает', () => {
    const { page } = appendChildren()
    page.setAttribute('inert', '')

    markInert([page])()

    expect(page.hasAttribute('inert')).toBe(true)
  })

  it('считает держателей: закрытие одного слоя не открывает фон под вторым', () => {
    const { page } = appendChildren()

    const releaseFirst = markInert([page])
    const releaseSecond = markInert([page])

    releaseFirst()
    expect(page.hasAttribute('inert')).toBe(true)

    releaseSecond()
    expect(page.hasAttribute('inert')).toBe(false)
  })

  it('повторное снятие ничего не ломает', () => {
    const { page } = appendChildren()

    const release = markInert([page])
    release()
    release()

    expect(page.hasAttribute('inert')).toBe(false)
  })

  it('гасит всё вне ветки оверлея, кроме других оверлеев', () => {
    const { page, overlay, toast } = appendChildren()

    const blocked = inertableOutside(overlay)

    // Тост обязан остаться видимым и озвученным поверх открытой модалки — ради
    // этого он и сидит на самом верхнем слое шкалы.
    expect(blocked).toContain(page)
    expect(blocked).not.toContain(overlay)
    expect(blocked).not.toContain(toast)
  })

  it('поднимается по всем уровням до `body`, а не только по соседям', () => {
    // Портал внутри контейнера приложения: наивное «все дети body, кроме
    // портала» пометило бы `#app`, а `inert` наследуется вниз — и убил бы сам
    // оверлей вместе со страницей.
    const app = document.createElement('div')
    const page = document.createElement('main')
    const portal = document.createElement('div')
    portal.setAttribute('data-gr-portal', '')
    const overlay = document.createElement('div')
    overlay.setAttribute('data-gr-overlay-root', '')

    const outside = document.createElement('aside')
    portal.append(overlay)
    app.append(page, portal)
    document.body.append(app, outside)

    const blocked = inertableOutside(overlay)

    expect(blocked).toContain(page)
    expect(blocked).toContain(outside)
    expect(blocked).not.toContain(app)
    expect(blocked).not.toContain(portal)
  })

  it('без корня или вне DOM гасить нечего', () => {
    expect(inertableOutside(null)).toEqual([])
    expect(inertableOutside(document.createElement('div'))).toEqual([])
  })
})
