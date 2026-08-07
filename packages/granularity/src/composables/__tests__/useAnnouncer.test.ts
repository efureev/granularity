import { afterEach, describe, expect, it } from 'vitest'

import { resetAnnouncer, useAnnouncer } from '../useAnnouncer'
import { inertableOutside, markInert } from '../internal/inert'
import { ensurePortalRoot, resetPortalRoot } from '../internal/portalRoot'

/** Запись текста отложена макротаском — ждём его, а не `nextTick`. */
function flush(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function polite(): HTMLElement | null {
  return document.querySelector('[data-gr-announcer-region="polite"]')
}

function assertive(): HTMLElement | null {
  return document.querySelector('[data-gr-announcer-region="assertive"]')
}

afterEach(() => {
  resetAnnouncer()
  resetPortalRoot()
  document.body.innerHTML = ''
})

describe('useAnnouncer', () => {
  it('ставит оба региона одним хостом и переиспользует его между вызовами', () => {
    useAnnouncer()
    useAnnouncer()

    expect(document.querySelectorAll('#gr-announcer')).toHaveLength(1)
    expect(polite()?.getAttribute('role')).toBe('status')
    expect(polite()?.getAttribute('aria-live')).toBe('polite')
    expect(assertive()?.getAttribute('role')).toBe('alert')
    expect(assertive()?.getAttribute('aria-live')).toBe('assertive')
    expect(polite()?.getAttribute('aria-atomic')).toBe('true')
  })

  it('регионы существуют до первого сообщения и пусты', () => {
    useAnnouncer()

    // Регион, появляющийся сразу с текстом, часть AT не объявляет вовсе,
    // поэтому узлы обязаны стоять в документе заранее.
    expect(polite()).not.toBeNull()
    expect(polite()?.textContent).toBe('')
  })

  it('скрывает регионы стилем, а не `display`/`visibility` — иначе AT их не читает', () => {
    useAnnouncer()

    const style = polite()!.getAttribute('style') ?? ''
    expect(style).toContain('position:absolute')
    expect(style).toContain('clip-path:inset(50%)')
    expect(style).not.toContain('display:none')
    expect(style).not.toContain('visibility:hidden')
  })

  it('пишет текст в регион выбранной вежливости', async () => {
    const { announce } = useAnnouncer()

    announce('Ссылка скопирована')
    announce('Соединение потеряно', { politeness: 'assertive' })
    await flush()

    expect(polite()?.textContent).toBe('Ссылка скопирована')
    expect(assertive()?.textContent).toBe('Соединение потеряно')
  })

  it('объявляет повтор того же сообщения: перед записью регион пустеет', async () => {
    const { announce } = useAnnouncer()

    announce('Тег удалён')
    await flush()
    expect(polite()?.textContent).toBe('Тег удалён')

    announce('Тег удалён')
    // Без пустой фазы мутации нет и диктор молчит — проверяем именно её.
    expect(polite()?.textContent).toBe('')

    await flush()
    expect(polite()?.textContent).toBe('Тег удалён')
  })

  it('стирает текст через `clearAfterMs`, а при `0` оставляет', async () => {
    const { announce } = useAnnouncer()

    announce('Строка удалена', { clearAfterMs: 5 })
    await flush()
    expect(polite()?.textContent).toBe('Строка удалена')

    await flush(10)
    expect(polite()?.textContent).toBe('')

    announce('Идёт синхронизация', { clearAfterMs: 0 })
    await flush(10)
    expect(polite()?.textContent).toBe('Идёт синхронизация')
  })

  it('`clear()` чистит адресно и целиком', async () => {
    const { announce, clear } = useAnnouncer()

    announce('Готово')
    announce('Отказ', { politeness: 'assertive' })
    await flush()

    clear('polite')
    expect(polite()?.textContent).toBe('')
    expect(assertive()?.textContent).toBe('Отказ')

    clear()
    expect(assertive()?.textContent).toBe('')
  })

  it('пустое сообщение игнорируется', async () => {
    const { announce } = useAnnouncer()

    announce('Найдено 3 записи')
    await flush()
    announce('')
    await flush()

    expect(polite()?.textContent).toBe('Найдено 3 записи')
  })

  it('хост не гасится `inert` под открытой модалкой', () => {
    useAnnouncer()

    const portal = ensurePortalRoot()!
    const overlay = document.createElement('div')
    overlay.setAttribute('data-gr-overlay-root', '')
    portal.appendChild(overlay)

    const page = document.createElement('div')
    document.body.appendChild(page)

    markInert(inertableOutside(overlay))

    // `inert` выбрасывает поддерево из дерева доступности: замолчи хост здесь,
    // и объявитель молчал бы ровно там, где нужен больше всего.
    expect(document.getElementById('gr-announcer')!.hasAttribute('inert')).toBe(false)
    expect(page.hasAttribute('inert')).toBe(true)
  })
})
