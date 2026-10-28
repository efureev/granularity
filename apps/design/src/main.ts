import { createApp } from 'vue'

import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { initThemeEarly } from '@feugene/granularity'
import { GRANULARITY_I18N_BLOCK, ru } from '@feugene/granularity/i18n'
import { GR_CHARTS_I18N_BLOCK, ru as chartsRu } from '@feugene/granularity-charts/i18n'
import { GR_CHRONO_I18N_BLOCK, ru as chronoRu } from '@feugene/granularity-chrono/i18n'
import { GR_CODE_I18N_BLOCK, ru as codeRu } from '@feugene/granularity-code/i18n'
import { GR_DASHBOARD_I18N_BLOCK, ru as dashboardRu } from '@feugene/granularity-dashboard/i18n'
import { GR_EDITOR_I18N_BLOCK, ru as editorRu } from '@feugene/granularity-editor/i18n'
import { GR_FORMS_SCHEMA_I18N_BLOCK, ru as formsSchemaRu } from '@feugene/granularity-forms-schema/i18n'
import { GR_MEDIA_I18N_BLOCK, ru as mediaRu } from '@feugene/granularity-media/i18n'
import themeManifest from 'virtual:granum/themes'

import './styles/reset.css'
import 'virtual:granum.css'
// Дополнительные темы приложение показывает всегда: их листы — сразу, без кадра без значений.
import 'virtual:granum/themes.css'

import App from './app/App.vue'
import { followDocumentTheme, router } from './app/router'
import { THEME_STORAGE_KEY } from './app/theme'

// Пара сохранённого выбора — до первого кадра; тему адреса включает роутер до отрисовки страницы.
initThemeEarly({ manifest: themeManifest, storageKey: THEME_STORAGE_KEY })
followDocumentTheme()

/**
 * Приложение русское: встроенные строки компонентов — из словаря пакета, а не
 * английским запасным текстом. Словарь грузится динамически и нужен до первого
 * рендера; обёртка в функцию, а не top-level await, — он сделал бы модуль
 * отложенным и поменял порядок выполнения графа импортов.
 */
async function bootstrap(): Promise<void> {
  const i18n = createFintI18n({
    locale: 'ru',
    fallbackLocale: 'ru',
    loaders: [ru, chronoRu, chartsRu, codeRu, dashboardRu, editorRu, formsSchemaRu, mediaRu],
  })
  i18n.registerBlocks([
    GRANULARITY_I18N_BLOCK,
    GR_CHRONO_I18N_BLOCK,
    GR_CHARTS_I18N_BLOCK,
    GR_CODE_I18N_BLOCK,
    GR_DASHBOARD_I18N_BLOCK,
    GR_EDITOR_I18N_BLOCK,
    GR_FORMS_SCHEMA_I18N_BLOCK,
    GR_MEDIA_I18N_BLOCK,
  ])
  await i18n.loadUsedBlocks('ru')

  const app = createApp(App).use(router)
  installI18n(app, i18n)
  app.mount('#app')
}

void bootstrap()
