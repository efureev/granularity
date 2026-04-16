import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground2GranularityDistDir,
  playground2GranularityChunkGroup,
  playground2VueChunkGroup,
} from '../../vite.config'

const playground2MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground2AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

describe('playground-2 config', () => {
  it('выделяет vue и granularity в отдельные чанки', () => {
    expect(playground2VueChunkGroup.name).toBe('vue')
    expect(playground2GranularityChunkGroup.name).toBe('granularity')
    expect(playground2VueChunkGroup.priority).toBeGreaterThan(playground2GranularityChunkGroup.priority)
    expect(playground2GranularityChunkGroup.test(`${playground2GranularityDistDir}components/DsButton/index.js`)).toBe(true)
  })

  it('импортирует кнопку только через component subpath', () => {
    expect(playground2AppEntry).toContain("import { DsButton } from '@feugene/granularity/components/DsButton'")
    expect(playground2AppEntry).not.toContain("from '@feugene/granularity'")
    expect(playground2MainEntry).toContain("import '@unocss/reset/tailwind-compat.css'")
    expect(playground2MainEntry).toContain("import '@feugene/granularity/styles.css'")
    expect(playground2MainEntry).not.toContain("import '@feugene/granularity/styles/tokens.css'")
    expect(playground2MainEntry).not.toContain("import '@feugene/granularity/styles/base.css'")
    expect(playground2MainEntry).not.toContain("import '@feugene/granularity/styles/themes/light.css'")
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground2AppEntry).toContain('Примерный размер bundle')
    expect(playground2AppEntry).toContain('data-bundle-group="vue"')
    expect(playground2AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground2AppEntry).toContain('data-bundle-group="reset"')
    expect(playground2AppEntry).toContain('data-bundle-group="app"')
    expect(playground2AppEntry).toContain('gzip ~1.0 kB')
    expect(playground2AppEntry).toContain('gzip ~23.6 kB')
  })
})
