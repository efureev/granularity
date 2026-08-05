import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { formatPercent, useZoomPan } from '../composables/useZoomPan'

function setup(overrides: Partial<{ minScale: number, maxScale: number, zoomRate: number, draggable: boolean }> = {}) {
  const onRotate = vi.fn()
  const imageEl = ref<HTMLImageElement | null>(null)

  const zoomPan = useZoomPan({
    minScale: () => overrides.minScale ?? 0.5,
    maxScale: () => overrides.maxScale ?? 5,
    zoomRate: () => overrides.zoomRate ?? 2,
    draggable: () => overrides.draggable ?? true,
    imageEl,
    onRotate,
  })

  return { zoomPan, onRotate, imageEl }
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
  it('тянет картинку за указателем', () => {
    const { zoomPan } = setup({ draggable: true })

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
