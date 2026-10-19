import { defineConfig } from 'vite'

/**
 * Node-вход `theme/node`: читает папки тем с диска. Отдельной сборкой поверх
 * браузерной — `dist` она не чистит. Entry лежит на той же глубине, что
 * исходник: `theme/node` находит встроенные темы пакета путём `../../themes`.
 */
export default defineConfig({
  build: {
    target: 'esnext',
    emptyOutDir: false,
    lib: {
      entry: { 'theme/node': 'src/theme/node.ts' },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [/^node:/],
      output: {
        chunkFileNames: 'chunks/node-[name]-[hash].js',
      },
    },
  },
})
