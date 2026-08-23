import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { curveCommands } from '../../../chart/chartPath'
import ChartCanvas from '../shared/ChartCanvas.vue'

/**
 * Холст в jsdom нельзя увидеть, но можно спросить, что он рисовал.
 *
 * Двойник контекста записывает вызовы: этого хватает, чтобы проверить главное —
 * масштаб под плотность пикселей, обрезку по области построения и то, что
 * команды доезжают до `ctx` без превращения в строку.
 */
interface Call { op: string, args: unknown[] }

function fakeContext(calls: Call[]): CanvasRenderingContext2D {
  const record = (op: string) => (...args: unknown[]) => {
    calls.push({ op, args })
  }

  return {
    setTransform: record('setTransform'),
    clearRect: record('clearRect'),
    beginPath: record('beginPath'),
    closePath: record('closePath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    bezierCurveTo: record('bezierCurveTo'),
    stroke: record('stroke'),
    fill: record('fill'),
    rect: record('rect'),
    clip: record('clip'),
    save: record('save'),
    restore: record('restore'),
    setLineDash: record('setLineDash'),
  } as unknown as CanvasRenderingContext2D
}

const PLOT = { x: 40, y: 10, width: 600, height: 300 }

let calls: Call[] = []
let restoreContext: (() => void) | null = null
let restoreRatio: (() => void) | null = null

function stubRatio(value: number): () => void {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'devicePixelRatio')
  Object.defineProperty(globalThis, 'devicePixelRatio', { configurable: true, value })

  return () => {
    if (original)
      Object.defineProperty(globalThis, 'devicePixelRatio', original)
  }
}

beforeEach(() => {
  calls = []
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeContext(calls))
  restoreContext = () => spy.mockRestore()
  restoreRatio = stubRatio(2)
})

afterEach(() => {
  restoreContext?.()
  restoreRatio?.()
})

function mountCanvas(props: Record<string, unknown> = {}) {
  return mount(ChartCanvas, {
    props: {
      plot: PLOT,
      width: 680,
      height: 320,
      series: [{
        key: 'a',
        commands: curveCommands([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 20, y: 5 }], 'linear'),
        color: 'rebeccapurple',
        width: 2,
      }],
      ...props,
    },
    global: granularityGlobal(),
    attachTo: document.body,
  })
}

describe('ChartCanvas', () => {
  it('размер холста умножен на плотность пикселей', () => {
    const canvas = mountCanvas().element as HTMLCanvasElement

    expect([canvas.width, canvas.height]).toEqual([1360, 640])
    expect(canvas.style.width).toBe('680px')
  })

  it('на обычном экране умножения нет', () => {
    restoreRatio?.()
    restoreRatio = stubRatio(1)

    const canvas = mountCanvas().element as HTMLCanvasElement

    expect([canvas.width, canvas.height]).toEqual([680, 320])
  })

  it('преобразование задаётся плотностью, а не единицей', () => {
    mountCanvas()

    expect(calls.find(call => call.op === 'setTransform')?.args).toEqual([2, 0, 0, 2, 0, 0])
  })

  it('команды доезжают до контекста, а не превращаются в строку', () => {
    mountCanvas()

    expect(calls.filter(call => call.op === 'moveTo')).toHaveLength(1)
    expect(calls.filter(call => call.op === 'lineTo').length).toBeGreaterThanOrEqual(2)
    expect(calls.some(call => call.op === 'stroke')).toBe(true)
  })

  it('кубика уезжает в `bezierCurveTo`', () => {
    mountCanvas({
      series: [{
        key: 'a',
        commands: curveCommands([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 20, y: 5 }], 'smooth'),
        color: 'rebeccapurple',
        width: 2,
      }],
    })

    expect(calls.some(call => call.op === 'bezierCurveTo')).toBe(true)
  })

  it('ряды обрезаются областью построения', () => {
    mountCanvas()

    expect(calls.find(call => call.op === 'rect')?.args).toEqual([PLOT.x, PLOT.y, PLOT.width, PLOT.height])
    expect(calls.some(call => call.op === 'clip')).toBe(true)
  })

  it('сетка рисуется по делениям и гасится вместе с ними', () => {
    const ticks = [{ value: 0, label: '0', position: 100 }, { value: 1, label: '1', position: 200 }]

    const withGrid = mountCanvas({ yTicks: ticks, showGrid: 'y' })
    const strokes = calls.filter(call => call.op === 'stroke').length
    withGrid.unmount()

    calls = []
    mountCanvas({ yTicks: ticks, showGrid: 'none' })

    expect(calls.filter(call => call.op === 'stroke').length).toBe(strokes - ticks.length)
  })

  it('заливка рисуется до линии', () => {
    mountCanvas({
      series: [{
        key: 'a',
        commands: curveCommands([{ x: 0, y: 0 }, { x: 10, y: 20 }], 'linear'),
        color: 'rebeccapurple',
        width: 2,
        fill: { commands: curveCommands([{ x: 0, y: 0 }, { x: 10, y: 20 }], 'linear'), color: 'rebeccapurple', opacity: 0.2 },
      }],
    })

    const fillAt = calls.findIndex(call => call.op === 'fill')
    const strokeAt = calls.findIndex(call => call.op === 'stroke')

    expect(fillAt).toBeGreaterThanOrEqual(0)
    expect(fillAt).toBeLessThan(strokeAt)
  })

  /** Тот же приём, каким пакет переживает отсутствие `ResizeObserver`. */
  it('без контекста молчит, а не падает', async () => {
    restoreContext?.()
    restoreContext = null
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)

    expect(() => mountCanvas()).not.toThrow()
    await nextTick()

    spy.mockRestore()
  })
})
