import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Сборка пакета состояния: два entry, ESM, ни одного рантайм-зависимого байта
 * кроме Vue.
 *
 * `granularChunkFileNames` и `libInjectCss` из общего рецепта спутника здесь не
 * нужны: оба про CSS компонентов, а компонентов у пакета нет.
 */
export default defineConfig({
  build: {
    target: 'esnext',
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        url: fileURLToPath(new URL('./src/url/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [/^node:/, 'vue'],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
  define: {
    // Тот же гард, что в ядре: подстановка текстом, чтобы бандлер потребителя
    // свернул предупреждения вместе с веткой. Скобки обязательны — без них
    // `!__GR_DEV__` развернулось бы в `!typeof process !== 'undefined' && …`.
    __GR_DEV__: "(typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')",
  },
})
