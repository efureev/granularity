import { afterEach, describe, expect, it, vi } from 'vitest'

import type { GrDevEvent } from '../internal/devChannel'
import { subscribeToGrDevEvents } from '../internal/devChannel'
import { registerOverlays } from '../plugin/overlays'

type Hook = { events: GrDevEvent[], listeners: Set<(event: GrDevEvent) => void> }

function hook(): Hook {
  return (globalThis as typeof globalThis & { __GR_DEV_HOOK__?: Hook }).__GR_DEV_HOOK__!
}

function emit(event: GrDevEvent): void {
  hook().events.push(event)
  for (const listener of hook().listeners)
    listener(event)
}

function fakeApi() {
  const handlers: Record<string, (payload: any) => void> = {}

  return {
    now: () => 0,
    addInspector: vi.fn(),
    addTimelineLayer: vi.fn(),
    addTimelineEvent: vi.fn(),
    sendInspectorTree: vi.fn(),
    sendInspectorState: vi.fn(),
    on: {
      getInspectorTree: (fn: (payload: any) => void) => { handlers.tree = fn },
      getInspectorState: (fn: (payload: any) => void) => { handlers.state = fn },
    },
    handlers,
  }
}

afterEach(() => {
  ;(globalThis as typeof globalThis & { __GR_DEV_HOOK__?: Hook }).__GR_DEV_HOOK__ = undefined
})

describe('раздел «Overlay layers»', () => {
  it('показывает слой, открытый до подключения панели', () => {
    subscribeToGrDevEvents(() => {})
    emit({ type: 'overlay:sync', layers: [{ id: 1, modal: true, topmostForEscape: true, inert: false, depth: 0, closesOnEscape: true }] })

    const api = fakeApi()
    registerOverlays(api as never)

    const payload = { inspectorId: 'granularity:overlays', rootNodes: [] as unknown[] }
    api.handlers.tree?.(payload)

    expect(payload.rootNodes).toHaveLength(1)
  })

  it('обновляет дерево на каждый снимок', () => {
    const api = fakeApi()
    registerOverlays(api as never)

    emit({ type: 'overlay:sync', layers: [] })

    expect(api.sendInspectorTree).toHaveBeenCalledWith('granularity:overlays')
    expect(api.sendInspectorState).toHaveBeenCalledWith('granularity:overlays')
  })

  it('в ленту идут происшествия, а не снимки', () => {
    const api = fakeApi()
    registerOverlays(api as never)

    emit({ type: 'overlay:push', id: 1, modal: true })
    emit({ type: 'overlay:sync', layers: [] })
    emit({ type: 'overlay:escape', id: 1, closed: true })

    expect(api.addTimelineEvent).toHaveBeenCalledTimes(2)
  })

  it('чужой инспектор не перехватывается', () => {
    const api = fakeApi()
    registerOverlays(api as never)

    const payload = { inspectorId: 'pinia', rootNodes: ['нетронуто'] }
    api.handlers.tree?.(payload)

    expect(payload.rootNodes).toEqual(['нетронуто'])
  })
})
