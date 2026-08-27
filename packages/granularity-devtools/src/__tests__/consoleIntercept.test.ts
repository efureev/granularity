import { afterEach, describe, expect, it, vi } from 'vitest'

import { interceptConsole } from '../internal/consoleIntercept'
import { createGrIssueLog } from '../resolve/issues'

const original = { warn: console.warn, error: console.error }

afterEach(() => {
  console.warn = original.warn
  console.error = original.error
})

describe('перехват консоли', () => {
  it('собирает предупреждения пакета, не глотая их', () => {
    const printed = vi.fn()
    console.warn = printed
    const log = createGrIssueLog()

    interceptConsole(log)
    console.warn('[GrSlider] обязательный проп')

    expect(printed).toHaveBeenCalledWith('[GrSlider] обязательный проп')
    expect(log.list()).toHaveLength(1)
  })

  it('чужие сообщения проходят мимо журнала', () => {
    console.warn = vi.fn()
    const log = createGrIssueLog()

    interceptConsole(log)
    console.warn('[vite] connected')

    expect(log.list()).toEqual([])
  })

  it('ошибки различаются от предупреждений', () => {
    console.warn = vi.fn()
    console.error = vi.fn()
    const log = createGrIssueLog()

    interceptConsole(log)
    console.error('[GrModal] сломалось')

    expect(log.list()[0]?.kind).toBe('error')
  })

  it('снятие возвращает исходные функции', () => {
    const before = { warn: console.warn, error: console.error }

    const restore = interceptConsole(createGrIssueLog())
    restore()

    expect(console.warn).toBe(before.warn)
    expect(console.error).toBe(before.error)
  })
})
