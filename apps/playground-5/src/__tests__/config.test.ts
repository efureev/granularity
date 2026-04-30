import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground5ContentIncludes,
  playground5GranularityLayer,
} from '../../uno.config'
import {
  playground5GranularityChunkGroup,
  playground5ResetChunkGroup,
  playground5VueChunkGroup,
} from '../../vite.config'

const playground5MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground5AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

const playground5UnoConfig = readFileSync(
  fileURLToPath(new URL('../../uno.config.ts', import.meta.url)),
  'utf8',
)

const playground5ViteEnv = readFileSync(
  fileURLToPath(new URL('../../vite-env.d.ts', import.meta.url)),
  'utf8',
)

const playground5Tsconfig = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../tsconfig.json', import.meta.url)),
  'utf8',
)) as {
  compilerOptions?: {
    paths?: Record<string, string[]>
  }
}

describe('playground-5 config', () => {
  it('выделяет vue, reset и granularity в отдельные чанки', () => {
    expect(playground5VueChunkGroup.name).toBe('vue')
    expect(playground5ResetChunkGroup.name).toBe('reset')
    expect(playground5GranularityChunkGroup.name).toBe('granularity')
    expect(playground5VueChunkGroup.priority).toBeGreaterThan(playground5GranularityChunkGroup.priority)
    expect(playground5GranularityChunkGroup.priority).toBeGreaterThan(playground5ResetChunkGroup.priority)
  })

  it('подключает node-only preset и сканирует только свои исходники', () => {
    expect(playground5UnoConfig).toContain("from '@feugene/unocss-preset-granular/node'")
    expect(playground5UnoConfig).toContain('presetGranularNode')
    expect(playground5UnoConfig).toContain('granularContent')
    expect(playground5UnoConfig).toContain("import granularityProvider from '@feugene/granularity/granular-provider/node'")
    expect(playground5UnoConfig).toContain('providers: [granularityProvider]')
    expect(playground5UnoConfig).toContain('presetGranularNode(granularOptions)')
    expect(playground5UnoConfig).toContain('granularContent(granularOptions)')
    expect(playground5UnoConfig).toContain('layer: playground5GranularityLayer')
    expect(playground5GranularityLayer).toBe('granular')
    expect(playground5ContentIncludes.some(re => re.test('/repo/apps/playground-5/src/App.vue'))).toBe(true)
    expect(playground5ContentIncludes.some(re => re.test('/repo/apps/playground-6/src/App.vue'))).toBe(false)
    expect(playground5MainEntry).toContain('await Promise.all([')
    expect(playground5MainEntry).toContain("import('./reset')")
    expect(playground5MainEntry).toContain("import('./granularity')")
    expect(playground5MainEntry).toContain("import('./app-styles')")
  })

  it('мапит локальные granularity imports на source-entry для IDE и TS в monorepo', () => {
    expect(playground5Tsconfig.compilerOptions?.paths).toMatchObject({
      '@feugene/granularity': ['../../packages/granularity/src/index.ts'],
      '@feugene/granularity/components/*': ['../../packages/granularity/src/components/*/index.ts'],
      '@feugene/granularity/granular-provider/node': ['../../packages/granularity/src/granular-provider/node.ts'],
      '@feugene/unocss-preset-granular/node': ['../../packages/unocss-preset-granular/src/node.ts'],
    })
    expect(playground5ViteEnv).toContain('/// <reference types="unplugin-icons/types/vue" />')
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground5AppEntry).toContain('Примерный размер bundle')
    expect(playground5AppEntry).toContain('data-bundle-group="vue"')
    expect(playground5AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground5AppEntry).toContain('data-bundle-group="reset"')
    expect(playground5AppEntry).toContain('data-bundle-group="app"')
    expect(playground5AppEntry).toContain('gzip ~23.6 kB')
    expect(playground5AppEntry).toContain('gzip ~1.6 kB')
    expect(playground5AppEntry).toContain('gzip ~1.0 kB')
  })
})
