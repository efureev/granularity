import { defineConfig } from 'vite'

/**
 * Сборка пакета токенов: реестр и сборщик тем. Данные тем (`dist/themes`) и
 * формулы (`dist/tokens.css`) пишет следующим шагом `scripts/generate.mjs --dist`
 * — тем же `defineTheme`, что и всё остальное.
 *
 * Entry `theme/*` лежат на той же глубине, что исходники: `theme/node` находит
 * встроенные темы пакета относительным путём `../../themes`.
 */
export default defineConfig({
  build: {
    target: 'esnext',
    emptyOutDir: true,
    lib: {
      entry: {
        'index': 'src/index.ts',
        'theme/index': 'src/theme/index.ts',
        'theme/node': 'src/theme/node.ts',
        'theme/apply': 'src/theme/apply.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [/^node:/],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
