import { describe, expect, it } from 'vitest'

import { GRANULARITY_I18N_BLOCK, en, ru, es } from '..'
import all from '../all'

async function loadLocalePayload(locale: 'en' | 'ru' | 'es') {
  return (await import(`../locales/${locale}.json`)).default
}

describe('granularity i18n messages', () => {
  it('locale payload files имеют payload-only формат', async () => {
    const enPayload = await loadLocalePayload('en')
    const ruPayload = await loadLocalePayload('ru')
    const esPayload = await loadLocalePayload('es')

    expect(GRANULARITY_I18N_BLOCK).toBe('gr')
    expect(enPayload.loading.defaultText).toBe('Loading...')
    expect(ruPayload.loading.defaultText).toBe('Загрузка...')
    expect(esPayload.loading.defaultText).toBe('Cargando...')
    expect((enPayload as Record<string, unknown>).ds).toBeUndefined()
  })

  it('экспортирует per-locale loaders для fint-i18n', async () => {
    const enMessages = await en.en[GRANULARITY_I18N_BLOCK]()
    const ruMessages = await ru.ru[GRANULARITY_I18N_BLOCK]()
    const esMessages = await es.es[GRANULARITY_I18N_BLOCK]()

    expect(enMessages.default.loading.defaultText).toBe('Loading...')
    expect(ruMessages.default.loading.defaultText).toBe('Загрузка...')
    expect(esMessages.default.loading.defaultText).toBe('Cargando...')
  })

  it('агрегат all содержит все per-locale модули', () => {
    expect(all).toEqual([en, ru, es])
  })
})
