import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_DASHBOARD_COMPONENTS } from './src/componentNames'

/**
 * Build-конфиг пакета `@feugene/granularity-dashboard`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular`
 *   остаются external (peer-зависимости) — пакет не дублирует их рантайм;
 * — собственных runtime-зависимостей нет: коллизии, компактизация и геометрия
 *   сетки это обычная арифметика над целыми числами;
 * — каждый компонент публикуется отдельным `components/<Name>/index` entry
 *   для tree-shake; SFC-чанки складываются в `components/<Name>/chunks/`
 *   через `granularChunkFileNames`, а общие шаблоны рамы — в
 *   `groups/GrDashboardFrame/shared/` (поле `group` дескриптора), чтобы UnoCSS
 *   в приложении просканировал и те, и другие;
 * — арифметика раскладки (`layout/`) отдаётся своим entry: её берут и без
 *   компонентов — например чтобы проверить пришедшую с сервера раскладку.
 *
 * Список компонентов берётся из `src/componentNames.ts`, а не дублируется
 * здесь: один генерируемый список на конфиг сборки и резолвер.
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
        'composables/useDashboardLayout': fileURLToPath(
          new URL('./src/composables/useDashboardLayout.ts', import.meta.url),
        ),
        'composables/useDashboardTransfer': fileURLToPath(
          new URL('./src/composables/useDashboardTransfer.ts', import.meta.url),
        ),
        'layout/index': fileURLToPath(
          new URL('./src/layout/index.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrDashboard/index': fileURLToPath(
          new URL('./src/components/GrDashboard/index.ts', import.meta.url),
        ),
        'components/GrDashboardItem/index': fileURLToPath(
          new URL('./src/components/GrDashboardItem/index.ts', import.meta.url),
        ),
        'components/GrDashboardItemSettings/index': fileURLToPath(
          new URL('./src/components/GrDashboardItemSettings/index.ts', import.meta.url),
        ),
        'components/GrDashboardPalette/index': fileURLToPath(
          new URL('./src/components/GrDashboardPalette/index.ts', import.meta.url),
        ),
        'components/GrDashboardToolbar/index': fileURLToPath(
          new URL('./src/components/GrDashboardToolbar/index.ts', import.meta.url),
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
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
        // Тип `LocaleLoaderCollection` стирается на сборке, но правило общее:
        // i18n-слой принадлежит приложению, а не пакету.
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_DASHBOARD_COMPONENTS }),
      },
    },
  },
})
