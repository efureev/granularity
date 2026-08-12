import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_CHRONO_COMPONENTS } from './src/componentNames'

/**
 * Build-конфиг пакета `@feugene/granularity-chrono`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular`
 *   остаются external (peer-зависимости) — пакет не дублирует их рантайм;
 * — собственных runtime-зависимостей у пакета нет: даты считаются своей
 *   арифметикой, локале-зависимое даёт `Intl`;
 * — каждый компонент публикуется как отдельный `components/<Name>/index` entry
 *   для tree-shake; SFC-чанки складываются в `components/<Name>/chunks/`
 *   через `granularChunkFileNames`, чтобы UnoCSS в приложении мог сканировать
 *   шаблоны через `content.filesystem` пресета `presetGranularNode`;
 * — декларации `.d.ts` эмитит `vue-tsc -p tsconfig.build.json`.
 *
 * Список компонентов берётся из `src/componentNames.ts`, а не дублируется
 * здесь: один генерируемый список на конфиг сборки и резолвер — реестром
 * меньше, рассинхроном меньше.
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
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrCalendar/index': fileURLToPath(
          new URL('./src/components/GrCalendar/index.ts', import.meta.url),
        ),
        'components/GrDatePicker/index': fileURLToPath(
          new URL('./src/components/GrDatePicker/index.ts', import.meta.url),
        ),
        'components/GrDateTimePicker/index': fileURLToPath(
          new URL('./src/components/GrDateTimePicker/index.ts', import.meta.url),
        ),
        'components/GrTimePicker/index': fileURLToPath(
          new URL('./src/components/GrTimePicker/index.ts', import.meta.url),
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
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_CHRONO_COMPONENTS }),
      },
    },
  },
})
