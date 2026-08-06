import { afterEach, describe, expect, it } from 'vitest'

import { inertableSiblings, markInert } from '../internal/inert'

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

  it('соседи корня — всё, кроме него самого и других оверлеев', () => {
    const { page, overlay, toast } = appendChildren()

    const siblings = inertableSiblings(overlay)

    // Тост обязан остаться видимым и озвученным поверх открытой модалки — ради
    // этого он и сидит на самом верхнем слое шкалы.
    expect(siblings).toContain(page)
    expect(siblings).not.toContain(overlay)
    expect(siblings).not.toContain(toast)
  })

  it('без корня или вне DOM гасить нечего', () => {
    expect(inertableSiblings(null)).toEqual([])
    expect(inertableSiblings(document.createElement('div'))).toEqual([])
  })
})
