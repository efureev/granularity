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

describe('секции потребляемых токенов', () => {
  it('раскладывает по владельцу: своё, чужое компонентное, базовое', () => {
    addStyle('.alert { background: var(--gr-alert-bg); border-radius: var(--gr-radius-control) }')
    addStyle('.alert { gap: var(--gr-button-radius) }')

    const state = inspect(mount('<div class="alert"></div>'), 'GrAlert')
    const of = (type: string) => state.filter(row => row.type === type).map(row => row.key)

    expect(of('granularity tokens · used · own')).toEqual(['--gr-alert-bg'])
    expect(of('granularity tokens · used · foundation')).toEqual(['--gr-radius-control'])
    expect(of('granularity tokens · used · from other components')).toEqual(['--gr-button-radius'])
  })

  it('в строке чужого токена виден владелец', () => {
    addStyle('.alert { gap: var(--gr-button-radius) }')

    const state = inspect(mount('<div class="alert"></div>'), 'GrAlert')
    const row = state.find(item => item.key === '--gr-button-radius')

    expect(row?.value).toContain('GrButton')
  })

  it('чтение с запасом помечено — пустым оно не ломается', () => {
    addStyle('.alert { color: var(--gr-fg, #111) }')

    const state = inspect(mount('<div class="alert"></div>'), 'GrAlert')

    expect(state.find(row => row.key === '--gr-fg')?.value).toContain('has fallback')
  })
})
