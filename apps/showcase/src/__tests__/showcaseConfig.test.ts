import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  showcaseGranularOptions,
} from '../../uno.config'
import {
  showcaseBuildAnalyzeMode,
  showcaseBuildVisualizerConfig,
} from '../../vite.config'

const showcasePackageJson = readFileSync(
  fileURLToPath(new URL('../../package.json', import.meta.url)),
  'utf8',
)

const showcaseMainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const normalizedShowcaseMainEntry = showcaseMainEntry.replace(/\s+/g, ' ')

const showcaseI18nEntryPath = fileURLToPath(new URL('../i18n/index.ts', import.meta.url))
const showcaseI18nMessagesPath = fileURLToPath(new URL('../i18n/messages.ts', import.meta.url))

const showcaseI18nEntry = existsSync(showcaseI18nEntryPath)
  ? readFileSync(showcaseI18nEntryPath, 'utf8')
  : ''

const showcaseI18nMessagesEntry = existsSync(showcaseI18nMessagesPath)
  ? readFileSync(showcaseI18nMessagesPath, 'utf8')
  : ''

const showcaseAppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

const showcaseLayoutEntry = readFileSync(
  fileURLToPath(new URL('../layouts/ShowcaseLayout.vue', import.meta.url)),
  'utf8',
)

const showcaseUnoConfig = readFileSync(
  fileURLToPath(new URL('../../uno.config.ts', import.meta.url)),
  'utf8',
)

describe('showcase bootstrap config', () => {
  it('настраивает базовые app scripts, включая analyze-режим сборки', () => {
    expect(showcasePackageJson).toContain('"dev": "yarn prepare:granularity && yarn generate:api && yarn generate:search && vite"')
    expect(showcasePackageJson).toContain('"generate:api": "node ./scripts/generate-component-api.mjs"')
    expect(showcasePackageJson).toContain('"generate:search": "node ./scripts/generate-showcase-search-index.mjs"')
    expect(showcasePackageJson).toContain('"generate:search:local": "yarn prepare:granularity && node ./scripts/generate-showcase-search-index.mjs"')
    expect(showcasePackageJson).toContain('"prepare:granularity": "yarn workspace @feugene/granularity build"')
    expect(showcasePackageJson).toContain('"build": "yarn generate:api && yarn generate:search && vite build"')
    expect(showcasePackageJson).toContain('"build:analyze": "yarn generate:api && yarn generate:search && vite build --mode analyze"')
    expect(showcasePackageJson).toContain('"test:run": "yarn generate:api && yarn generate:search && vitest run --config vitest.config.ts"')
    expect(showcaseBuildAnalyzeMode).toBe('analyze')
    expect(showcaseBuildVisualizerConfig).toEqual({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    })
  })

  it('подключает reset, uno runtime и раннюю инициализацию темы без legacy-зависимостей', () => {
    expect(showcaseMainEntry).toContain("import '@unocss/reset/tailwind-compat.css'")
    expect(showcaseMainEntry).toContain("import 'virtual:uno.css'")
    expect(normalizedShowcaseMainEntry).toContain("import {initThemeEarly} from '@feugene/granularity'")
    expect(normalizedShowcaseMainEntry).toContain("import {setupShowcaseI18n} from './i18n'")
    expect(normalizedShowcaseMainEntry).toContain("import {router} from './app/router'")
    expect(normalizedShowcaseMainEntry).toContain('initThemeEarly()')
    expect(normalizedShowcaseMainEntry).toContain('const i18n = await setupShowcaseI18n()')
    expect(normalizedShowcaseMainEntry).toContain('.use(i18n)')
    expect(normalizedShowcaseMainEntry).toContain('.use(router)')
    expect(showcaseMainEntry).not.toContain("@feugene/granularity/styles.css")
    expect(showcaseMainEntry).not.toContain('legacy')
  })

  it('подключает fint-i18n и отдельные app-level locale loaders для showcase', () => {
    expect(showcasePackageJson).toContain('"@feugene/fint-i18n": "^0.2.0"')
    expect(existsSync(showcaseI18nEntryPath)).toBe(true)
    expect(existsSync(showcaseI18nMessagesPath)).toBe(true)
    expect(showcaseI18nEntry).toContain("import { createFintI18n } from '@feugene/fint-i18n/core'")
    expect(showcaseI18nEntry).toContain("import { installI18n } from '@feugene/fint-i18n/vue'")
    expect(showcaseI18nEntry).toContain("import { GRANULARITY_I18N_BLOCK } from '@feugene/granularity/i18n'")
    expect(showcaseI18nEntry).toContain('SHOWCASE_I18N_BLOCK')
    expect(showcaseI18nEntry).toContain('showcaseLocaleLoaders')
    expect(showcaseI18nEntry).toContain('registerBlocks([SHOWCASE_I18N_BLOCK, GRANULARITY_I18N_BLOCK])')
    expect(showcaseI18nMessagesEntry).toContain("export const SHOWCASE_I18N_BLOCK = 'showcase'")
    expect(showcaseI18nMessagesEntry).toContain("'./locales/en/showcase.json'")
    expect(showcaseI18nMessagesEntry).toContain("'./locales/ru/showcase.json'")
  })

  it('использует router shell и root public API пакета в layout-компоненте', () => {
    expect(showcaseAppEntry).toContain('<RouterView />')
    expect(showcaseLayoutEntry).toContain("from '@feugene/granularity'")
    expect(showcaseLayoutEntry).not.toContain('@feugene/granularity/components/')
  })

  it('сканирует только исходники showcase и включает пакетный Uno preset через package exports', () => {
    expect(showcaseGranularOptions.providers.length).toBeGreaterThan(0)
    expect(showcaseGranularOptions.components).toBe('all')
    expect(showcaseGranularOptions.themes).toEqual({ names: ['light', 'dark'] })
    expect(showcaseUnoConfig).toContain("from '@feugene/unocss-preset-granular/node'")
    expect(showcaseUnoConfig).toContain("presetGranularNode")
    expect(showcaseUnoConfig).toContain("import granularityProvider from '@feugene/granularity/granular-provider/node'")
    expect(showcaseUnoConfig).toContain('providers: [granularityProvider]')
    expect(showcaseUnoConfig).toContain("names: ['light', 'dark']")
  })
})