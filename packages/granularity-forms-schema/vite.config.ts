import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { granularityFormsSchemaProvider } from './src/granular-provider'

/**
 * Build-конфиг пакета `@feugene/granularity-forms-schema`.
 *
 * Слои пакета — отдельные entry, и это не косметика: `./model` обязан
 * собираться в модуль без единого импорта Vue и ядра, иначе третий адаптер
 * (valibot, OpenAPI, генератор на бэкенде) потянул бы за собой всю библиотеку.
 * По той же причине адаптеры разведены: поставил `zod` — `json-schema` в бандл
 * не попал.
 *
 * `@feugene/granularity-chrono` и `zod` — optional peer и внешние: пакет их
 * импортирует, но не оплачивает за тех, кто ими не пользуется.
 *
 * Раскладку `dist` и entry компонентов ведёт `granumProvider()`: он строит их
 * из реестра провайдера, извлекает классы и потребляемые токены по графу
 * бандла и пишет `dist/granum.manifest.json`. Руками их больше не перечисляют,
 * поэтому сгенерированного блока entry в этом файле нет.
 */

/**
 * Entry, которые строит не плагин: слои пакета и служебные точки входа. Entry
 * компонентов и `index` `granumProvider()` собирает сам из реестра провайдера.
 */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'model/index': 'src/model/index.ts',
  'ui-schema/index': 'src/ui-schema/index.ts',
  'renderers/index': 'src/renderers/index.ts',
  'renderers/extended': 'src/renderers/extended.ts',
  'renderers/chrono': 'src/renderers/chrono.ts',
  'validation/index': 'src/validation/index.ts',
  'server-errors/index': 'src/server-errors/index.ts',
  'adapters/zod/index': 'src/adapters/zod/index.ts',
  'adapters/json-schema/index': 'src/adapters/json-schema/index.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
    granumProvider({
      provider: granularityFormsSchemaProvider,
      engine: windEngine(),
      entries: extraEntries,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
        /^@feugene\/granularity-chrono(\/.*)?$/,
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Схемные библиотеки — optional peer: их ставит тот, чей адаптер выбран.
        /^zod(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
    },
  },
})
