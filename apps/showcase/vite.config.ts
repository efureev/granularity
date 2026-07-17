import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import UnoCSS from 'unocss/vite'

// GitHub Pages SPA fallback: copy dist/index.html -> dist/404.html so that
// direct visits to nested routes (e.g. /granularity/components) are served
// the SPA shell and Vue Router can take over client-side routing.
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const outDir = fileURLToPath(new URL('./dist', import.meta.url))
      const indexHtml = path.join(outDir, 'index.html')
      const notFoundHtml = path.join(outDir, '404.html')
      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, notFoundHtml)
      }
    },
  }
}

const granularityDistRoot = fileURLToPath(new URL('../../packages/granularity/dist', import.meta.url))
const granularityDistEntry = fileURLToPath(new URL('../../packages/granularity/dist/index.js', import.meta.url))

const granularityPackageJson = fileURLToPath(new URL('../../packages/granularity/package.json', import.meta.url))
const granularityVersion = JSON.parse(readFileSync(granularityPackageJson, 'utf-8')).version as string

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
  define: {
    __GRANULARITY_VERSION__: JSON.stringify(granularityVersion),
  },
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
    githubPagesSpaFallback(),
  ],
}))