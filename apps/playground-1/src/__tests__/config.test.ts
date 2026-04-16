import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground1GranularityDistDir,
  playground1GranularityChunkGroup,
  playground1VueChunkGroup,
} from '../../vite.config'

const playground1MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground1AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

describe('playground-1 config', () => {
  it('выделяет vue и granularity в отдельные чанки', () => {
    expect(playground1VueChunkGroup.name).toBe('vue')
    expect(playground1GranularityChunkGroup.name).toBe('granularity')
    expect(playground1VueChunkGroup.priority).toBeGreaterThan(playground1GranularityChunkGroup.priority)
    expect(playground1VueChunkGroup.test.test('/repo/node_modules/vue/dist/vue.runtime.esm-bundler.js')).toBe(true)
    expect(playground1GranularityChunkGroup.test(`${playground1GranularityDistDir}index.js`)).toBe(true)
  })

  it('подключает root barrel и общий CSS пакета', () => {
    expect(playground1AppEntry).toContain("import {DsButton, DsInput} from '@feugene/granularity'")
    expect(playground1MainEntry).toContain("import '@unocss/reset/tailwind-compat.css'")
    expect(playground1MainEntry).toContain("import '@feugene/granularity/styles.css'")
    expect(playground1MainEntry).not.toContain("import '@feugene/granularity/styles/tokens.css'")
    expect(playground1MainEntry).not.toContain("import '@feugene/granularity/styles/base.css'")
    expect(playground1MainEntry).not.toContain("import '@feugene/granularity/styles/themes/light.css'")
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground1AppEntry).toContain('Примерный размер bundle')
    expect(playground1AppEntry).toContain('data-bundle-group="vue"')
    expect(playground1AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground1AppEntry).toContain('data-bundle-group="reset"')
    expect(playground1AppEntry).toContain('data-bundle-group="app"')
    expect(playground1AppEntry).toContain('gzip ~1.0 kB')
    expect(playground1AppEntry).toContain('gzip ~23.6 kB')
  })
})
