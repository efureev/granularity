// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import { resetStylesheetIndex } from '../internal/stylesheetIndex'
import { registerComponentTokens } from '../plugin/componentTokens'

interface StateRow {
  type: string
  key: string
  value: string
}

function fakeApi() {
  const handlers: Record<string, (payload: unknown) => void> = {}
  return {
    on: { inspectComponent: (fn: (payload: unknown) => void) => { handlers.inspect = fn } },
    handlers,
  }
}

function inspect(el: HTMLElement, name = 'GrSelect'): StateRow[] {
  const api = fakeApi()
  registerComponentTokens(api as never)

  const state: StateRow[] = []
  api.handlers.inspect?.({
    componentInstance: { type: { __name: name }, vnode: { el } },
    instanceData: { state },
  })

  return state
}

function mount(html: string): HTMLElement {
  document.body.innerHTML = html
  return document.body.firstElementChild as HTMLElement
}

function addStyle(css: string): void {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
}

afterEach(() => {
  document.head.querySelectorAll('style').forEach(style => style.remove())
  document.body.innerHTML = ''
  resetStylesheetIndex()
})

const EMPTY = 'granularity tokens · consumed but empty'

describe('секция «токены, разрешающиеся в пустоту»', () => {
  it('называет токен и класс, чьё правило его читает', () => {
    addStyle('.trigger { border-radius: var(--gr-radius-control) }')
    const state = inspect(mount('<div class="trigger"></div>'))

    const rows = state.filter(row => row.type === EMPTY)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.key).toBe('--gr-radius-control')
    expect(rows[0]!.value).toContain('.trigger')
  })

  it('молчит, когда токен объявлен', () => {
    addStyle(':root { --gr-radius-control: 6px }')
    addStyle('.trigger { border-radius: var(--gr-radius-control) }')

    expect(inspect(mount('<div class="trigger"></div>')).filter(row => row.type === EMPTY)).toEqual([])
  })

  it('чужой компонент не трогает', () => {
    addStyle('.trigger { border-radius: var(--gr-radius-control) }')

    expect(inspect(mount('<div class="trigger"></div>'), 'RouterView')).toEqual([])
  })
})
