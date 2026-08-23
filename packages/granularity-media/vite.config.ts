import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_MEDIA_COMPONENTS } from './src/componentNames'

/**
 * Build-конфиг пакета `@feugene/granularity-media`.
 *
 * Своих зависимостей у пакета нет: кроп, снимок и разбор кодов держатся на
 * Canvas и браузерных API, а не на библиотеке. Наружу остаются только peers.
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
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrImageCrop/index': fileURLToPath(
          new URL('./src/components/GrImageCrop/index.ts', import.meta.url),
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
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_MEDIA_COMPONENTS }),
      },
    },
  },
  define: {
    // Скобки обязательны: `!__GR_DEV__` без них развернулось бы в
    // `!typeof process !== 'undefined' && …`.
    __GR_DEV__: '(typeof process !== \'undefined\' && process.env.NODE_ENV !== \'production\')',
  },
})
