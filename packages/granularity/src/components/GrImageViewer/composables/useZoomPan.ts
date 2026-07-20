import { computed, ref, type Ref } from 'vue'

const TRAILING_ZERO_DECIMAL_RE = /\.0$/

export function formatPercent(value: number): string {
  if (Number.isInteger(value))
    return String(value)
  return value.toFixed(1).replace(TRAILING_ZERO_DECIMAL_RE, '')
}

export interface UseZoomPanOptions {
  minScale: () => number
  maxScale: () => number
  zoomRate: () => number
  draggable: () => boolean
  /** Ссылка на `<img>` — для измерения layout-размера и подписки ResizeObserver. */
  imageEl: Ref<HTMLImageElement | null>
  /** Колбэк на поворот (эмит `rotate`). */
  onRotate: (deg: number) => void
}

/**
 * useZoomPan — состояние и логика масштаба/поворота/панорамирования картинки,
 * а также метрики (натуральный/вписанный/фактический размер, реальный масштаб).
 * Вынесено из монолитного `GrImageViewer.vue`.
 */
export function useZoomPan(options: UseZoomPanOptions) {
  const scale = ref(1)
  const rotation = ref(0)
  const offsetX = ref(0)
  const offsetY = ref(0)

  const isDragging = ref(false)
  let dragStartX = 0
  let dragStartY = 0
  let dragOffsetStartX = 0
  let dragOffsetStartY = 0

  // Натуральный размер (из `<img>`) и layout-размер вписанного (`object-contain`) изображения.
  const naturalWidth = ref(0)
  const naturalHeight = ref(0)
  const fittedWidth = ref(0)
  const fittedHeight = ref(0)

  let resizeObserver: ResizeObserver | null = null

  const imageStyle = computed(() => ({
    transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value}) rotate(${rotation.value}deg)`,
  }))

  const zoomValueText = computed(() => formatPercent(scale.value * 100))

  // Фактический размер изображения на экране вдоль его осей (footprint), c учётом scale.
  const renderedWidth = computed(() => Math.round(fittedWidth.value * scale.value))
  const renderedHeight = computed(() => Math.round(fittedHeight.value * scale.value))

  // Реальный масштаб относительно натурального размера (доля). Не зависит от rotation.
  const realScale = computed(() => {
    if (!naturalWidth.value)
      return 0
    return (fittedWidth.value * scale.value) / naturalWidth.value
  })
  const realScalePercent = computed(() => formatPercent(realScale.value * 100))

  function setScale(value: number): void {
    const clamped = Math.min(options.maxScale(), Math.max(options.minScale(), value))
    scale.value = Number(clamped.toFixed(4))
  }

  function zoomIn(): void {
    setScale(scale.value * options.zoomRate())
  }

  function zoomOut(): void {
    setScale(scale.value / options.zoomRate())
  }

  function rotateLeft(): void {
    rotation.value -= 90
    options.onRotate(rotation.value)
  }

  function rotateRight(): void {
    rotation.value += 90
    options.onRotate(rotation.value)
  }

  function resetTransform(): void {
    scale.value = 1
    rotation.value = 0
    offsetX.value = 0
    offsetY.value = 0
    isDragging.value = false
  }

  function resetImageMetrics(): void {
    naturalWidth.value = 0
    naturalHeight.value = 0
    fittedWidth.value = 0
    fittedHeight.value = 0
  }

  function measureFitted(): void {
    const el = options.imageEl.value
    if (!el)
      return
    // offsetWidth/Height — layout-размер вписанного изображения, без CSS transform.
    fittedWidth.value = el.offsetWidth
    fittedHeight.value = el.offsetHeight
  }

  function onImageLoad(event: Event): void {
    const el = event.target as HTMLImageElement
    naturalWidth.value = el.naturalWidth
    naturalHeight.value = el.naturalHeight
    measureFitted()
  }

  function startObservingImage(): void {
    const el = options.imageEl.value
    if (!el || typeof ResizeObserver === 'undefined')
      return

    if (!resizeObserver)
      resizeObserver = new ResizeObserver(() => measureFitted())

    resizeObserver.observe(el)

    // Если картинка уже в кэше и `load` не сработал — считаем метрики сразу.
    if (el.complete && el.naturalWidth) {
      naturalWidth.value = el.naturalWidth
      naturalHeight.value = el.naturalHeight
    }

    measureFitted()
  }

  function stopObservingImage(): void {
    resizeObserver?.disconnect()
  }

  function onPointerDown(event: PointerEvent): void {
    // Тянем только основной кнопкой и только если drag включён.
    if (!options.draggable() || event.button !== 0)
      return

    event.preventDefault()
    isDragging.value = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    dragOffsetStartX = offsetX.value
    dragOffsetStartY = offsetY.value

    // Захватываем указатель, чтобы движение/отпускание ловились за пределами картинки.
    ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent): void {
    if (!isDragging.value)
      return
    offsetX.value = dragOffsetStartX + (event.clientX - dragStartX)
    offsetY.value = dragOffsetStartY + (event.clientY - dragStartY)
  }

  function onPointerUp(event: PointerEvent): void {
    if (!isDragging.value)
      return
    isDragging.value = false
    ;(event.currentTarget as Element).releasePointerCapture?.(event.pointerId)
  }

  return {
    scale,
    rotation,
    offsetX,
    offsetY,
    isDragging,
    naturalWidth,
    naturalHeight,
    fittedWidth,
    fittedHeight,
    imageStyle,
    zoomValueText,
    renderedWidth,
    renderedHeight,
    realScale,
    realScalePercent,
    setScale,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    resetTransform,
    resetImageMetrics,
    measureFitted,
    onImageLoad,
    startObservingImage,
    stopObservingImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
