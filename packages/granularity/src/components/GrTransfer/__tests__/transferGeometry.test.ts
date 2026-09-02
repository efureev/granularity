import { describe, expect, it } from 'vitest'

import type { GrTransferRect } from '../transferGeometry'
import {
  dropBefore,
  GR_TRANSFER_DRAG_THRESHOLD,
  passedThreshold,
  sideAtPoint,
} from '../transferGeometry'

const left: GrTransferRect = { left: 0, right: 100, top: 0, bottom: 200 }
const right: GrTransferRect = { left: 160, right: 260, top: 0, bottom: 200 }

/** Строки по 20px подряд, как их разложил бы `stackRects`. */
const spans = [
  { start: 0, end: 20 },
  { start: 20, end: 40 },
  { start: 40, end: 60 },
]
const keys = ['a', 'b', 'c']

describe('sideAtPoint', () => {
  it('узнаёт панель под указателем', () => {
    expect(sideAtPoint({ source: left, target: right }, { x: 50, y: 100 })).toBe('source')
    expect(sideAtPoint({ source: left, target: right }, { x: 200, y: 100 })).toBe('target')
  })

  it('в зазоре между панелями — ничего', () => {
    expect(sideAtPoint({ source: left, target: right }, { x: 130, y: 100 })).toBeNull()
  })

  it('за пределами обеих — ничего', () => {
    expect(sideAtPoint({ source: left, target: right }, { x: 50, y: 400 })).toBeNull()
  })

  it('неотрисованная панель не ловит указатель', () => {
    expect(sideAtPoint({ source: null, target: right }, { x: 50, y: 100 })).toBeNull()
    expect(sideAtPoint({ source: null, target: right }, { x: 200, y: 100 })).toBe('target')
  })

  it('граница принадлежит панели', () => {
    expect(sideAtPoint({ source: left, target: right }, { x: 100, y: 200 })).toBe('source')
  })
})

describe('dropBefore', () => {
  it('верхняя половина строки — перед ней', () => {
    expect(dropBefore(keys, spans, 25)).toBe('b')
  })

  it('нижняя половина — перед следующей', () => {
    expect(dropBefore(keys, spans, 35)).toBe('c')
  })

  it('нижняя половина последней строки — в конец', () => {
    expect(dropBefore(keys, spans, 55)).toBeNull()
  })

  it('выше первой строки — в начало', () => {
    expect(dropBefore(keys, spans, -50)).toBe('a')
  })

  it('ниже последней — в конец', () => {
    expect(dropBefore(keys, spans, 500)).toBeNull()
  })

  it('пустая панель принимает в конец', () => {
    expect(dropBefore([], [], 10)).toBeNull()
  })

  it('вырожденные отрезки не роняют — в jsdom все прямоугольники нулевые', () => {
    const zero = [{ start: 0, end: 0 }, { start: 0, end: 0 }]
    expect(dropBefore(['a', 'b'], zero, 0)).toBe('a')
  })
})

describe('passedThreshold', () => {
  it('дрожание руки жестом не считается', () => {
    expect(passedThreshold({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe(false)
  })

  it('за порогом — жест', () => {
    expect(passedThreshold({ x: 0, y: 0 }, { x: 0, y: GR_TRANSFER_DRAG_THRESHOLD })).toBe(true)
  })

  it('порог считается по диагонали, а не по одной оси', () => {
    expect(passedThreshold({ x: 0, y: 0 }, { x: 3, y: 3 })).toBe(true)
  })
})
