import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Lightweight ESM build for composite components on top of `@feugene/granularity`.
 *
 * — `vue`, `@feugene/granularity` and its sub-path exports stay external
 *   (peer dependencies), so this package carries no duplicated runtime;
 * — each component ships with its own entry + adjacent `styles.css`, so the
 *   consumer can tree-shake and import only what they really use;
 * — declarations are emitted by `vue-tsc -p tsconfig.build.json`.
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'esnext',
    minify: 'oxc',
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'components/XgQuickForm/index': fileURLToPath(
          new URL('./src/components/XgQuickForm/index.ts', import.meta.url),
        ),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Vite names the combined library CSS after the package ("extra-granularity.css").
          // Rename it to match the package.json export `./components/XgQuickForm/styles.css`.
          if (assetInfo.name?.endsWith('.css'))
            return 'components/XgQuickForm/styles.css'

          return assetInfo.name ?? '[name][extname]'
        },
      },
    },
  },
})
