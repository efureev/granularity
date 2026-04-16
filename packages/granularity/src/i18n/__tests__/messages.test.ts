import { describe, expect, it } from 'vitest'

import { DS_I18N_BLOCK, dsLocaleLoaders } from '..'

async function loadLocalePayload(locale: 'en' | 'ru' | 'es') {
  return (await import(`../locales/${locale}.json`)).default
}

describe('granularity i18n messages', () => {
  it('locale payload files имеют payload-only формат', async () => {
    const en = await loadLocalePayload('en')
    const ru = await loadLocalePayload('ru')
    const es = await loadLocalePayload('es')

    expect(DS_I18N_BLOCK).toBe('ds')
    expect(en.loading.defaultText).toBe('Loading...')
    expect(ru.loading.defaultText).toBe('Загрузка...')
    expect(es.loading.defaultText).toBe('Cargando...')
    expect((en as Record<string, unknown>).ds).toBeUndefined()
  })

  it('экспортирует package-level locale loaders для fint-i18n', async () => {
    const enMessages = await dsLocaleLoaders.en[DS_I18N_BLOCK]()
    const ruMessages = await dsLocaleLoaders.ru[DS_I18N_BLOCK]()
    const esMessages = await dsLocaleLoaders.es[DS_I18N_BLOCK]()

    expect(enMessages.default.loading.defaultText).toBe('Loading...')
    expect(ruMessages.default.loading.defaultText).toBe('Загрузка...')
    expect(esMessages.default.loading.defaultText).toBe('Cargando...')
  })
})
