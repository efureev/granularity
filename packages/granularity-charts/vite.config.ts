import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_CHARTS_COMPONENTS } from './src/componentNames'

/**
 * Build-конфиг пакета `@feugene/granularity-charts`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular`
 *   остаются external (peer-зависимости) — пакет не дублирует их рантайм;
 * — собственных runtime-зависимостей нет: шкалы, деления и раскладка это
 *   обычная арифметика, форматирование даёт `Intl`;
 * — каждый компонент публикуется отдельным `components/<Name>/index` entry
 *   для tree-shake; SFC-чанки складываются в `components/<Name>/chunks/`
 *   через `granularChunkFileNames`, чтобы UnoCSS в приложении сканировал
 *   шаблоны через `content.filesystem` пресета `presetGranularNode`;
 * — арифметика (`chart/`) и композаблы отдаются своими entry: их берут и без
 *   компонентов — например чтобы посчитать деления для своей разметки.
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
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'granular-provider': fileURLToPath(
          new URL('./src/granular-provider/index.ts', import.meta.url),
        ),
        'granular-provider-node': fileURLToPath(
          new URL('./src/granular-provider/node.ts', import.meta.url),
        ),
        resolver: fileURLToPath(
          new URL('./src/resolver.ts', import.meta.url),
        ),
        'chart/index': fileURLToPath(
          new URL('./src/chart/index.ts', import.meta.url),
        ),
        'composables/useChartScale': fileURLToPath(
          new URL('./src/composables/useChartScale.ts', import.meta.url),
        ),
        'composables/useChartTicks': fileURLToPath(
          new URL('./src/composables/useChartTicks.ts', import.meta.url),
        ),
        'composables/useChartTooltip': fileURLToPath(
          new URL('./src/composables/useChartTooltip.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrChartArea/index': fileURLToPath(
          new URL('./src/components/GrChartArea/index.ts', import.meta.url),
        ),
        'components/GrChartLine/index': fileURLToPath(
          new URL('./src/components/GrChartLine/index.ts', import.meta.url),
        ),
        'components/GrChartPie/index': fileURLToPath(
          new URL('./src/components/GrChartPie/index.ts', import.meta.url),
        ),
        'components/GrSparkline/index': fileURLToPath(
          new URL('./src/components/GrSparkline/index.ts', import.meta.url),
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
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_CHARTS_COMPONENTS }),
      },
    },
  },
})
