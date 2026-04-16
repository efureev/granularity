import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import UnoCSS from 'unocss/vite'

const granularityDistRoot = fileURLToPath(new URL('../../packages/granularity/dist', import.meta.url))
const granularityDistEntry = fileURLToPath(new URL('../../packages/granularity/dist/index.js', import.meta.url))

export const showcaseBuildAnalyzeMode = 'analyze'
export const showcaseBuildVisualizerConfig = {
  filename: 'dist/stats.html',
  gzipSize: true,
  brotliSize: true,
  template: 'treemap',
} as const

export default defineConfig(({ command, mode }) => ({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: command === 'serve' ? '/' : '/granularity/',
  resolve: {
    alias: [
      {
        find: /^@feugene\/granularity$/,
        replacement: granularityDistEntry,
      },
      {
        find: /^@feugene\/granularity\/(.*)$/,
        replacement: `${granularityDistRoot}/$1`,
      },
    ],
  },
  plugins: [
    vue(),
    mode === showcaseBuildAnalyzeMode && visualizer(showcaseBuildVisualizerConfig),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),
    UnoCSS({
      configFile: fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
    }),
  ],
}))