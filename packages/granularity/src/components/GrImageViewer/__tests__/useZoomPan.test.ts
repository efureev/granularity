import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { formatPercent, useZoomPan } from '../composables/useZoomPan'

/**
 * Область кадра задаётся фиктивным элементом: якорный зум и границы пана
 * считаются от её размеров, а не от вьюпорта — в jsdom раскладки нет.
 */
function stage(width = 400, height = 300) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { value: width })
  Object.defineProperty(el, 'clientHeight', { value: height })
  el.getBoundingClientRect = () => ({
    left: 0, top: 0, width, height, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}),
  })
  return el
}

function setup(overrides: Partial<{
  minScale: number
  maxScale: number
  zoomRate: number
  draggable: boolean
  viewport: HTMLElement | null
}> = {}) {
  const onRotate = vi.fn()
  const imageEl = ref<HTMLImageElement | null>(null)
  const viewportEl = ref<HTMLElement | null>(overrides.viewport === undefined ? stage() : overrides.viewport)

  const zoomPan = useZoomPan({
    minScale: () => overrides.minScale ?? 0.5,
    maxScale: () => overrides.maxScale ?? 5,
    zoomRate: () => overrides.zoomRate ?? 2,
    draggable: () => overrides.draggable ?? true,
    imageEl,
    viewportEl,
    onRotate,
  })

  return { zoomPan, onRotate, imageEl, viewportEl }
}

/** `<img>` без раскладки: композаблу нужны только `offsetWidth`/`offsetHeight`. */
function fittedImage(width: number, height: number): HTMLImageElement {
  const el = document.createElement('img')
  Object.defineProperty(el, 'offsetWidth', { value: width })
  Object.defineProperty(el, 'offsetHeight', { value: height })
  return el
}

/** Указатель без реального DOM: нужны только координаты и capture-методы. */
function pointerEvent(type: string, x: number, y: number, button = 0): PointerEvent {
  const target = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  }
  return {
    type,
    button,
    pointerId: 1,
    clientX: x,
    clientY: y,
    currentTarget: target,
    preventDefault: vi.fn(),
  } as unknown as PointerEvent
}

describe('formatPercent', () => {
  it('целые проценты отдаёт без дробной части, дробные — с одним знаком', () => {
    expect(formatPercent(100)).toBe('100')
    expect(formatPercent(66.666)).toBe('66.7')
    // `.0` в хвосте — визуальный шум: 120.0 % и 120 % это одно и то же.
    expect(formatPercent(119.98)).toBe('120')
  })
})

describe('useZoomPan: масштаб', () => {
  it('зажимает масштаб границами minScale/maxScale', () => {
    const { zoomPan } = setup({ minScale: 0.5, maxScale: 4, zoomRate: 2 })

    zoomPan.zoomIn()
    zoomPan.zoomIn()
    zoomPan.zoomIn()
    expect(zoomPan.scale.value).toBe(4)

    zoomPan.setScale(0.01)
    expect(zoomPan.scale.value).toBe(0.5)
  })

  it('setScale округляет до 4 знаков — иначе накопленная погрешность течёт в transform', () => {
    const { zoomPan } = setup()

    zoomPan.setScale(4 / 3)
    expect(zoomPan.scale.value).toBe(1.3333)
  })

  it('zoomOut делит на zoomRate', () => {
    const { zoomPan } = setup({ zoomRate: 2 })

    zoomPan.zoomOut()
    expect(zoomPan.scale.value).toBe(0.5)
  })

  it('zoomValueText показывает проценты текущего масштаба', () => {
    const { zoomPan } = setup({ zoomRate: 1.2 })

    zoomPan.zoomIn()
    expect(zoomPan.zoomValueText.value).toBe('120')
  })
})

describe('useZoomPan: поворот', () => {
  it('накапливает угол в обе стороны и сообщает его наружу', () => {
    const { zoomPan, onRotate } = setup()

    zoomPan.rotateRight()
    zoomPan.rotateRight()
    expect(zoomPan.rotation.value).toBe(180)

    zoomPan.rotateLeft()
    expect(zoomPan.rotation.value).toBe(90)

    expect(onRotate).toHaveBeenNthCalledWith(1, 90)
    expect(onRotate).toHaveBeenNthCalledWith(3, 90)
  })

  it('resetTransform возвращает масштаб, поворот и смещение к исходным', () => {
    const { zoomPan } = setup()

    zoomPan.zoomIn()
    zoomPan.rotateLeft()
    zoomPan.onPointerDown(pointerEvent('pointerdown', 0, 0))
    zoomPan.onPointerMove(pointerEvent('pointermove', 40, 25))

    zoomPan.resetTransform()

    expect(zoomPan.scale.value).toBe(1)
    expect(zoomPan.rotation.value).toBe(0)
    expect(zoomPan.offsetX.value).toBe(0)
    expect(zoomPan.offsetY.value).toBe(0)
    expect(zoomPan.isDragging.value).toBe(false)
  })
})

describe('useZoomPan: панорамирование', () => {
  it('тянет картинку за указателем в пределах её переполнения', () => {
    const { zoomPan, imageEl } = setup({ draggable: true })

    // Кадр 400×300 в области 400×300: при масштабе 2 он вылезает на 200×150 в
    // каждую сторону — внутри этого и можно тянуть.
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()
    zoomPan.setScale(2)

    zoomPan.onPointerDown(pointerEvent('pointerdown', 100, 100))
    expect(zoomPan.isDragging.value).toBe(true)

    zoomPan.onPointerMove(pointerEvent('pointermove', 130, 80))
    expect(zoomPan.offsetX.value).toBe(30)
    expect(zoomPan.offsetY.value).toBe(-20)

    zoomPan.onPointerUp(pointerEvent('pointerup', 130, 80))
    expect(zoomPan.isDragging.value).toBe(false)

    // После отпускания движение указателя картинку больше не двигает.
    zoomPan.onPointerMove(pointerEvent('pointermove', 200, 200))
    expect(zoomPan.offsetX.value).toBe(30)
  })

  it('не тянет при draggable=false и не тянет неосновной кнопкой', () => {
    const off = setup({ draggable: false })
    off.zoomPan.onPointerDown(pointerEvent('pointerdown', 0, 0))
    expect(off.zoomPan.isDragging.value).toBe(false)

    const on = setup({ draggable: true })
    on.zoomPan.onPointerDown(pointerEvent('pointerdown', 0, 0, 2))
    expect(on.zoomPan.isDragging.value).toBe(false)
  })
})

describe('useZoomPan: метрики', () => {
  it('реальный масштаб считается от натурального размера, а не от scale', () => {
    const { zoomPan, imageEl } = setup()

    imageEl.value = { offsetWidth: 400, offsetHeight: 300 } as HTMLImageElement
    zoomPan.onImageLoad({ target: { naturalWidth: 800, naturalHeight: 600 } } as unknown as Event)

    // Картинка вписана вдвое меньше натурального размера.
    expect(zoomPan.realScale.value).toBe(0.5)
    expect(zoomPan.realScalePercent.value).toBe('50')
    expect(zoomPan.renderedWidth.value).toBe(400)

    zoomPan.setScale(2)
    expect(zoomPan.realScale.value).toBe(1)
    expect(zoomPan.renderedHeight.value).toBe(600)
  })

  it('zoomToNatural доводит реальный масштаб ровно до 100%', () => {
    const { zoomPan, imageEl } = setup({ maxScale: 10 })

    imageEl.value = { offsetWidth: 400, offsetHeight: 300 } as HTMLImageElement
    zoomPan.onImageLoad({ target: { naturalWidth: 2848, naturalHeight: 2136 } } as unknown as Event)

    // Номинальная единица — это «вписано в окно», то есть 14% натурального размера.
    expect(zoomPan.realScalePercent.value).toBe('14')

    zoomPan.zoomToNatural()

    expect(zoomPan.realScale.value).toBe(1)
    expect(zoomPan.renderedWidth.value).toBe(2848)
    // Номинальный масштаб при этом семикратный — вручную такую кнопку потребитель
    // собирал бы из `naturalWidth`/`renderedWidth`.
    expect(zoomPan.scale.value).toBeCloseTo(7.12, 2)
  })

  it('zoomToNatural уважает maxScale и молчит без загруженной картинки', () => {
    const capped = setup({ maxScale: 3 })
    capped.imageEl.value = { offsetWidth: 400, offsetHeight: 300 } as HTMLImageElement
    capped.zoomPan.onImageLoad({ target: { naturalWidth: 2848, naturalHeight: 2136 } } as unknown as Event)

    capped.zoomPan.zoomToNatural()

    // Потолок ограничивает зум сознательно: «один к одному» — не повод его обойти.
    expect(capped.zoomPan.scale.value).toBe(3)
    expect(Number.parseFloat(capped.zoomPan.realScalePercent.value)).toBeLessThan(100)

    const empty = setup()
    empty.zoomPan.zoomToNatural()
    expect(empty.zoomPan.scale.value).toBe(1)
  })

  it('без загруженной картинки реальный масштаб равен нулю, а не NaN', () => {
    const { zoomPan } = setup()

    expect(zoomPan.realScale.value).toBe(0)
    expect(zoomPan.realScalePercent.value).toBe('0')
  })

  it('resetImageMetrics обнуляет размеры — иначе новый кадр покажет чужие', () => {
    const { zoomPan, imageEl } = setup()

    imageEl.value = { offsetWidth: 400, offsetHeight: 300 } as HTMLImageElement
    zoomPan.onImageLoad({ target: { naturalWidth: 800, naturalHeight: 600 } } as unknown as Event)
    zoomPan.resetImageMetrics()

    expect(zoomPan.naturalWidth.value).toBe(0)
    expect(zoomPan.fittedHeight.value).toBe(0)
  })
})

describe('useZoomPan: якорь зума и границы пана', () => {
  it('зум с якорем оставляет точку под курсором на месте', () => {
    const { zoomPan, imageEl } = setup({ zoomRate: 2 })
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()

    // Область 400×300, курсор в её правом краю: центр области — (200, 150),
    // то есть якорь смещён на +200 по X.
    zoomPan.setScaleAt(2, { clientX: 400, clientY: 150 })

    expect(zoomPan.scale.value).toBe(2)
    // Точка остаётся на месте: смещение компенсирует удвоение вокруг центра.
    expect(zoomPan.offsetX.value).toBe(-200)
    expect(zoomPan.offsetY.value).toBe(0)
  })

  it('без якоря зум идёт от центра', () => {
    const { zoomPan, imageEl } = setup({ zoomRate: 2 })
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()

    zoomPan.zoomIn()

    expect(zoomPan.offsetX.value).toBe(0)
    expect(zoomPan.offsetY.value).toBe(0)
  })

  it('смещение не выпускает кадр за пределы его переполнения', () => {
    const { zoomPan, imageEl } = setup()
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()
    zoomPan.setScale(2)

    zoomPan.startPan(0, 0)
    zoomPan.movePan(10_000, 10_000)

    // Кадр 800×600 в области 400×300 — запас ровно 200 и 150.
    expect(zoomPan.offsetX.value).toBe(200)
    expect(zoomPan.offsetY.value).toBe(150)
  })

  it('на вписанном кадре тянуть некуда', () => {
    const { zoomPan, imageEl } = setup({ draggable: true })
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()

    zoomPan.startPan(0, 0)
    zoomPan.movePan(120, 90)

    expect(zoomPan.offsetX.value).toBe(0)
    expect(zoomPan.offsetY.value).toBe(0)
  })

  it('поворот на 90° меняет оси местами и пересчитывает границы', () => {
    const { zoomPan, imageEl } = setup()
    // Широкий кадр: по горизонтали запаса нет, по вертикали тем более.
    imageEl.value = fittedImage(400, 200)
    zoomPan.measureFitted()
    zoomPan.setScale(1)

    zoomPan.rotateRight()
    zoomPan.startPan(0, 0)
    zoomPan.movePan(0, 10_000)

    // После поворота footprint стал 200×400 — по вертикали появился запас 50.
    expect(zoomPan.offsetY.value).toBe(50)
  })

  it('уменьшение масштаба возвращает кадр в границы', () => {
    const { zoomPan, imageEl } = setup({ zoomRate: 2 })
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()
    zoomPan.setScale(2)

    zoomPan.startPan(0, 0)
    zoomPan.movePan(200, 150)
    expect(zoomPan.offsetX.value).toBe(200)

    zoomPan.setScale(1)

    expect(zoomPan.offsetX.value).toBe(0)
    expect(zoomPan.offsetY.value).toBe(0)
  })

  it('увеличенный кадр тянется и без пропа `draggable`', () => {
    const { zoomPan, imageEl } = setup({ draggable: false })
    imageEl.value = fittedImage(400, 300)
    zoomPan.measureFitted()

    expect(zoomPan.isPannable.value).toBe(false)

    zoomPan.setScale(2)

    expect(zoomPan.isPannable.value).toBe(true)
  })
})
