import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_FORMS_SCHEMA_COMPONENTS } from './src/componentNames'

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
 */
export default defineConfig({
  plugins: [vue(), libInjectCss()],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        'index': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'granular-provider': fileURLToPath(
          new URL('./src/granular-provider/index.ts', import.meta.url),
        ),
        'granular-provider-node': fileURLToPath(
          new URL('./src/granular-provider/node.ts', import.meta.url),
        ),
        'resolver': fileURLToPath(
          new URL('./src/resolver.ts', import.meta.url),
        ),
        'model/index': fileURLToPath(
          new URL('./src/model/index.ts', import.meta.url),
        ),
        'ui-schema/index': fileURLToPath(
          new URL('./src/ui-schema/index.ts', import.meta.url),
        ),
        'renderers/index': fileURLToPath(
          new URL('./src/renderers/index.ts', import.meta.url),
        ),
        'renderers/extended': fileURLToPath(
          new URL('./src/renderers/extended.ts', import.meta.url),
        ),
        'renderers/chrono': fileURLToPath(
          new URL('./src/renderers/chrono.ts', import.meta.url),
        ),
        'validation/index': fileURLToPath(
          new URL('./src/validation/index.ts', import.meta.url),
        ),
        'server-errors/index': fileURLToPath(
          new URL('./src/server-errors/index.ts', import.meta.url),
        ),
        'adapters/zod/index': fileURLToPath(
          new URL('./src/adapters/zod/index.ts', import.meta.url),
        ),
        'adapters/json-schema/index': fileURLToPath(
          new URL('./src/adapters/json-schema/index.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrSchemaForm/index': fileURLToPath(
          new URL('./src/components/GrSchemaForm/index.ts', import.meta.url),
        ),
        // </granularity:components>
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
        /^@feugene\/granularity-chrono(\/.*)?$/,
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Схемные библиотеки — optional peer: их ставит тот, чей адаптер выбран.
        /^zod(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_FORMS_SCHEMA_COMPONENTS }),
      },
    },
  },
})
