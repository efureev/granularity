import { describe, expect, it, vi } from 'vitest'

import { registerComponentConfig } from '../plugin/componentConfig'
import { createGrIssueLog } from '../resolve/issues'

function fakeApi() {
  const handlers: Record<string, (payload: any) => void> = {}

  return {
    on: {
      visitComponentTree: (fn: (payload: any) => void) => { handlers.visit = fn },
      inspectComponent: (fn: (payload: any) => void) => { handlers.inspect = fn },
    },
    handlers,
  }
}

function instance(name: string, props: Record<string, unknown>, passed: Record<string, unknown> | null = null) {
  return { type: { __name: name }, props, vnode: { props: passed } }
}

describe('секция конфига на компоненте', () => {
  it('помечает компоненты дизайн-системы в дереве', () => {
    const api = fakeApi()
    registerComponentConfig(api as never, createGrIssueLog())

    const gr = { componentInstance: instance('GrButton', {}), treeNode: { tags: [] as unknown[] } }
    const foreign = { componentInstance: instance('AppHeader', {}), treeNode: { tags: [] as unknown[] } }
    api.handlers.visit?.(gr)
    api.handlers.visit?.(foreign)

    expect(gr.treeNode.tags).toHaveLength(1)
    expect(foreign.treeNode.tags).toHaveLength(0)
  })

  it('чужой компонент не получает секции', () => {
    const api = fakeApi()
    registerComponentConfig(api as never, createGrIssueLog())

    const payload = { componentInstance: instance('AppHeader', { size: 'md' }), instanceData: { state: [] as unknown[] } }
    api.handlers.inspect?.(payload)

    expect(payload.instanceData.state).toHaveLength(0)
  })

  it('без провайдера в дереве всё числится дефолтами компонента', () => {
    const api = fakeApi()
    registerComponentConfig(api as never, createGrIssueLog())

    const payload = {
      componentInstance: instance('GrButton', { size: 'md', variant: 'primary' }, { variant: 'primary' }),
      instanceData: { state: [] as unknown[] },
    }
    api.handlers.inspect?.(payload)

    expect(payload.instanceData.state).toEqual([
      { type: 'component default', key: 'size', value: 'md', editable: false },
      { type: 'prop', key: 'variant', value: 'primary', editable: false },
    ])
  })

  it('безымянный компонент не роняет хук', () => {
    const api = fakeApi()
    registerComponentConfig(api as never, createGrIssueLog())

    const payload = { componentInstance: { type: {}, props: {} }, instanceData: { state: [] as unknown[] } }

    expect(() => api.handlers.inspect?.(payload)).not.toThrow()
  })

  it('компонент без пропов даёт пустую секцию, а не исключение', () => {
    const api = fakeApi()
    registerComponentConfig(api as never, createGrIssueLog())

    const payload = { componentInstance: { type: { __name: 'GrDivider' } }, instanceData: { state: [] as unknown[] } }
    const spy = vi.fn(() => api.handlers.inspect?.(payload))

    expect(spy).not.toThrow()
    expect(payload.instanceData.state).toEqual([])
  })
})

describe('обязательные пропы', () => {
  it('недостающий проп помечает узел и попадает в журнал', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerComponentConfig(api as never, log)

    const payload = { componentInstance: instance('GrBreadcrumbs', {}), treeNode: { tags: [] as unknown[] } }
    api.handlers.visit?.(payload)

    expect(payload.treeNode.tags).toHaveLength(2)
    expect(log.list()[0]).toMatchObject({ component: 'GrBreadcrumbs', kind: 'error' })
    expect(log.list()[0]?.message).toContain('items')
  })

  it('переданный обязательный проп жалобы не вызывает', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerComponentConfig(api as never, log)

    api.handlers.visit?.({ componentInstance: instance('GrBreadcrumbs', { items: [] }), treeNode: { tags: [] as unknown[] } })

    expect(log.list()).toEqual([])
  })

  it('компонент без обязательных пропов проверку проходит молча', () => {
    const api = fakeApi()
    const log = createGrIssueLog()
    registerComponentConfig(api as never, log)

    const payload = { componentInstance: instance('GrButton', {}), treeNode: { tags: [] as unknown[] } }
    api.handlers.visit?.(payload)

    expect(payload.treeNode.tags).toHaveLength(1)
    expect(log.list()).toEqual([])
  })
})
