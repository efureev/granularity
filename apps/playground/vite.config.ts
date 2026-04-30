import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import UnoCSS from 'unocss/vite'

export const playgroundGranularityEntry = fileURLToPath(new URL('../../packages/granularity/dist/index.js', import.meta.url))
export const playgroundGranularityDistDir = fileURLToPath(new URL('../../packages/granularity/dist/', import.meta.url))
export const playgroundGranularityFoundationCssEntry = fileURLToPath(new URL('../../packages/granularity/dist/foundation.css', import.meta.url))
export const playgroundGranularityStylesCssEntry = fileURLToPath(new URL('../../packages/granularity/dist/styles.css', import.meta.url))
export const playgroundGranularityButtonCssEntry = fileURLToPath(new URL('../../packages/granularity/dist/components/GrButton/styles.css', import.meta.url))
export const playgroundBuildAnalyzeMode = 'analyze'
export const playgroundBuildVisualizerConfig = {
  filename: 'dist/stats.html',
  gzipSize: true,
  brotliSize: true,
  template: 'treemap',
} as const
export const playgroundVueChunkGroup = {
  name: 'vue',
  test: /node_modules[\\/](?:vue|@vue)[\\/]/,
  priority: 2,
}
export const playgroundGranularityChunkGroup = {
  name: 'granularity',
  test: (id: string) => id.startsWith(playgroundGranularityDistDir),
  priority: 1,
}

export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/playground/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            playgroundVueChunkGroup,
            playgroundGranularityChunkGroup,
          ],
        },
      },
    },
  },
  plugins: [
    vue(),
    mode === playgroundBuildAnalyzeMode && visualizer(playgroundBuildVisualizerConfig),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),
    UnoCSS({
      configFile: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    }),
  ],
  resolve: {
    alias: {
      '@granularity': playgroundGranularityEntry,
      '@granularity-foundation': playgroundGranularityFoundationCssEntry,
      '@granularity-styles': playgroundGranularityStylesCssEntry,
      '@granularity-button-css': playgroundGranularityButtonCssEntry,
    },
  },
}))