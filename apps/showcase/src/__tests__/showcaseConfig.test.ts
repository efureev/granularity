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

/**
 * Пробелы внутри `{ … }` схлопываются вместе с переносами: гейт сторожит состав
 * входа, а не его форматирование, и переставший подходить отступ обязан
 * оставлять его зелёным.
 */
const normalizedShowcaseMainEntry = showcaseMainEntry
  .replace(/\s+/g, ' ')
  .replace(/\{ /g, '{')
  .replace(/ \}/g, '}')

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
    expect(showcasePackageJson).toContain('"build": "yarn generate:api && yarn generate:search && vite build && yarn verify:locales"')
    // Проверка состава локалей идёт после сборки и в самой сборке: иначе её
    // забудут запустить, а разъехавшийся импорт заметен только по размеру dist.
    expect(showcasePackageJson).toContain('"verify:locales": "node ./checks/verify-locales.mjs"')
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
    expect(showcaseMainEntry).toContain('import \'@unocss/reset/tailwind-compat.css\'')
    expect(showcaseMainEntry).toContain('import \'virtual:uno.css\'')
    expect(normalizedShowcaseMainEntry).toContain('import {initThemeEarly} from \'@feugene/granularity\'')
    expect(normalizedShowcaseMainEntry).toContain('import {setupShowcaseI18n} from \'./i18n\'')
    expect(normalizedShowcaseMainEntry).toContain('import {router} from \'./app/router\'')
    expect(normalizedShowcaseMainEntry).toContain('initThemeEarly()')
    expect(normalizedShowcaseMainEntry).toContain('const i18n = await setupShowcaseI18n()')
    expect(normalizedShowcaseMainEntry).toContain('.use(i18n)')
    expect(normalizedShowcaseMainEntry).toContain('.use(router)')
    expect(showcaseMainEntry).not.toContain('@feugene/granularity/styles.css')
    expect(showcaseMainEntry).not.toContain('legacy')
  })

  it('подключает fint-i18n и отдельные app-level locale loaders для showcase', () => {
    expect(existsSync(showcaseI18nEntryPath)).toBe(true)
    expect(existsSync(showcaseI18nMessagesPath)).toBe(true)
    expect(showcaseI18nEntry).toContain('import { createFintI18n } from \'@feugene/fint-i18n/core\'')
    expect(showcaseI18nEntry).toContain('import { installI18n } from \'@feugene/fint-i18n/vue\'')
    expect(showcaseI18nEntry).toContain('GRANULARITY_I18N_BLOCK')
    expect(showcaseI18nEntry).toContain('SHOWCASE_I18N_BLOCK')
    expect(showcaseI18nEntry).toContain('showcaseLocaleLoaders')
    // Словарь каждого companion-пакета — отдельной строкой: без него календарь и
    // пикеры показывают английский fallback на любом языке витрины, и заметить
    // это можно было только глазами.
    //
    // Именно ИМЕНОВАННЫЕ локали, а не агрегат `<pkg>/i18n/all`: переключатель
    // предлагает два языка, а агрегат тянет все, что есть у пакета — лишние уезжают
    // в `dist` ленивыми чанками, которых никто не запрашивает. Состав `dist` сторожит
    // `checks/verify-locales.mjs`, здесь держится сама форма импорта.
    for (const pkg of ['chrono', 'charts', 'dashboard', 'forms-schema', 'editor', 'media']) {
      expect(showcaseI18nEntry).toContain(`from '@feugene/granularity-${pkg}/i18n'`)
      expect(showcaseI18nEntry).not.toContain(`from '@feugene/granularity-${pkg}/i18n/all'`)
    }
    expect(showcaseI18nEntry).not.toContain('from \'@feugene/granularity/i18n/all\'')
    expect(showcaseI18nEntry).toContain('registerBlocks([SHOWCASE_I18N_BLOCK, GRANULARITY_I18N_BLOCK, GR_CHRONO_I18N_BLOCK, GR_CHARTS_I18N_BLOCK, GR_DASHBOARD_I18N_BLOCK, GR_FORMS_SCHEMA_I18N_BLOCK, GR_EDITOR_I18N_BLOCK, GR_MEDIA_I18N_BLOCK, GR_CODE_I18N_BLOCK])')
    expect(showcaseI18nMessagesEntry).toContain('export const SHOWCASE_I18N_BLOCK = \'showcase\'')
    expect(showcaseI18nMessagesEntry).toContain('\'./locales/en/showcase.json\'')
    expect(showcaseI18nMessagesEntry).toContain('\'./locales/ru/showcase.json\'')
  })

  it('использует router shell и root public API пакета в layout-компоненте', () => {
    expect(showcaseAppEntry).toContain('<RouterView />')
    expect(showcaseLayoutEntry).toContain('from \'@feugene/granularity\'')
    expect(showcaseLayoutEntry).not.toContain('@feugene/granularity/components/')
  })

  it('сканирует только исходники showcase и включает пакетный Uno preset через package exports', () => {
    // Незарегистрированный провайдер — тихий дефект: сборка проходит, а
    // SFC-чанки его компонентов не сканируются и классы выпадают из CSS.
    expect(showcaseGranularOptions.providers.map(provider => provider.id)).toEqual([
      '@feugene/granularity',
      '@feugene/granularity-chrono',
      '@feugene/granularity-charts',
      '@feugene/granularity-dashboard',
      '@feugene/granularity-forms-schema',
      '@feugene/granularity-editor',
      '@feugene/granularity-media',
      '@feugene/granularity-code',
    ])
    expect(showcaseGranularOptions.components).toBe('all')
    expect(showcaseGranularOptions.themes).toEqual({ names: ['light', 'dark'] })
    expect(showcaseUnoConfig).toContain('from \'@feugene/unocss-preset-granular/node\'')
    expect(showcaseUnoConfig).toContain('presetGranularNode')
    expect(showcaseUnoConfig).toContain('import granularityProvider from \'@feugene/granularity/granular-provider/node\'')
    expect(showcaseUnoConfig).toContain('import chronoProvider from \'@feugene/granularity-chrono/granular-provider/node\'')
    expect(showcaseUnoConfig).toContain('import chartsProvider from \'@feugene/granularity-charts/granular-provider/node\'')
    expect(showcaseUnoConfig).toContain('import dashboardProvider from \'@feugene/granularity-dashboard/granular-provider/node\'')
    expect(showcaseUnoConfig).toContain('import formsSchemaProvider from \'@feugene/granularity-forms-schema/granular-provider/node\'')
    expect(showcaseUnoConfig).toContain('names: [\'light\', \'dark\']')
  })
})
