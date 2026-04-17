import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Lightweight build config for a build-time helper.
 *
 * — ESM-only (`formats: ['es']`);
 * — zero runtime dependencies on `unplugin-vue-components` or `@feugene/granularity`
 *   (both are peers and stay external);
 * — declarations are emitted separately via `vue-tsc -p tsconfig.build.json`
 *   (see `package.json` scripts).
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
        'unplugin-vue-components',
        '@feugene/granularity',
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
