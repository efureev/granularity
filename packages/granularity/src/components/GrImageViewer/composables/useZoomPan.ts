import { computed, ref, type Ref } from 'vue'

import { useDragGesture } from '../../../composables/useDragGesture'

const TRAILING_ZERO_DECIMAL_RE = /\.0$/

export function formatPercent(value: number): string {
  if (Number.isInteger(value))
    return String(value)
  return value.toFixed(1).replace(TRAILING_ZERO_DECIMAL_RE, '')
}

/** Точка в координатах вьюпорта — курсор или середина между пальцами. */
export interface ZoomAnchor {
  clientX: number
  clientY: number
}

export interface UseZoomPanOptions {
  minScale: () => number
  maxScale: () => number
  zoomRate: () => number
  /** Тянуть можно и на неувеличенном кадре. Увеличенный тянется всегда. */
  draggable: () => boolean
  /** Ссылка на `<img>` — для измерения layout-размера и подписки ResizeObserver. */
  imageEl: Ref<HTMLImageElement | null>
  /** Область кадра: задаёт систему координат для якорного зума и границы пана. */
  viewportEl: Ref<HTMLElement | null>
  /** Колбэк на поворот (эмит `rotate`). */
  onRotate: (deg: number) => void
}

/**
 * useZoomPan — состояние и логика масштаба/поворота/панорамирования картинки,
 * а также метрики (натуральный/вписанный/фактический размер, реальный масштаб).
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

  /** Увеличенный кадр тянется всегда: иначе до его краёв не добраться вовсе. */
  const isPannable = computed(() => options.draggable() || scale.value > 1)

  /**
   * Граница смещения по осям экрана.
   *
   * Тянуть имеет смысл ровно настолько, насколько кадр вылез за область
   * просмотра, — дальше пользователь утаскивает картинку в пустоту и достаёт её
   * только сбросом. Поворот на 90°/270° меняет оси местами, поэтому границы
   * считаются по bounding box повёрнутого footprint'а.
   */
  function panBounds(): { x: number, y: number } {
    const viewport = options.viewportEl.value
    if (!viewport) return { x: 0, y: 0 }

    const quarterTurns = Math.abs(Math.round(rotation.value / 90) % 2)
    const width = quarterTurns === 1 ? renderedHeight.value : renderedWidth.value
    const height = quarterTurns === 1 ? renderedWidth.value : renderedHeight.value

    return {
      x: Math.max(0, (width - viewport.clientWidth) / 2),
      y: Math.max(0, (height - viewport.clientHeight) / 2),
    }
  }

  function clampOffsets(): void {
    const bounds = panBounds()
    offsetX.value = Math.min(bounds.x, Math.max(-bounds.x, offsetX.value))
    offsetY.value = Math.min(bounds.y, Math.max(-bounds.y, offsetY.value))
  }

  function clampScale(value: number): number {
    const clamped = Math.min(options.maxScale(), Math.max(options.minScale(), value))
    return Number(clamped.toFixed(4))
  }

  function setScale(value: number): void {
    scale.value = clampScale(value)
    clampOffsets()
  }

  /**
   * Масштаб с якорем: точка под курсором (или между пальцами) остаётся на
   * месте. Без этого зум всегда идёт от центра, и увеличить нужный угол кадра
   * можно только зумом с последующим таскиванием.
   */
  function setScaleAt(value: number, anchor?: ZoomAnchor): void {
    const viewport = options.viewportEl.value
    const previous = scale.value
    const next = clampScale(value)

    if (next === previous) return

    if (anchor && viewport) {
      const rect = viewport.getBoundingClientRect()
      // Координаты якоря относительно центра области — там же начало отсчёта
      // трансформации картинки.
      const anchorX = anchor.clientX - (rect.left + rect.width / 2)
      const anchorY = anchor.clientY - (rect.top + rect.height / 2)
      const ratio = next / previous

      offsetX.value = anchorX - (anchorX - offsetX.value) * ratio
      offsetY.value = anchorY - (anchorY - offsetY.value) * ratio
    }

    scale.value = next
    clampOffsets()
  }

  function zoomIn(anchor?: ZoomAnchor): void {
    setScaleAt(scale.value * options.zoomRate(), anchor)
  }

  function zoomOut(anchor?: ZoomAnchor): void {
    setScaleAt(scale.value / options.zoomRate(), anchor)
  }

  function rotateLeft(): void {
    rotation.value -= 90
    clampOffsets()
    options.onRotate(rotation.value)
  }

  function rotateRight(): void {
    rotation.value += 90
    clampOffsets()
    options.onRotate(rotation.value)
  }

  /**
   * Масштаб «один к одному»: пиксель картинки на пиксель экрана.
   *
   * Считается от вписанного размера, потому что `scale` номинальный — единица
   * означает «вписано в окно», а не «натуральный размер». У крупного кадра
   * реальные 100% приходятся на номинальные 6–8×, и вручную такую кнопку
   * потребителю пришлось бы собирать из `naturalWidth`/`renderedWidth`.
   *
   * Потолок `maxScale` действует и здесь: он ограничивает зум сознательно, и
   * «один к одному» — не повод его обойти. Если кадру нужно больше, поднимите
   * `maxScale`.
   */
  function zoomToNatural(): void {
    if (!naturalWidth.value || !fittedWidth.value)
      return

    setScale(naturalWidth.value / fittedWidth.value)
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
    clampOffsets()
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

  /** Начало перетаскивания: используется и мышью, и жестами. */
  function startPan(x: number, y: number): void {
    isDragging.value = true
    dragStartX = x
    dragStartY = y
    dragOffsetStartX = offsetX.value
    dragOffsetStartY = offsetY.value
  }

  function movePan(x: number, y: number): void {
    if (!isDragging.value)
      return
    offsetX.value = dragOffsetStartX + (x - dragStartX)
    offsetY.value = dragOffsetStartY + (y - dragStartY)
    clampOffsets()
  }

  function endPan(): void {
    isDragging.value = false
  }

  /**
   * Перетаскивание мышью и пером — на общем примитиве жеста.
   *
   * Слушатели живут на `window`, а не на захвате указателя: захват привязан к
   * `<img>`, и смена кадра посреди жеста подменяла элемент — отпускание не
   * приходило никуда, а `isDragging` оставался поднятым.
   */
  const drag = useDragGesture({
    disabled: () => !isPannable.value,
    onStart: (event) => {
      // Тач ведёт `usePointerGestures`: у него свои pinch и свайп, и второй
      // владелец жеста тянул бы кадр дважды.
      if (event.pointerType === 'touch') return false

      event.preventDefault()
      startPan(event.clientX, event.clientY)
    },
    onMove: event => movePan(event.clientX, event.clientY),
    onEnd: endPan,
    // Обрыв не откатывает панораму: кадр уже сдвинут пользователем, и возврат
    // к исходной точке читался бы как рывок, а не как отмена.
    onCancel: endPan,
  })

  /** Принудительно закончить перетаскивание — закрытие и смена кадра. */
  function cancelPan(): void {
    drag.stop()
    endPan()
  }

  return {
    scale,
    rotation,
    offsetX,
    offsetY,
    isDragging,
    isPannable,
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
    setScaleAt,
    zoomIn,
    zoomOut,
    zoomToNatural,
    rotateLeft,
    rotateRight,
    resetTransform,
    resetImageMetrics,
    measureFitted,
    clampOffsets,
    onImageLoad,
    startObservingImage,
    stopObservingImage,
    startPan,
    movePan,
    endPan,
    cancelPan,
    onPointerDown: drag.start,
  }
}
