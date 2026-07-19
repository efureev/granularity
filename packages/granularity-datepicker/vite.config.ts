import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

/**
 * Build-конфиг пакета `@feugene/granularity-datepicker`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular`
 *   остаются external (peer-зависимости) — пакет не дублирует их рантайм;
 * — `@vuepic/vue-datepicker` и `date-fns` — собственные (внешние) зависимости
 *   пакета: тоже помечены external, чтобы не бандлить их внутрь, а резолвить
 *   у потребителя (единый инстанс, корректный tree-shaking date-fns);
 * — каждый компонент публикуется как отдельный `components/<Name>/index` entry
 *   для tree-shake; SFC-чанки складываются в `components/<Name>/chunks/`
 *   через `granularChunkFileNames`, чтобы UnoCSS в приложении мог сканировать
 *   шаблоны через `content.filesystem` пресета `presetGranularNode`;
 * — CSS `@vuepic/vue-datepicker/dist/main.css` инлайнится в чанк компонента
 *   через `libInjectCss` и подключается как side-effect только при импорте
 *   пикера (см. `sideEffects` в package.json);
 * — декларации `.d.ts` эмитит `vue-tsc -p tsconfig.build.json`.
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
        'components/GrDateTimePicker/index': fileURLToPath(
          new URL('./src/components/GrDateTimePicker/index.ts', import.meta.url),
        ),
        'components/GrDatePicker/index': fileURLToPath(
          new URL('./src/components/GrDatePicker/index.ts', import.meta.url),
        ),
        'components/GrTimePicker/index': fileURLToPath(
          new URL('./src/components/GrTimePicker/index.ts', import.meta.url),
        ),
        'components/GrDateRangePicker/index': fileURLToPath(
          new URL('./src/components/GrDateRangePicker/index.ts', import.meta.url),
        ),
        'granular-provider': fileURLToPath(
          new URL('./src/granular-provider/index.ts', import.meta.url),
        ),
        'granular-provider-node': fileURLToPath(
          new URL('./src/granular-provider/node.ts', import.meta.url),
        ),
        resolver: fileURLToPath(
          new URL('./src/resolver.ts', import.meta.url),
        ),
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
        /^@vuepic\/vue-datepicker(\/.*)?$/,
        /^date-fns(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: assetInfo => assetInfo.name ?? '[name][extname]',
      },
    },
  },
})
