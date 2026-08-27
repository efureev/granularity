import type { App } from 'vue'
import { GRANULARITY_I18N_KEY } from '@feugene/granularity/i18n'
import { describe, expect, it, vi } from 'vitest'

import { registerI18nState } from '../plugin/i18nState'
import { createGrIssueLog } from '../resolve/issues'

interface TimelineCall {
  event: { title?: string, subtitle?: string }
}

function fakeApi() {
  return { now: () => 0, addTimelineEvent: vi.fn<(call: TimelineCall) => void>() }
}

function appWith(provides: Record<symbol, unknown>): App {
  return { _context: { provides } } as unknown as App
}

describe('состояние i18n', () => {
  it('без адаптера пишет в журнал: молчание тут и есть дефект', () => {
    const log = createGrIssueLog()
    registerI18nState(fakeApi() as never, appWith({}), log)

    expect(log.list()[0]?.message).toContain('i18n adapter not found')
  })

  it('находит адаптер ядра и его локаль', () => {
    const api = fakeApi()
    registerI18nState(api as never, appWith({ [GRANULARITY_I18N_KEY as symbol]: { t: () => '', locale: 'ru' } }), createGrIssueLog())

    expect(api.addTimelineEvent.mock.calls[0]?.[0]?.event).toMatchObject({
      title: 'i18n adapter: granularity',
      subtitle: 'locale: ru',
    })
  })

  it('принимает адаптер fint-i18n и реактивную локаль', () => {
    const api = fakeApi()
    registerI18nState(api as never, appWith({ [Symbol.for('FintI18n')]: { t: () => '', locale: { value: 'es' } } }), createGrIssueLog())

    expect(api.addTimelineEvent.mock.calls[0]?.[0]?.event).toMatchObject({
      title: 'i18n adapter: fint-i18n',
      subtitle: 'locale: es',
    })
  })

  it('объект без `t` адаптером не считается', () => {
    const log = createGrIssueLog()
    registerI18nState(fakeApi() as never, appWith({ [GRANULARITY_I18N_KEY as symbol]: { locale: 'ru' } }), log)

    expect(log.list()).toHaveLength(1)
  })
})
