import { effectScope } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { UseDragGestureOptions } from '../useDragGesture'
import { useDragGesture } from '../useDragGesture'

/**
 * jsdom не знает `PointerEvent`, а `button` у события только на чтение —
 * поэтому нажатие собирается через `MouseEvent` с нужной кнопкой.
 */
function pointer(type: string, init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent(type, { bubbles: true, ...init })
}

function setup(overrides: Partial<UseDragGestureOptions> = {}) {
  const onStart = vi.fn()
  const onMove = vi.fn()
  const onEnd = vi.fn()
  const onCancel = vi.fn()

  const scope = effectScope()
  const gesture = scope.run(() => useDragGesture({
    onStart,
    onMove,
    onEnd,
    onCancel,
    ...overrides,
  }))!

  return {
    gesture,
    onStart,
    onMove,
    onEnd,
    onCancel,
    down: (button = 0) => gesture.start(pointer('pointerdown', { button }) as PointerEvent),
    move: (clientX = 10) => window.dispatchEvent(pointer('pointermove', { clientX })),
    up: () => window.dispatchEvent(pointer('pointerup')),
    cancel: () => window.dispatchEvent(pointer('pointercancel')),
    dispose: () => scope.stop(),
  }
}

describe('начало жеста', () => {
  it('основная кнопка начинает, правая и средняя — нет', () => {
    const { gesture, down, dispose } = setup()

    down(2)
    expect(gesture.isDragging.value).toBe(false)

    down(1)
    expect(gesture.isDragging.value).toBe(false)

    down(0)
    expect(gesture.isDragging.value).toBe(true)

    dispose()
  })

  it('`disabled` не даёт начать', () => {
    const disabled = vi.fn(() => true)
    const { gesture, onStart, down, move, onMove, dispose } = setup({ disabled })

    down()

    expect(gesture.isDragging.value).toBe(false)
    expect(onStart).not.toHaveBeenCalled()

    // Слушателей нет: движение мимо жеста до обработчика не доходит.
    move()
    expect(onMove).not.toHaveBeenCalled()

    dispose()
  })

  it('`onStart`, вернувший `false`, отменяет жест до его начала', () => {
    const { gesture, onMove, down, move, dispose } = setup({ onStart: () => false })

    down()

    expect(gesture.isDragging.value).toBe(false)

    move()
    expect(onMove).not.toHaveBeenCalled()

    dispose()
  })

  it('повторное нажатие во время жеста не начинает второй', () => {
    const { onStart, down, dispose } = setup()

    down()
    down()

    expect(onStart).toHaveBeenCalledTimes(1)

    dispose()
  })
})

describe('ход жеста', () => {
  it('движение доходит до `onMove` только между началом и завершением', () => {
    const { onMove, down, move, up, dispose } = setup()

    move()
    expect(onMove).not.toHaveBeenCalled()

    down()
    move(42)
    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0][0]).toMatchObject({ clientX: 42 })

    up()
    move()
    expect(onMove).toHaveBeenCalledTimes(1)

    dispose()
  })

  it('второй жест подряд работает', () => {
    const { gesture, onMove, onEnd, down, move, up, dispose } = setup()

    down()
    move()
    up()

    down()
    move()

    expect(gesture.isDragging.value).toBe(true)
    expect(onMove).toHaveBeenCalledTimes(2)
    expect(onEnd).toHaveBeenCalledTimes(1)

    dispose()
  })
})

describe('два исхода жеста', () => {
  it('отпускание завершает и коммитит', () => {
    const { gesture, onEnd, onCancel, down, up, dispose } = setup()

    down()
    up()

    expect(gesture.isDragging.value).toBe(false)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()

    dispose()
  })

  it('обрыв не коммитит, а откатывает', () => {
    const { gesture, onEnd, onCancel, down, cancel, dispose } = setup()

    down()
    cancel()

    expect(gesture.isDragging.value).toBe(false)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onEnd).not.toHaveBeenCalled()

    dispose()
  })

  it('`stop()` завершает принудительно: по умолчанию как обрыв, с `true` — как отпускание', () => {
    const first = setup()
    first.down()
    first.gesture.stop()
    expect(first.onCancel).toHaveBeenCalledTimes(1)
    expect(first.onEnd).not.toHaveBeenCalled()
    first.dispose()

    const second = setup()
    second.down()
    second.gesture.stop(true)
    expect(second.onEnd).toHaveBeenCalledTimes(1)
    expect(second.onCancel).not.toHaveBeenCalled()
    second.dispose()
  })

  it('повторное завершение ничего не делает', () => {
    const { gesture, onEnd, onCancel, down, up, cancel, dispose } = setup()

    down()
    up()
    up()
    cancel()
    gesture.stop()

    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()

    dispose()
  })
})

describe('жизненный цикл', () => {
  it('остановка области снимает слушатели прямо посреди жеста', () => {
    const { gesture, onMove, onEnd, onCancel, down, move, up, dispose } = setup()

    down()
    dispose()

    move()
    up()

    expect(onMove).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
    expect(gesture.isDragging.value).toBe(false)
  })

  it('область без единого жеста останавливается без обращения к `window`', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { dispose } = setup()

    dispose()

    expect(removeSpy).not.toHaveBeenCalled()

    removeSpy.mockRestore()
  })
})
