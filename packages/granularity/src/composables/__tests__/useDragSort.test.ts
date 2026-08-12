import { effectScope } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { insertionIndex } from '../internal/dragSortGeometry'
import type { UseDragSortOptions } from '../useDragSort'
import { useDragSort } from '../useDragSort'

/** jsdom не знает `PointerEvent`; координаты и кнопка приходят через `MouseEvent`. */
function pointer(type: string, init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent(type, { bubbles: true, ...init })
}

/**
 * Три строки по 20px подряд. `getBoundingClientRect` в jsdom всегда нулевой,
 * поэтому геометрия задаётся руками — иначе попадание проверять не на чем.
 */
function setup(overrides: Partial<UseDragSortOptions<string, number>> = {}) {
  const keys = ['a', 'b', 'c']
  const nodes = new Map<string, HTMLElement>()

  keys.forEach((key, index) => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({
      top: index * 20,
      bottom: index * 20 + 20,
      left: 0,
      right: 100,
      height: 20,
      width: 100,
      x: 0,
      y: index * 20,
      toJSON: () => ({}),
    })
    nodes.set(key, el)
  })

  const onDrop = vi.fn()
  const onUpdate = vi.fn()

  const scope = effectScope()
  const sort = scope.run(() => useDragSort<string, number>({
    items: () => keys,
    elementFor: key => nodes.get(key) ?? null,
    resolveTarget: (hit, source) => insertionIndex(hit, keys.indexOf(source), keys.length),
    onDrop,
    onUpdate,
    ...overrides,
  }))!

  return {
    sort,
    keys,
    onDrop,
    onUpdate,
    down: (key: string, clientY = 10) => sort.startFrom(key)(pointer('pointerdown', { clientY }) as PointerEvent),
    move: (clientY: number) => window.dispatchEvent(pointer('pointermove', { clientY })),
    up: () => window.dispatchEvent(pointer('pointerup')),
    cancelGesture: () => window.dispatchEvent(pointer('pointercancel')),
    escape: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    dispose: () => scope.stop(),
  }
}

describe('порог начала переноса', () => {
  it('нажатие без движения переносом не становится', () => {
    const { sort, down, up, onDrop, dispose } = setup()

    down('a')
    up()

    expect(sort.isActive.value).toBe(false)
    expect(onDrop).not.toHaveBeenCalled()

    dispose()
  })

  it('дрожание руки в пределах порога — ещё клик', () => {
    const { sort, down, move, dispose } = setup()

    down('a', 10)
    move(12)

    expect(sort.isActive.value).toBe(false)

    dispose()
  })

  it('сдвиг за порог начинает перенос', () => {
    const { sort, down, move, dispose } = setup()

    down('a', 10)
    move(30)

    expect(sort.mode.value).toBe('pointer')
    expect(sort.source.value).toBe('a')

    dispose()
  })

  it('порог настраивается', () => {
    const { sort, down, move, dispose } = setup({ threshold: () => 40 })

    down('a', 10)
    move(30)
    expect(sort.isActive.value).toBe(false)

    move(60)
    expect(sort.isActive.value).toBe(true)

    dispose()
  })
})

describe('цель переноса', () => {
  it('считается по попаданию в строку и её половине', () => {
    const { sort, down, move, dispose } = setup()

    down('a', 10)
    // Нижняя половина второй строки (20..40) — встать после неё.
    move(35)
    expect(sort.target.value).toBe(1)

    // Верхняя половина третьей (40..60) — тоже после второй.
    move(45)
    expect(sort.target.value).toBe(1)

    // Нижняя половина третьей — в конец.
    move(55)
    expect(sort.target.value).toBe(2)

    dispose()
  })

  it('`resolveTarget → null` не даёт положить', () => {
    const { sort, down, move, up, onDrop, dispose } = setup({ resolveTarget: () => null })

    down('a', 10)
    move(55)

    expect(sort.target.value).toBeNull()

    up()
    expect(onDrop).not.toHaveBeenCalled()

    dispose()
  })

  it('отпускание переносит и сбрасывает состояние', () => {
    const { sort, down, move, up, onDrop, dispose } = setup()

    down('a', 10)
    move(55)
    up()

    expect(onDrop).toHaveBeenCalledWith('a', 2)
    expect(sort.isActive.value).toBe(false)
    expect(sort.source.value).toBeNull()

    dispose()
  })
})

describe('отмена', () => {
  it('обрыв жеста не переносит', () => {
    const { sort, down, move, cancelGesture, onDrop, dispose } = setup()

    down('a', 10)
    move(55)
    cancelGesture()

    expect(onDrop).not.toHaveBeenCalled()
    expect(sort.isActive.value).toBe(false)

    dispose()
  })

  it('`Esc` отменяет перенос указателем: `pointercancel` браузер на него не шлёт', () => {
    const { sort, down, move, escape, up, onDrop, dispose } = setup()

    down('a', 10)
    move(55)
    escape()

    expect(sort.isActive.value).toBe(false)

    // Отпускание после отмены уже ничего не переносит.
    up()
    expect(onDrop).not.toHaveBeenCalled()

    dispose()
  })

  it('`cancel()` работает в обоих режимах', () => {
    const first = setup()
    first.down('a', 10)
    first.move(55)
    first.sort.cancel()
    expect(first.sort.isActive.value).toBe(false)
    expect(first.onDrop).not.toHaveBeenCalled()
    first.dispose()

    const second = setup()
    second.sort.grab('a')
    second.sort.setTarget(2)
    second.sort.cancel()
    expect(second.sort.isActive.value).toBe(false)
    expect(second.onDrop).not.toHaveBeenCalled()
    second.dispose()
  })
})

describe('клавиатурный перенос', () => {
  it('взять, назначить цель, положить', () => {
    const { sort, onDrop, dispose } = setup()

    sort.grab('a')
    expect(sort.mode.value).toBe('keyboard')

    sort.setTarget(2)
    sort.drop()

    expect(onDrop).toHaveBeenCalledWith('a', 2)
    expect(sort.isActive.value).toBe(false)

    dispose()
  })

  it('без цели ничего не переносит', () => {
    const { sort, onDrop, dispose } = setup()

    sort.grab('a')
    sort.drop()

    expect(onDrop).not.toHaveBeenCalled()

    dispose()
  })

  it('указатель не перебивает начатый клавиатурный перенос', () => {
    const { sort, down, move, dispose } = setup()

    sort.grab('a')
    down('b', 10)
    move(55)

    expect(sort.mode.value).toBe('keyboard')
    expect(sort.source.value).toBe('a')

    dispose()
  })

  it('`setTarget` вне клавиатурного режима игнорируется', () => {
    const { sort, dispose } = setup()

    sort.setTarget(2)
    expect(sort.target.value).toBeNull()

    dispose()
  })
})

describe('запреты', () => {
  it('`disabled` не даёт начать ни указателем, ни с клавиатуры', () => {
    const { sort, down, move, dispose } = setup({ disabled: () => true })

    down('a', 10)
    move(55)
    expect(sort.isActive.value).toBe(false)

    sort.grab('a')
    expect(sort.isActive.value).toBe(false)

    dispose()
  })

  it('`canDrag` закрывает отдельную строку', () => {
    const { sort, down, move, dispose } = setup({ canDrag: key => key !== 'a' })

    down('a', 10)
    move(55)
    expect(sort.isActive.value).toBe(false)

    down('b', 30)
    move(5)
    expect(sort.source.value).toBe('b')

    dispose()
  })
})

describe('оповещения', () => {
  it('`onUpdate` зовётся на начале, смене цели и завершении', () => {
    const { down, move, up, onUpdate, dispose } = setup()

    down('a', 10)
    move(55)
    up()

    const calls = onUpdate.mock.calls
    expect(calls.length).toBeGreaterThanOrEqual(3)
    expect(calls[0]).toEqual(['a', null, 'pointer'])
    expect(calls.at(-1)).toEqual([null, null, null])

    dispose()
  })

  it('цель не меняется — оповещения нет', () => {
    const { down, move, onUpdate, dispose } = setup()

    down('a', 10)
    move(55)
    const afterFirst = onUpdate.mock.calls.length

    move(56)
    expect(onUpdate.mock.calls.length).toBe(afterFirst)

    dispose()
  })
})
