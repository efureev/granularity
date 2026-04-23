import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

/**
 * Build-конфиг пакета `@feugene/extra-granularity`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular`
 *   остаются external (peer-зависимости), пакет не дублирует их рантайм;
 * — каждый компонент публикуется как отдельный `components/<Name>/index` entry
 *   для tree‑shake; SFC‑чанки складываются в `components/<Name>/chunks/`
 *   через `granularChunkFileNames`, чтобы UnoCSS в приложении мог корректно
 *   сканировать шаблоны через `content.filesystem` пресета `presetGranularNode`;
 * — деклараций `.d.ts` эмитит `vue-tsc -p tsconfig.build.json`.
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
        'components/XgQuickForm/index': fileURLToPath(
          new URL('./src/components/XgQuickForm/index.ts', import.meta.url),
        ),
        'granular-provider': fileURLToPath(
          new URL('./src/granular-provider/index.ts', import.meta.url),
        ),
        'granular-provider-node': fileURLToPath(
          new URL('./src/granular-provider/node.ts', import.meta.url),
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
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: assetInfo => assetInfo.name ?? '[name][extname]',
      },
    },
  },
})
