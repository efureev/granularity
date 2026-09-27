import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import distPlaygroundGranumConfig, { playgroundComponents } from '../../granum.config'
import {
  playgroundBuildAnalyzeMode,
  playgroundBuildVisualizerConfig,
  playgroundGranularityButtonCssEntry,
  playgroundGranularityChunkGroup,
  playgroundGranularityEntry,
  playgroundGranularityFoundationCssEntry,
  playgroundGranularityStylesCssEntry,
  playgroundVueChunkGroup,
} from '../../vite.config'

const read = (relativePath: string): string => readFileSync(
  fileURLToPath(new URL(relativePath, import.meta.url)),
  'utf8',
)

const distPlaygroundPackageJson = read('../../package.json')
const distPlaygroundMainEntry = read('../main.ts')
const distPlaygroundAppSubpathEntry = read('../AppSubpath.vue')
const distPlaygroundViteConfig = read('../../vite.config.ts')
const distPlaygroundGranumConfigSource = read('../../granum.config.ts')

describe('playground config', () => {
  it('подключает пакет из собранного dist', () => {
    expect(playgroundGranularityEntry).toMatch(/\/packages\/granularity\/dist\/index\.js$/)
    expect(playgroundGranularityFoundationCssEntry).toMatch(/\/packages\/granularity\/dist\/foundation\.css$/)
    expect(playgroundGranularityStylesCssEntry).toMatch(/\/packages\/granularity\/dist\/styles\.css$/)
    expect(playgroundGranularityButtonCssEntry).toMatch(/\/packages\/granularity\/dist\/components\/GrButton\/styles\.css$/)
  })

  it('задаёт более высокий приоритет для vue chunk, чем для granularity chunk', () => {
    expect(playgroundVueChunkGroup.name).toBe('vue')
    expect(playgroundVueChunkGroup.priority).toBeGreaterThan(playgroundGranularityChunkGroup.priority)
    expect(playgroundVueChunkGroup.test.test('/repo/node_modules/vue/dist/vue.runtime.esm-bundler.js')).toBe(true)
    expect(playgroundVueChunkGroup.test.test('/repo/node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js')).toBe(true)
    expect(playgroundGranularityChunkGroup.test(playgroundGranularityEntry)).toBe(true)
  })

  it('поддерживает analyze-режим для visualizer-отчёта сборки', () => {
    expect(distPlaygroundPackageJson).toContain('"build:analyze": "vite build --mode analyze"')
    expect(playgroundBuildAnalyzeMode).toBe('analyze')
    expect(playgroundBuildVisualizerConfig).toEqual({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    })
  })

  it('подключает провайдера манифестом и выбирает компоненты, которые стенд рендерит', () => {
    // Имя пакета, а не объект провайдера: манифест ищется через `exports`, и
    // приложению незачем исполнять код пакета ради резолюции. Скана
    // `node_modules` в granum нет вовсе, а вместе с ним ушёл целый класс
    // промахов «правило не нашлось, потому что директорию не просканировали».
    expect(distPlaygroundGranumConfig.providers).toEqual(['@feugene/granularity'])
    expect(distPlaygroundGranumConfig.components).toEqual([
      { provider: '@feugene/granularity', names: [...playgroundComponents] },
    ])

    // Список обязан покрывать всё, что стенд рендерит: пока в нём был один
    // `GrButton`, окно `GrModal` рисовалось без панели.
    for (const name of ['GrButton', 'GrDialog', 'GrModal', 'GrPromptDialog', 'GrSelect'])
      expect(playgroundComponents, `${name} не объявлен в playgroundComponents`).toContain(name)

    // Без `appSources` классы разметки стенда не попали бы в CSS.
    expect(distPlaygroundGranumConfig.appSources).toEqual({ dirs: ['src'] })
  })

  it('движок задан инстансом и говорит на словаре пакета', () => {
    const engine = distPlaygroundGranumConfig.engine
    expect(typeof engine.generate).toBe('function')
    // Диалект тот же, что объявил пакет: классы берутся из манифеста без
    // пересчёта, и ни один из них не теряется.
    expect(engine.dialect).toBe('unocss/preset-wind3+granum@66')
    expect(engine.vocabulary).toMatch(/^fnv64-[0-9a-f]{16}$/)
    expect(distPlaygroundGranumConfigSource).toContain(`import { windEngine } from '@feugene/granum-engine-wind'`)
  })

  it('показывает в main.ts четыре актуальных сценария подключения и активирует granum-сценарий', () => {
    expect(distPlaygroundMainEntry).toContain(`// import '@granularity-foundation'`)
    expect(distPlaygroundMainEntry).toContain(`// import '@granularity-styles'`)
    expect(distPlaygroundMainEntry).toContain(`// import '@granularity-button-css'`)
    expect(distPlaygroundMainEntry).toContain('// Вариант 4: подключение через granum.')
    expect(distPlaygroundMainEntry).toContain(`import 'virtual:granum.css'`)

    // Тема стенда — нелейерный CSS: по правилам каскада она выигрывает у любого
    // `@layer`, и порядок импортов на это больше не влияет.
    expect(distPlaygroundMainEntry).toContain(`import './styles/light-app.css'`)
    expect(distPlaygroundMainEntry).not.toContain('setThemes(')
  })

  it('импортирует GrButton через component subpath export', () => {
    expect(distPlaygroundAppSubpathEntry).toContain('@feugene/granularity/components/GrButton')
    expect(distPlaygroundAppSubpathEntry).not.toContain(`from '@feugene/granularity'`)
  })

  it('от пресета v1 в стенде не осталось ни строки', () => {
    for (const source of [distPlaygroundViteConfig, distPlaygroundGranumConfigSource, distPlaygroundMainEntry]) {
      expect(source).not.toContain('unocss-preset-granular')
      expect(source).not.toContain('presetGranularNode')
      expect(source).not.toContain('virtual:uno')
    }
    expect(distPlaygroundViteConfig).toContain('granum(granumConfig)')
    // Иконки приезжают компонентами через `unplugin-icons`; пресет иконок
    // UnoCSS ушёл вместе с ним, и ни одна строка разметки его не использовала.
    expect(distPlaygroundViteConfig).toContain('Icons({')
  })
})
