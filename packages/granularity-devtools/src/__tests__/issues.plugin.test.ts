import { describe, expect, it, vi } from 'vitest'

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

describe('раздел «Issues»', () => {
  it('показывает то, что собрал журнал', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerIssues(api as never, log)

    log.add('warning', ['[GrSlider] обязательный проп'])

    const payload = { inspectorId: 'granularity:issues', rootNodes: [] as unknown[] }
    api.handlers.tree?.(payload)

    expect(payload.rootNodes).toHaveLength(1)
  })

  it('обновляет дерево, когда журнал пополнился без участия панели', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerIssues(api as never, log)

    log.record('error', 'GrBreadcrumbs', 'missing required prop: `items`')

    expect(api.sendInspectorTree).toHaveBeenCalledWith('granularity:issues')
  })

  it('чужой инспектор не перехватывается', () => {
    const api = fakeApi()
    registerIssues(api as never, createGrIssueLog())

    const payload = { inspectorId: 'pinia', rootNodes: ['нетронуто'] }
    api.handlers.tree?.(payload)

    expect(payload.rootNodes).toEqual(['нетронуто'])
  })

  it('состояние записи показывает источник и число повторов', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerIssues(api as never, log)

    log.add('warning', ['[GrModal] дважды'])
    log.add('warning', ['[GrModal] дважды'])

    const tree = { inspectorId: 'granularity:issues', rootNodes: [] as { id: string }[] }
    api.handlers.tree?.(tree)
    const state = { inspectorId: 'granularity:issues', nodeId: tree.rootNodes[0]!.id, state: {} as Record<string, unknown[]> }
    api.handlers.state?.(state)

    expect(state.state.Issue).toContainEqual({ key: 'source', value: 'GrModal' })
    expect(state.state.Issue).toContainEqual({ key: 'seen', value: 2 })
  })
})
