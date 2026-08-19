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
    // `esnext` + без минификации — не вкусовщина. Колбэки из `./e2e` уезжают в
    // `page.evaluate`, то есть сериализуются в строку и исполняются в браузере:
    // впрысни сборка в их тело свой хелпер (даунлевелинг spread или `??`), и
    // там получится `X is not defined` — в рантайме и только в браузере.
    target: 'esnext',
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        gates: fileURLToPath(new URL('./src/gates/index.ts', import.meta.url)),
        vue: fileURLToPath(new URL('./src/vue/index.ts', import.meta.url)),
        a11y: fileURLToPath(new URL('./src/a11y/index.ts', import.meta.url)),
        e2e: fileURLToPath(new URL('./src/e2e/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vitest',
        // Ровно по той же причине, что и `vitest`: раннер, Vue и axe обязаны
        // остаться теми, что уже стоят у потребителя. Второй инстанс любого из
        // них — это второй реестр хуков, второе приложение Vue и второй набор
        // правил, и совпадать с первым он не обязан.
        'vue',
        '@vue/test-utils',
        'axe-core',
        '@playwright/test',
        '@axe-core/playwright',
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
