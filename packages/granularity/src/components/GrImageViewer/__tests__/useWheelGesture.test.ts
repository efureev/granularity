import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWheelGesture } from '../composables/useWheelGesture'

function wheelEvent(deltaY: number) {
  const preventDefault = vi.fn()
  return { event: { deltaY, preventDefault } as unknown as WheelEvent, preventDefault }
}

/** Ручной rAF: тест сам решает, когда наступит кадр. */
let frames: FrameRequestCallback[]

beforeEach(() => {
  vi.useFakeTimers()
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames[id - 1] = () => {}
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function runFrame(): void {
  const pending = frames
  frames = []
  pending.forEach(cb => cb(0))
}

function setup(enabled = true) {
  const applyZoomFactor = vi.fn()
  const gesture = useWheelGesture({ enabled: () => enabled, applyZoomFactor })
  return { gesture, applyZoomFactor }
}

describe('useWheelGesture', () => {
  it('копит дельту за кадр и применяет её одним множителем', () => {
    const { gesture, applyZoomFactor } = setup()

    gesture.onWheel(wheelEvent(-50).event)
    gesture.onWheel(wheelEvent(-50).event)
    gesture.onWheel(wheelEvent(-50).event)
    expect(applyZoomFactor).not.toHaveBeenCalled()

    runFrame()

    expect(applyZoomFactor).toHaveBeenCalledTimes(1)
    // Накопленная дельта -150 → множитель exp(150 * 0.0015) > 1, то есть приближение.
    expect(applyZoomFactor.mock.calls[0]?.[0]).toBeCloseTo(Math.exp(150 * 0.0015), 6)
  })

  it('scroll down отдаляет (множитель меньше единицы)', () => {
    const { gesture, applyZoomFactor } = setup()

    gesture.onWheel(wheelEvent(120).event)
    runFrame()

    expect(applyZoomFactor.mock.calls[0]?.[0]).toBeLessThan(1)
  })

  it('при выключенном зуме не трогает ни масштаб, ни скролл страницы', () => {
    const { gesture, applyZoomFactor } = setup(false)
    const { event, preventDefault } = wheelEvent(-100)

    gesture.onWheel(event)
    runFrame()

    expect(applyZoomFactor).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(gesture.isWheelZooming.value).toBe(false)
  })

  it('держит флаг жеста, пока колесо крутится, и снимает его после паузы', () => {
    const { gesture } = setup()

    gesture.onWheel(wheelEvent(-40).event)
    expect(gesture.isWheelZooming.value).toBe(true)

    vi.advanceTimersByTime(100)
    gesture.onWheel(wheelEvent(-40).event)
    vi.advanceTimersByTime(100)
    // Пауза меньше порога простоя — жест продолжается.
    expect(gesture.isWheelZooming.value).toBe(true)

    vi.advanceTimersByTime(200)
    expect(gesture.isWheelZooming.value).toBe(false)
  })

  it('endWheelZoom отменяет накопленное: закрытый просмотрщик не должен доехать зумом', () => {
    const { gesture, applyZoomFactor } = setup()

    gesture.onWheel(wheelEvent(-200).event)
    gesture.endWheelZoom()
    runFrame()
    vi.advanceTimersByTime(500)

    expect(applyZoomFactor).not.toHaveBeenCalled()
    expect(gesture.isWheelZooming.value).toBe(false)
  })
})
