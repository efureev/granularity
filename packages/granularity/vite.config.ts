import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import {libInjectCss} from "vite-plugin-lib-inject-css";

/**
 * Build-конфиг пакета `@feugene/granularity`.
 *
 * Пакет НЕ собирает CSS самостоятельно. Финальный CSS формируется на стороне
 * приложения через `@feugene/unocss-preset-granular`, которому передаётся
 * `granularityProvider` (см. `src/granular-provider/`).
 *
 * SFC‑чанки укладываются в `components/<Name>/chunks/` через хелпер
 * `granularChunkFileNames`, чтобы UnoCSS в приложении мог просканировать
 * исходники компонента через автоматический `content.filesystem` пресета
 * `presetGranularNode`.
 */
export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
    Icons({ compiler: 'vue3', autoInstall: false }),
  ],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'components/DsAlert/index': fileURLToPath(
          new URL('./src/components/DsAlert/index.ts', import.meta.url),
        ),
        'components/DsButton/index': fileURLToPath(
          new URL('./src/components/DsButton/index.ts', import.meta.url),
        ),
        'components/DsCard/index': fileURLToPath(
          new URL('./src/components/DsCard/index.ts', import.meta.url),
        ),
        'components/DsFormField/index': fileURLToPath(
          new URL('./src/components/DsFormField/index.ts', import.meta.url),
        ),
        'components/DsInput/index': fileURLToPath(
          new URL('./src/components/DsInput/index.ts', import.meta.url),
        ),
        'components/DsRadio/index': fileURLToPath(
          new URL('./src/components/DsRadio/index.ts', import.meta.url),
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
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: assetInfo => assetInfo.name ?? '[name][extname]',
      },
    },
  },
})
