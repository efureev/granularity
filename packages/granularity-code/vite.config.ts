import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularAssetFileNames, granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { GRANULARITY_CODE_COMPONENTS } from './src/componentNames'

/**
 * Build-конфиг пакета `@feugene/granularity-code`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/unocss-preset-granular` остаются
 *   external (peer-зависимости) — пакет не дублирует их рантайм;
 * — **CodeMirror тоже external**, и это не оптимизация: `@codemirror/state`
 *   обязан быть в приложении в одном экземпляре, второй даёт два набора типов
 *   состояния, и первое же расширение потребителя падает на чужом документе.
 *   Та же причина, по которой `granularity-editor` держит внешним ProseMirror;
 * — собственных runtime-зависимостей у пакета нет. Подсветка приходит функцией
 *   по контракту `GrCodeTokenizer`, поэтому Shiki здесь не упомянут вовсе:
 *   его нет ни в манифесте, ни в импортах.
 *
 * Каждый компонент публикуется отдельным `components/<Name>/index` entry для
 * tree-shake; SFC-чанки складываются в `components/<Name>/chunks/` через
 * `granularChunkFileNames`, чтобы UnoCSS в приложении мог сканировать шаблоны
 * через `content.filesystem` пресета.
 */
export default defineConfig({
  plugins: [vue(), libInjectCss()],
  /**
   * `__GR_DEV__` разворачивается в текст гарда на нашей сборке — свернуть его
   * бандлеру потребителя. Скобки обязательны: `!__GR_DEV__` без них развернулось
   * бы в `!process.env.NODE_ENV !== 'production'`.
   */
  define: {
    __GR_DEV__: '(process.env.NODE_ENV !== \'production\')',
  },
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
        'diff/index': fileURLToPath(
          new URL('./src/diff/index.ts', import.meta.url),
        ),
        'highlight/index': fileURLToPath(
          new URL('./src/highlight/index.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrCodeBlock/index': fileURLToPath(
          new URL('./src/components/GrCodeBlock/index.ts', import.meta.url),
        ),
        'components/GrCodeEditor/index': fileURLToPath(
          new URL('./src/components/GrCodeEditor/index.ts', import.meta.url),
        ),
        'components/GrDiff/index': fileURLToPath(
          new URL('./src/components/GrDiff/index.ts', import.meta.url),
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
        /^@codemirror\/.*/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: granularAssetFileNames({ components: GRANULARITY_CODE_COMPONENTS }),
      },
    },
  },
})
