import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground6ContentIncludes,
  playground6GranularityLayer,
  playground6PreflightCss,
} from '../../uno.config'
import {
  playground6GranularityChunkGroup,
  playground6VueChunkGroup,
} from '../../vite.config'

const playground6MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground6AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

const playground6UnoConfig = readFileSync(
  fileURLToPath(new URL('../../uno.config.ts', import.meta.url)),
  'utf8',
)

describe('playground-6 config', () => {
  it('выделяет vue и granularity в отдельные чанки', () => {
    expect(playground6VueChunkGroup.name).toBe('vue')
    expect(playground6GranularityChunkGroup.name).toBe('granularity')
    expect(playground6VueChunkGroup.priority).toBeGreaterThan(playground6GranularityChunkGroup.priority)
  })

  it('использует pure preset и ручные css preflights', () => {
    expect(playground6UnoConfig).toContain("import {\n  createGranularityCssPreflights,\n  presetGranularity,\n} from '@feugene/granularity/uno'")
    expect(playground6UnoConfig).not.toContain('presetGranularityNode')
    expect(playground6UnoConfig).toContain('layer: playground6GranularityLayer')
    expect(playground6UnoConfig).toContain('createGranularityCssPreflights([playground6PreflightCss], playground6GranularityLayer)')
    expect(playground6GranularityLayer).toBe('granularity')
    expect(playground6PreflightCss).toContain('--primary: #db2777;')
    expect(playground6ContentIncludes.some(re => re.test('/repo/apps/playground-6/src/App.vue'))).toBe(true)
    expect(playground6MainEntry).toContain('await Promise.all([')
    expect(playground6MainEntry).toContain("import('./reset')")
    expect(playground6MainEntry).toContain("import('./granularity')")
    expect(playground6MainEntry).toContain("import('./app-styles')")
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground6AppEntry).toContain('Примерный размер bundle')
    expect(playground6AppEntry).toContain('data-bundle-group="vue"')
    expect(playground6AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground6AppEntry).toContain('data-bundle-group="reset"')
    expect(playground6AppEntry).toContain('data-bundle-group="app"')
    expect(playground6AppEntry).toContain('gzip ~23.6 kB')
    expect(playground6AppEntry).toContain('gzip ~0.4 kB')
    expect(playground6AppEntry).toContain('gzip ~1.0 kB')
  })
})
