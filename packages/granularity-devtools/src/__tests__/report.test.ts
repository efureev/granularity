import { afterEach, describe, expect, it } from 'vitest'

import type { GrOverlaySnapshot } from '../internal/devChannel'
import { buildReport } from '../resolve/report'
import { createGrIssueLog } from '../resolve/issues'

type Global = typeof globalThis & {
  __GR_DEV_HOOK__?: {
    events: unknown[]
    listeners: Set<unknown>
    readLayers?: () => GrOverlaySnapshot[]
    virtualLists?: Set<() => unknown>
  }
}

afterEach(() => {
  ;(globalThis as Global).__GR_DEV_HOOK__ = undefined
})

describe('отчёт для багрепорта', () => {
  it('собирает состояние в один объект и знает версию', () => {
    const log = createGrIssueLog()
    log.add('warning', ['[GrModal] окно без имени'])

    const report = buildReport(log.list())

    expect(report.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(report.issues[0]).toMatchObject({ component: 'GrModal' })
    expect(() => new Date(report.capturedAt).toISOString()).not.toThrow()
  })

  it('без канала отдаёт пустые списки, а не падает', () => {
    const report = buildReport([])

    expect(report.layers).toEqual([])
    expect(report.virtualLists).toEqual([])
  })

  it('переживает JSON: ни DOM-ссылок, ни функций', () => {
    ;(globalThis as Global).__GR_DEV_HOOK__ = {
      events: [],
      listeners: new Set(),
      readLayers: () => [{ id: 1, owner: 'GrModal', focus: null, modal: true, topmostForEscape: true, inert: false, depth: 0, closesOnEscape: true }],
      virtualLists: new Set([() => ({ owner: 'GrDataTable', uid: 3, total: 10, rendered: 2, range: { start: 0, end: 2 }, estimated: 40, measured: null })]),
    }

    const restored = JSON.parse(JSON.stringify(buildReport([]))) as { layers: unknown[], virtualLists: unknown[] }

    expect(restored.layers[0]).toMatchObject({ owner: 'GrModal' })
    expect(restored.virtualLists[0]).toMatchObject({ owner: 'GrDataTable' })
  })
})
