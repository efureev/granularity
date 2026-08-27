import { afterEach, describe, expect, it, vi } from 'vitest'

import type { GrDevEvent, GrDevHook, GrOverlaySnapshot } from '../internal/devHook'
import { emitGrDevEvent, registerGrVirtualList, resetGrDevHook } from '../internal/devHook'
import {
  pushOverlayLayer,
  removeOverlayLayer,
  resetOverlayStack,
} from '../composables/internal/overlayStack'

/**
 * Гейт dev-канала ядра.
 *
 * Канал существует ради наблюдателя, но платит за это пакет: он обязан быть
 * незаметен для поведения. Отсюда две группы проверок — «картина совпадает с
 * тем, что стек раздал слоям» и «наблюдатель не влияет ни на что».
 */

function hook(): GrDevHook {
  return (globalThis as typeof globalThis & { __GR_DEV_HOOK__?: GrDevHook }).__GR_DEV_HOOK__!
}

function listen(): GrDevEvent[] {
  const seen: GrDevEvent[] = []
  emitGrDevEvent({ type: 'overlay:sync', layers: [] })
  hook().listeners.add(event => seen.push(event))
  hook().events.splice(0, hook().events.length)
  return seen
}

function layer(modal: boolean, shouldClose = () => true) {
  return { modal, shouldClose, close: () => {} }
}

function snapshot(events: GrDevEvent[]): GrOverlaySnapshot[] {
  const last = [...events].reverse().find(event => event.type === 'overlay:sync')
  return last?.type === 'overlay:sync' ? last.layers : []
}

afterEach(() => {
  resetOverlayStack()
  resetGrDevHook()
})

describe('dev-канал: картина стека', () => {
  it('снимок повторяет порядок регистрации слоёв', () => {
    const seen = listen()

    const first = pushOverlayLayer(layer(true))
    const second = pushOverlayLayer(layer(false))

    expect(snapshot(seen).map(item => item.id)).toEqual([first, second])
  })

  it('Esc адресован последнему слою любого рода, `inert` — модалкам ниже последней модальной', () => {
    const seen = listen()

    pushOverlayLayer(layer(true))
    pushOverlayLayer(layer(true))
    pushOverlayLayer(layer(false))

    expect(snapshot(seen)).toMatchObject([
      { modal: true, topmostForEscape: false, inert: true, depth: 0 },
      { modal: true, topmostForEscape: false, inert: false, depth: 1 },
      { modal: false, topmostForEscape: true, inert: false, depth: null },
    ])
  })

  it('слой, не закрывающийся по Esc, виден таким в снимке', () => {
    const seen = listen()

    pushOverlayLayer(layer(true, () => false))

    expect(snapshot(seen)[0]?.closesOnEscape).toBe(false)
  })

  it('снятие слоя пересчитывает картину', () => {
    const seen = listen()

    const first = pushOverlayLayer(layer(true))
    const second = pushOverlayLayer(layer(true))
    removeOverlayLayer(second)

    expect(seen.some(event => event.type === 'overlay:remove' && event.id === second)).toBe(true)
    expect(snapshot(seen)).toMatchObject([{ id: first, topmostForEscape: true, inert: false, depth: 0 }])
  })

  it('Esc сообщает, кому достался и закрыл ли', () => {
    const seen = listen()
    const id = pushOverlayLayer(layer(true, () => false))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))

    expect(seen).toContainEqual({ type: 'overlay:escape', id, closed: false })
  })
})

describe('dev-канал: владелец слоя и фокус', () => {
  it('слой, заведённый вне компонента, владельца не имеет', () => {
    const seen = listen()
    pushOverlayLayer(layer(true))

    expect(snapshot(seen)[0]).toMatchObject({ owner: null, focus: null })
  })

  it('владелец доезжает и до события, и до снимка', () => {
    const seen = listen()
    const id = pushOverlayLayer({ ...layer(true), owner: 'GrModal' })

    expect(seen).toContainEqual({ type: 'overlay:push', id, modal: true, owner: 'GrModal' })
    expect(snapshot(seen)[0]?.owner).toBe('GrModal')
  })

  it('картину фокуса слой рассказывает сам — в момент снимка, а не регистрации', () => {
    const seen = listen()
    const describeFocus = vi.fn(() => ({ inside: true, willRestore: true, restoreTo: 'button «Открыть»' }))

    pushOverlayLayer({ ...layer(true), describeFocus })
    expect(describeFocus).toHaveBeenCalledTimes(1)

    expect(snapshot(seen)[0]?.focus).toEqual({ inside: true, willRestore: true, restoreTo: 'button «Открыть»' })
  })
})

describe('dev-канал: незаметность для пакета', () => {
  it('без подписчиков стек работает как обычно', () => {
    const close = vi.fn()
    const id = pushOverlayLayer({ modal: true, shouldClose: () => true, close })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))

    expect(close).toHaveBeenCalledTimes(1)
    expect(hook().events.some(event => event.type === 'overlay:push' && event.id === id)).toBe(true)
  })

  it('исключение в слушателе не ломает того, за кем он наблюдает', () => {
    const close = vi.fn()
    emitGrDevEvent({ type: 'overlay:sync', layers: [] })
    hook().listeners.add(() => {
      throw new Error('наблюдатель сломался')
    })

    expect(() => pushOverlayLayer({ modal: true, shouldClose: () => true, close })).not.toThrow()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('буфер отдаёт накопленное тому, кто подключился позже', () => {
    pushOverlayLayer(layer(true))
    pushOverlayLayer(layer(false))

    expect(hook().events.filter(event => event.type === 'overlay:push')).toHaveLength(2)
    expect(snapshot(hook().events)).toHaveLength(2)
  })

  it('буфер не растёт бесконечно', () => {
    for (let index = 0; index < 200; index += 1)
      emitGrDevEvent({ type: 'overlay:remove', id: index })

    const events = hook().events
    expect(events).toHaveLength(50)
    expect(events[events.length - 1]).toEqual({ type: 'overlay:remove', id: 199 })
  })

  it('эмит не требует ни window, ни document', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)

    expect(() => emitGrDevEvent({ type: 'overlay:remove', id: 1 })).not.toThrow()

    vi.unstubAllGlobals()
  })
})

/**
 * Виртуализаторы отдаются реестром, а не лентой: окно меняется на каждом кадре
 * прокрутки, и события тут были бы потоком без пользы.
 */
describe('dev-канал: реестр виртуализаторов', () => {
  function virtualList(uid: number) {
    return () => ({
      owner: 'GrDataTable',
      uid,
      total: 1000,
      rendered: 12,
      range: { start: 40, end: 52 },
      estimated: 44,
      measured: 47.5,
    })
  }

  it('зарегистрированный список читается по требованию', () => {
    emitGrDevEvent({ type: 'overlay:sync', layers: [] })
    registerGrVirtualList(virtualList(1))

    expect([...hook().virtualLists!].map(read => read())).toMatchObject([
      { owner: 'GrDataTable', total: 1000, rendered: 12, range: { start: 40, end: 52 } },
    ])
  })

  it('снятие убирает список из реестра: он не должен пережить компонент', () => {
    emitGrDevEvent({ type: 'overlay:sync', layers: [] })
    const unregister = registerGrVirtualList(virtualList(2))
    unregister()

    expect(hook().virtualLists?.size).toBe(0)
  })

  it('несколько списков на странице не смешиваются', () => {
    emitGrDevEvent({ type: 'overlay:sync', layers: [] })
    registerGrVirtualList(virtualList(3))
    registerGrVirtualList(virtualList(4))

    expect([...hook().virtualLists!].map(read => read().uid)).toEqual([3, 4])
  })
})

describe('dev-канал: глубина буфера', () => {
  it('наблюдатель может попросить свою глубину', () => {
    emitGrDevEvent({ type: 'overlay:remove', id: 0 })
    hook().bufferLimit = 3

    for (let index = 1; index <= 10; index += 1)
      emitGrDevEvent({ type: 'overlay:remove', id: index })

    expect(hook().events).toHaveLength(3)
    expect(hook().events.at(-1)).toEqual({ type: 'overlay:remove', id: 10 })
  })
})
