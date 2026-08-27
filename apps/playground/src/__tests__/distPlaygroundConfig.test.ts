import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import distPlaygroundUnoConfigDefault from '../../uno.config'
import {
  playgroundBuildAnalyzeMode,
  playgroundBuildVisualizerConfig,
  playgroundGranularityChunkGroup,
  playgroundGranularityFoundationCssEntry,
  playgroundGranularityStylesCssEntry,
  playgroundGranularityButtonCssEntry,
  playgroundGranularityEntry,
  playgroundVueChunkGroup,
} from '../../vite.config'

// `granularContent(options)` возвращает `{ filesystem, pipeline: { include } }`.
// Раскрываем эту структуру из дефолтного экспорта конфига, чтобы проверить,
// какие исходники реально сканирует playground.
const distPlaygroundContent = (distPlaygroundUnoConfigDefault as {
  content: { filesystem: string[]; pipeline: { include: RegExp[] } }
}).content
const distPlaygroundContentIncludes = distPlaygroundContent.pipeline.include

// Директория выбранного компонента (`GrButton`) в собранном `dist/` —
// вычисляем из filesystem-glob'а, чтобы проверки опирались на реальный
// абсолютный путь, а не на хардкод.
const distPlaygroundGrButtonDir = distPlaygroundContent.filesystem[0].replace(/\/\*\*.*$/, '')
const distPlaygroundGrButtonFile = `${distPlaygroundGrButtonDir}/index.js`
const distPlaygroundGrModalFile = `${distPlaygroundGrButtonDir.replace(/GrButton$/, 'GrModal')}/index.js`

const distPlaygroundPackageJson = readFileSync(
  fileURLToPath(new URL('../../package.json', import.meta.url)),
  'utf8',
)

const distPlaygroundMainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const distPlaygroundAppUnoEntry = readFileSync(
  fileURLToPath(new URL('../AppUno.vue', import.meta.url)),
  'utf8',
)

const distPlaygroundUnoConfig = readFileSync(
  fileURLToPath(new URL('../../uno.config.ts', import.meta.url)),
  'utf8',
)

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

  it('сканирует исходники приложения и dist каждого используемого компонента, не подхватывая лишние артефакты', () => {
    // Скан обязан покрывать **все** компоненты стенда, а не только кнопку:
    // пока в списке был один `GrButton`, у `GrModal` не находилось правил для
    // `shadow-*` и `rounded-*`, и окно рисовалось без панели.
    for (const name of ['GrButton', 'GrModal', 'GrSelect', 'GrPromptDialog']) {
      expect(
        distPlaygroundContent.filesystem.some(glob => glob.includes(`/packages/granularity/dist/components/${name}/`)),
        `нет скана для ${name}`,
      ).toBe(true)
    }

    // Шаблоны исходников приложения (`.vue`) подхватываются стандартным фильтром.
    expect(distPlaygroundContentIncludes.some(re => re.test('/repo/apps/playground/src/App.vue'))).toBe(true)

    // Таргетированный include разрешает директории выбранных компонентов и не
    // распахивается на произвольные dist-артефакты.
    expect(distPlaygroundContentIncludes.some(re => re.test(distPlaygroundGrButtonFile))).toBe(true)
    expect(distPlaygroundContentIncludes.some(re => re.test(distPlaygroundGrModalFile))).toBe(true)
    expect(distPlaygroundContentIncludes.some(re => re.test('/repo/dist/index.js'))).toBe(false)
  })

  it('показывает в main.ts четыре актуальных сценария подключения и активирует preset-сценарий', () => {
    expect(distPlaygroundMainEntry).toContain("// import '@granularity-foundation'")
    expect(distPlaygroundMainEntry).toContain("// import '@granularity-styles'")
    expect(distPlaygroundMainEntry).toContain("// import '@granularity-button-css'")
    expect(distPlaygroundMainEntry).toContain('// Вариант 4: granular-подключение через `presetGranularNode`.')

    // Тема приложения — после `virtual:uno.css`: базовые токены пакета
    // эмитятся последними внутри слоя `granular`, и файл, подключённый раньше,
    // они бы перебили.
    // Ищем именно активный импорт: в сценариях 1–3 тот же путь стоит
    // закомментированным и встречается раньше.
    expect(distPlaygroundMainEntry.indexOf("\nimport './styles/light-app.css'"))
      .toBeGreaterThan(distPlaygroundMainEntry.indexOf("import 'virtual:uno.css'"))
    expect(distPlaygroundMainEntry).not.toContain('setThemes(')
    expect(distPlaygroundMainEntry).not.toContain('../../legacy/playground/src/App.vue')
  })

  it('импортирует GrButton через component subpath export', () => {
    expect(distPlaygroundAppUnoEntry).toContain("@feugene/granularity/components/GrButton")
    expect(distPlaygroundAppUnoEntry).not.toContain("from '@feugene/granularity'")
  })

  it('подключает node-only uno adapter из package exports и задаёт темы на этапе сборки', () => {
    expect(distPlaygroundUnoConfig).toContain("from '@feugene/unocss-preset-granular/node'")
    expect(distPlaygroundUnoConfig).toContain('presetGranularNode')
    expect(distPlaygroundUnoConfig).toContain('granularContent')
    expect(distPlaygroundUnoConfig).toContain("import granularityProvider from '@feugene/granularity/granular-provider/node'")
    expect(distPlaygroundUnoConfig).toContain('presetGranularNode(granularOptions)')
    expect(distPlaygroundUnoConfig).toContain('granularContent(granularOptions)')
    expect(distPlaygroundUnoConfig).toContain('providers: [granularityProvider]')
    expect(distPlaygroundUnoConfig).toContain("{provider: '@feugene/granularity', names: [...granularPresetComponents]}")

    // Список компонентов пресета обязан покрывать то, что стенд рендерит.
    for (const name of ['GrButton', 'GrDialog', 'GrModal', 'GrPromptDialog', 'GrSelect'])
      expect(distPlaygroundUnoConfig, `${name} не объявлен в granularPresetComponents`).toContain(`'${name}'`)

    // `tokensFile` подменяет `tokens.css` провайдера целиком — вместе со шкалой
    // радиусов и всем, чего нет в файле приложения. Тема стенда подключается
    // импортом в `main.ts`, после `virtual:uno.css`.
    // Ключа, а не упоминания: в комментарии рядом объяснено, почему его нет.
    expect(distPlaygroundUnoConfig).not.toContain('tokensFile:')
  })
})