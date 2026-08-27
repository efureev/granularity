import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Сборка dev-инструмента: одна ESM-entry, никакого CSS — панель рисует Vue
 * DevTools, а не пакет.
 *
 * `@vue/devtools-api` остаётся external, хотя лежит в `dependencies`: клиент
 * DevTools в приложении обязан быть один, иначе вторая копия заведёт свой
 * буфер плагинов и панель не увидит ни одного раздела.
 */
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'oxc',
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        '@vue/devtools-api',
        /^@feugene\/granularity(\/.*)?$/,
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
