import { ref } from 'vue'

// Чувствительность масштабирования колесом/трекпадом: чем больше — тем резче реакция.
const WHEEL_ZOOM_SENSITIVITY = 0.0015
// Сколько ms простоя после последнего wheel-события считаем «зум завершён»
// (после этого возвращаем плавный CSS-переход).
const WHEEL_IDLE_MS = 120

export interface UseWheelGestureOptions {
  /** Разрешён ли зум колесом (проп `wheelZoom` + наличие изображений). */
  enabled: () => boolean
  /** Применить множитель масштаба (накопленный за кадр). */
  applyZoomFactor: (factor: number) => void
}

/**
 * useWheelGesture — масштабирование колесом мыши / жестом трекпада с батчингом
 * по `requestAnimationFrame` (рендер не чаще кадра — без «дёрганья»/наслоения) и
 * временным отключением CSS-перехода на время жеста (`isWheelZooming`).
 */
export function useWheelGesture(options: UseWheelGestureOptions) {
  const isWheelZooming = ref(false)

  let pendingWheelDelta = 0
  let wheelFrameId: number | null = null
  let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null

  function cancelWheelFrame(): void {
    if (wheelFrameId !== null) {
      cancelAnimationFrame(wheelFrameId)
      wheelFrameId = null
    }
  }

  function endWheelZoom(): void {
    if (wheelIdleTimer !== null) {
      clearTimeout(wheelIdleTimer)
      wheelIdleTimer = null
    }

    isWheelZooming.value = false
    pendingWheelDelta = 0
    cancelWheelFrame()
  }

  // Применяем накопленный за кадр deltaY одним обновлением scale.
  function flushWheelZoom(): void {
    wheelFrameId = null

    const delta = pendingWheelDelta
    pendingWheelDelta = 0

    if (!delta)
      return

    // Экспоненциальный шаг — плавно и одинаково для колеса и трекпада.
    // delta < 0 (scroll up) — приближение, delta > 0 — отдаление.
    const factor = Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY)
    options.applyZoomFactor(factor)
  }

  function onWheel(event: WheelEvent): void {
    if (!options.enabled())
      return

    // Не даём странице/оверлею проскроллиться — колесо отдаём под зум.
    event.preventDefault()

    // Во время непрерывного зума отключаем CSS-переход: плавность даёт само
    // покадровое обновление, а transition на микрошагах вызывает лаг/наслоение.
    isWheelZooming.value = true

    pendingWheelDelta += event.deltaY

    if (wheelFrameId === null)
      wheelFrameId = requestAnimationFrame(flushWheelZoom)

    if (wheelIdleTimer !== null)
      clearTimeout(wheelIdleTimer)

    // По завершении жеста возвращаем плавный переход для дискретных зумов.
    wheelIdleTimer = setTimeout(() => {
      wheelIdleTimer = null
      isWheelZooming.value = false
    }, WHEEL_IDLE_MS)
  }

  return { isWheelZooming, onWheel, endWheelZoom }
}
