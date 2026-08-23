import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { usePointerGestures } from '../composables/usePointerGestures'

function setup(overrides: { scale?: number, canSwipe?: boolean } = {}) {
  const scale = ref(overrides.scale ?? 1)
  const setScaleAt = vi.fn((value: number) => {
    scale.value = value
  })
  const pan = { start: vi.fn(), move: vi.fn(), end: vi.fn() }
  const onSwipeLeft = vi.fn()
  const onSwipeRight = vi.fn()

  const gestures = usePointerGestures({
    enabled: () => true,
    scale: () => scale.value,
    canSwipe: () => overrides.canSwipe ?? true,
    setScaleAt,
    pan,
    onSwipeLeft,
    onSwipeRight,
  })

  return { gestures, scale, setScaleAt, pan, onSwipeLeft, onSwipeRight }
}

function touch(id: number, x: number, y: number, type = 'touch'): PointerEvent {
  return { pointerId: id, pointerType: type, clientX: x, clientY: y } as PointerEvent
}

describe('usePointerGestures: обрыв жеста', () => {
  it('не листает кадр: система забрала указатель, а не пользователь смахнул', () => {
    const { gestures, onSwipeLeft, onSwipeRight, pan } = setup()

    gestures.onPointerDown(touch(1, 300, 200))
    gestures.onPointerMove(touch(1, 180, 205))
    gestures.onPointerCancel(touch(1, 180, 205))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(pan.end).toHaveBeenCalled()
  })

  it('гасит pinch и не оставляет указатель в наборе', () => {
    const { gestures } = setup({ scale: 2 })

    gestures.onPointerDown(touch(1, 100, 100))
    gestures.onPointerDown(touch(2, 200, 100))
    expect(gestures.isPinching.value).toBe(true)

    gestures.onPointerCancel(touch(1, 100, 100))
    expect(gestures.isPinching.value).toBe(false)

    // Указателя в наборе нет: повторный обрыв уже ничего не делает.
    gestures.onPointerCancel(touch(1, 100, 100))
    expect(gestures.isPinching.value).toBe(false)
  })
})

describe('usePointerGestures: свайп', () => {
  it('горизонтальный свайп влево листает вперёд, вправо — назад', () => {
    const { gestures, onSwipeLeft, onSwipeRight } = setup()

    gestures.onPointerDown(touch(1, 300, 200))
    gestures.onPointerMove(touch(1, 180, 205))
    gestures.onPointerUp(touch(1, 180, 205))
    expect(onSwipeLeft).toHaveBeenCalledOnce()

    gestures.onPointerDown(touch(1, 180, 200))
    gestures.onPointerMove(touch(1, 320, 210))
    gestures.onPointerUp(touch(1, 320, 210))
    expect(onSwipeRight).toHaveBeenCalledOnce()
  })

  it('короткое движение свайпом не считается', () => {
    const { gestures, onSwipeLeft } = setup()

    gestures.onPointerDown(touch(1, 300, 200))
    gestures.onPointerUp(touch(1, 270, 200))

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('вертикальное движение не листает: пользователь целился не туда', () => {
    const { gestures, onSwipeLeft, onSwipeRight } = setup()

    gestures.onPointerDown(touch(1, 300, 100))
    gestures.onPointerUp(touch(1, 240, 400))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('на увеличенном кадре одиночный жест тянет, а не листает', () => {
    const { gestures, pan, onSwipeLeft } = setup({ scale: 2 })

    gestures.onPointerDown(touch(1, 300, 200))
    gestures.onPointerMove(touch(1, 180, 200))
    gestures.onPointerUp(touch(1, 180, 200))

    expect(pan.start).toHaveBeenCalledWith(300, 200)
    expect(pan.move).toHaveBeenCalledWith(180, 200)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('мышь идёт мимо жестов — у неё своя ветка перетаскивания', () => {
    const { gestures, pan, onSwipeLeft } = setup()

    gestures.onPointerDown(touch(1, 300, 200, 'mouse'))
    gestures.onPointerMove(touch(1, 180, 200, 'mouse'))
    gestures.onPointerUp(touch(1, 180, 200, 'mouse'))

    expect(pan.start).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('листать некуда — свайп молчит', () => {
    const { gestures, onSwipeLeft } = setup({ canSwipe: false })

    gestures.onPointerDown(touch(1, 300, 200))
    gestures.onPointerUp(touch(1, 100, 200))

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })
})

describe('usePointerGestures: pinch', () => {
  it('масштабирует по отношению расстояний между пальцами', () => {
    const { gestures, setScaleAt } = setup()

    gestures.onPointerDown(touch(1, 100, 200))
    gestures.onPointerDown(touch(2, 200, 200))
    expect(gestures.isPinching.value).toBe(true)

    // Развели пальцы вдвое — масштаб вдвое, якорь между ними.
    gestures.onPointerMove(touch(2, 300, 200))

    expect(setScaleAt).toHaveBeenCalledWith(2, { clientX: 200, clientY: 200 })
  })

  it('второй палец отменяет начатое перетаскивание', () => {
    const { gestures, pan } = setup({ scale: 2 })

    gestures.onPointerDown(touch(1, 100, 200))
    expect(pan.start).toHaveBeenCalledOnce()

    gestures.onPointerDown(touch(2, 200, 200))
    expect(pan.end).toHaveBeenCalledOnce()
  })

  it('после снятия одного пальца оставшийся продолжает тянуть увеличенный кадр', () => {
    const { gestures, pan } = setup({ scale: 2 })

    gestures.onPointerDown(touch(1, 100, 200))
    gestures.onPointerDown(touch(2, 200, 200))
    pan.start.mockClear()

    gestures.onPointerUp(touch(2, 200, 200))

    expect(gestures.isPinching.value).toBe(false)
    expect(pan.start).toHaveBeenCalledWith(100, 200)
  })

  it('reset снимает все активные указатели', () => {
    const { gestures } = setup()

    gestures.onPointerDown(touch(1, 100, 200))
    gestures.onPointerDown(touch(2, 200, 200))
    gestures.reset()

    expect(gestures.isPinching.value).toBe(false)

    // Пальцев больше нет — движение ничего не масштабирует.
    gestures.onPointerMove(touch(2, 400, 200))
    expect(gestures.isPinching.value).toBe(false)
  })
})
