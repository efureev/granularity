import type { App } from 'vue'

import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { PersistencePlugin } from '@feugene/fint-i18n/plugins'
import { GRANULARITY_I18N_BLOCK } from '@feugene/granularity/i18n'
import grLocales from '@feugene/granularity/i18n/all'

import { SHOWCASE_I18N_BLOCK, showcaseLocaleLoaders } from './messages'

const defaultLocale = 'en'

export async function setupShowcaseI18n() {
  const i18n = createFintI18n({
    locale: defaultLocale,
    fallbackLocale: 'en',
    // Без этого `fallbackLocale` объявлен, но не работает: `loadUsedBlocks(defaultLocale)`
    // ниже грузит только 'ru', и `messagesStore.en` остаётся пустым до первого ручного
    // переключения языка — реальный fallback для отсутствующих ru-ключей не сработает.
    preloadFallback: true,
    loaders: [showcaseLocaleLoaders, ...grLocales],
    plugins: [
      new PersistencePlugin({
        key: 'showcase-locale', // Key in localStorage
        syncTabs: true        // Synchronize between tabs
      })
    ]
  })

  i18n.registerBlocks([SHOWCASE_I18N_BLOCK, GRANULARITY_I18N_BLOCK])
  await i18n.loadUsedBlocks(defaultLocale)

  return {
    install(app: App) {
      installI18n(app, i18n)
    },
  }
}
