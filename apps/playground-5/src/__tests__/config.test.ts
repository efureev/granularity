import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import playground5GranumConfig, {
  playground5GranularityComponents,
} from '../../granum.config'
import {
  playground5GranularityChunkGroup,
  playground5ResetChunkGroup,
  playground5VueChunkGroup,
} from '../../vite.config'

const read = (relativePath: string): string => readFileSync(
  fileURLToPath(new URL(relativePath, import.meta.url)),
  'utf8',
)

const playground5MainEntry = read('../main.ts')
const playground5CssEntry = read('../granularity.ts')
const playground5AppEntry = read('../App.vue')
const playground5ViteConfig = read('../../vite.config.ts')
const playground5ViteEnv = read('../../vite-env.d.ts')

const playground5Tsconfig = JSON.parse(read('../../tsconfig.json')) as {
  compilerOptions?: { paths?: Record<string, string[]> }
}

describe('playground-5 config', () => {
  it('выделяет vue, reset и granularity в отдельные чанки', () => {
    expect(playground5VueChunkGroup.name).toBe('vue')
    expect(playground5ResetChunkGroup.name).toBe('reset')
    expect(playground5GranularityChunkGroup.name).toBe('granularity')
    expect(playground5VueChunkGroup.priority).toBeGreaterThan(playground5GranularityChunkGroup.priority)
    expect(playground5GranularityChunkGroup.priority).toBeGreaterThan(playground5ResetChunkGroup.priority)
  })

  it('подключает провайдера манифестом и выбирает ровно один компонент', () => {
    // Имя пакета, а не объект провайдера: манифест ищется через `exports`, и
    // приложению незачем исполнять код пакета ради резолюции.
    expect(playground5GranumConfig.providers).toEqual(['@feugene/granularity'])
    expect(playground5GranularityComponents).toEqual(['GrButton'])
    expect(playground5GranumConfig.components).toEqual([
      { provider: '@feugene/granularity', names: ['GrButton'] },
    ])
    // Без `appSources` классы разметки приложения не попали бы в CSS: granum
    // берёт их отсюда, а классы компонента — из манифеста.
    expect(playground5GranumConfig.appSources).toEqual({ dirs: ['src'] })
  })

  it('CSS приезжает одним виртуальным модулем плагина', () => {
    expect(playground5ViteConfig).toContain("import { granum } from '@feugene/granum/vite'")
    expect(playground5ViteConfig).toContain('granum(granumConfig)')
    expect(playground5CssEntry).toContain(`import 'virtual:granum.css'`)
    expect(playground5ViteEnv).toContain(`declare module 'virtual:granum.css'`)
    // Слои каскада внутри одного ассета — отдельной entry под app-CSS больше нет.
    expect(playground5MainEntry).toContain('await Promise.all([')
    expect(playground5MainEntry).toContain(`import('./reset')`)
    expect(playground5MainEntry).toContain(`import('./granularity')`)
    expect(playground5MainEntry).not.toContain('app-styles')
  })

  it('от пресета v1 в приложении не осталось ни строки', () => {
    for (const source of [playground5ViteConfig, playground5MainEntry, playground5CssEntry, playground5AppEntry]) {
      expect(source).not.toContain('unocss-preset-granular')
      expect(source).not.toContain('virtual:uno')
    }
    expect(playground5ViteEnv).toContain('/// <reference types="unplugin-icons/types/vue" />')
  })

  it('мапит локальные granularity imports на source-entry для IDE и TS в monorepo', () => {
    // Пути пресета убраны вместе с ним; `@feugene/granum` резолвится через
    // node_modules по `exports`, отдельной карты ему не нужно.
    expect(playground5Tsconfig.compilerOptions?.paths).toEqual({
      '@feugene/granularity': ['../../packages/granularity/src/index.ts'],
      '@feugene/granularity/components/*': ['../../packages/granularity/src/components/*/index.ts'],
      '@feugene/granularity/granular-provider': ['../../packages/granularity/src/granular-provider/index.ts'],
      '@feugene/granularity/granular-provider/node': ['../../packages/granularity/src/granular-provider/node.ts'],
    })
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground5AppEntry).toContain('Примерный размер bundle')
    expect(playground5AppEntry).toContain('data-bundle-group="vue"')
    expect(playground5AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground5AppEntry).toContain('data-bundle-group="reset"')
    expect(playground5AppEntry).toContain('data-bundle-group="app"')
    expect(playground5AppEntry).toContain('gzip ~24.2 kB')
    expect(playground5AppEntry).toContain('gzip ~5.9 kB')
    expect(playground5AppEntry).toContain('gzip ~1.0 kB')
  })
})
