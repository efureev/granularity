import type { App } from 'vue'

import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { PersistencePlugin } from '@feugene/fint-i18n/plugins'
import { GRANULARITY_I18N_BLOCK, en as grEn, ru as grRu } from '@feugene/granularity/i18n'
import { GR_CHRONO_I18N_BLOCK, en as grChronoEn, ru as grChronoRu } from '@feugene/granularity-chrono/i18n'
import { GR_EDITOR_I18N_BLOCK, en as grEditorEn, ru as grEditorRu } from '@feugene/granularity-editor/i18n'
import { GR_MEDIA_I18N_BLOCK, en as grMediaEn, ru as grMediaRu } from '@feugene/granularity-media/i18n'
import { GR_CHARTS_I18N_BLOCK, en as grChartsEn, ru as grChartsRu } from '@feugene/granularity-charts/i18n'
import { GR_DASHBOARD_I18N_BLOCK, en as grDashboardEn, ru as grDashboardRu } from '@feugene/granularity-dashboard/i18n'
import { GR_FORMS_SCHEMA_I18N_BLOCK, en as grFormsSchemaEn, ru as grFormsSchemaRu } from '@feugene/granularity-forms-schema/i18n'
import { GR_CODE_I18N_BLOCK, en as grCodeEn, ru as grCodeRu } from '@feugene/granularity-code/i18n'

import { SHOWCASE_I18N_BLOCK, showcaseLocaleLoaders } from './messages'

const defaultLocale = 'en'

/**
 * Локали пакетов — **именованными** импортами, а не агрегатом `<pkg>/i18n/all`.
 *
 * Переключатель витрины предлагает два языка (`ShowcaseLocaleSwitcher`), а агрегат
 * `<pkg>/i18n/all` тянет все, что есть у пакета. Лишние языки уезжают в `dist`
 * отдельными ленивыми чанками, поэтому ни на одной странице не проявляются: потеря
 * видна только в размере дистрибутива. Документация `fint-i18n` называет агрегат
 * в production-бандле отказом от tree-shaking локалей.
 *
 * Добавляете язык в переключатель — добавляйте импорт сюда. Лишний язык ловит
 * `checks/verify-locales.mjs` после сборки.
 */
const packageLoaders = [
  grEn,
  grRu,
  grChronoEn,
  grChronoRu,
  grChartsEn,
  grChartsRu,
  grDashboardEn,
  grDashboardRu,
  grFormsSchemaEn,
  grFormsSchemaRu,
  grEditorEn,
  grEditorRu,
  grMediaEn,
  grMediaRu,
  grCodeEn,
  grCodeRu,
]

export async function setupShowcaseI18n() {
  const i18n = createFintI18n({
    locale: defaultLocale,
    fallbackLocale: 'en',
    // Без этого `fallbackLocale` объявлен, но не работает: `loadUsedBlocks(defaultLocale)`
    // ниже грузит только 'ru', и `messagesStore.en` остаётся пустым до первого ручного
    // переключения языка — реальный fallback для отсутствующих ru-ключей не сработает.
    preloadFallback: true,
    // Каждый пакет кладёт строки в свой блок (`gr`, `grChrono`, `grCharts`, …), и
    // `fint-i18n` мерджит коллекции слева направо. Совпадение блоков не конфликт:
    // источники одного блока склеиваются, и приложение вправе дописать в чужой блок
    // свой язык или свои ключи.
    loaders: [showcaseLocaleLoaders, ...packageLoaders],
    plugins: [
      new PersistencePlugin({
        key: 'showcase-locale', // Key in localStorage
        syncTabs: true, // Synchronize between tabs
      }),
    ],
  })

  // Регистрируются только всегда нужные блоки. Блоки `components.*` из
  // `showcaseLocaleLoaders` сюда НЕ входят намеренно: их поднимает `useI18nScope`
  // на своей странице, и ранняя регистрация свела бы ленивую загрузку словарей
  // демо к нулю.
  i18n.registerBlocks([SHOWCASE_I18N_BLOCK, GRANULARITY_I18N_BLOCK, GR_CHRONO_I18N_BLOCK, GR_CHARTS_I18N_BLOCK, GR_DASHBOARD_I18N_BLOCK, GR_FORMS_SCHEMA_I18N_BLOCK, GR_EDITOR_I18N_BLOCK, GR_MEDIA_I18N_BLOCK, GR_CODE_I18N_BLOCK])
  // `PersistencePlugin` уже мог восстановить сохранённый в localStorage (`showcase-locale`)
  // язык в `i18n.locale.value` во время `createFintI18n`. Грузим блоки именно для активного
  // языка, а не для `defaultLocale`, иначе после перезагрузки страница остаётся на английском
  // (fallback), пока переключатель показывает сохранённый ru. `preloadFallback: true` при этом
  // догрузит en-fallback для отсутствующих ключей.
  await i18n.loadUsedBlocks(i18n.locale.value)

  return {
    install(app: App) {
      installI18n(app, i18n)
    },
  }
}
