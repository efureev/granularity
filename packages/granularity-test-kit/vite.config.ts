import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Сборка build-time хелпера: ESM, без рантайм-зависимостей.
 *
 * `vitest` остаётся external — фабрики зовут `describe`/`it`/`expect` того
 * инстанса, который запустил тест потребителя. Затяни мы его в бандл, в одном
 * прогоне оказалось бы два раннера, и зарегистрированные фабрикой тесты не
 * попали бы в отчёт.
 */
export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        gates: fileURLToPath(new URL('./src/gates/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vitest',
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
