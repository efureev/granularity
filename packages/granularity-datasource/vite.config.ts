import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Сборка пакета состояния: два entry, ESM, ни одного рантайм-зависимого байта
 * кроме Vue.
 *
 * Плагина `granumProvider()` и `libInjectCss` из общего рецепта спутника здесь
 * нет: оба про компоненты и их CSS, а компонентов у пакета нет — значит, нет и
 * манифеста.
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
    // Скобки обязательны, а `typeof process` в выражении быть не должно — оно
    // гасило бы гард в браузере целиком. Разбор — `packages/granularity/vite.config.ts`.
    __GR_DEV__: '(process.env.NODE_ENV !== \'production\')',
  },
})
