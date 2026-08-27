import { afterEach, describe, expect, it, vi } from 'vitest'

import { registerIssues } from '../plugin/issues'
import { createGrIssueLog } from '../resolve/issues'

function fakeApi() {
  const handlers: Record<string, (payload: any) => void> = {}

  return {
    addInspector: vi.fn(),
    sendInspectorTree: vi.fn(),
    sendInspectorState: vi.fn(),
    on: {
      getInspectorTree: (fn: (payload: any) => void) => { handlers.tree = fn },
      getInspectorState: (fn: (payload: any) => void) => { handlers.state = fn },
    },
    handlers,
  }
}

const originalWarn = console.warn

afterEach(() => {
  console.warn = originalWarn
})

describe('раздел «Issues»', () => {
  it('перехватывает предупреждения пакета, не глотая их', () => {
    const printed = vi.fn()
    console.warn = printed

    const api = fakeApi()
    registerIssues(api as never, createGrIssueLog())
    console.warn('[GrSlider] обязательный проп')

    const payload = { inspectorId: 'granularity:issues', rootNodes: [] as unknown[] }
    api.handlers.tree?.(payload)

    expect(printed).toHaveBeenCalledWith('[GrSlider] обязательный проп')
    expect(payload.rootNodes).toHaveLength(1)
  })

  it('чужие предупреждения в список не попадают', () => {
    console.warn = vi.fn()

    const api = fakeApi()
    registerIssues(api as never, createGrIssueLog())
    console.warn('[vue] чужое предупреждение')

    const payload = { inspectorId: 'granularity:issues', rootNodes: [] as unknown[] }
    api.handlers.tree?.(payload)

    expect(payload.rootNodes).toHaveLength(0)
    expect(api.sendInspectorTree).not.toHaveBeenCalled()
  })

  it('состояние записи показывает источник и число повторов', () => {
    console.warn = vi.fn()

    const api = fakeApi()
    registerIssues(api as never, createGrIssueLog())
    console.warn('[GrModal] дважды')
    console.warn('[GrModal] дважды')

    const tree = { inspectorId: 'granularity:issues', rootNodes: [] as { id: string }[] }
    api.handlers.tree?.(tree)
    const state = { inspectorId: 'granularity:issues', nodeId: tree.rootNodes[0]!.id, state: {} as Record<string, unknown[]> }
    api.handlers.state?.(state)

    expect(state.state.Issue).toContainEqual({ key: 'source', value: 'GrModal' })
    expect(state.state.Issue).toContainEqual({ key: 'seen', value: 2 })
  })
})
