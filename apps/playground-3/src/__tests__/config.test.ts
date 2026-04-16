import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground3GranularityChunkGroup,
  playground3VueChunkGroup,
} from '../../vite.config'

const playground3MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground3AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

describe('playground-3 config', () => {
  it('выделяет vue и granularity в отдельные чанки', () => {
    expect(playground3VueChunkGroup.name).toBe('vue')
    expect(playground3GranularityChunkGroup.name).toBe('granularity')
    expect(playground3VueChunkGroup.priority).toBeGreaterThan(playground3GranularityChunkGroup.priority)
  })

  it('подключает только CSS конкретного компонента', () => {
    expect(playground3AppEntry).toContain("import { DsButton } from '@feugene/granularity/components/DsButton'")
    expect(playground3MainEntry).toContain("import '@unocss/reset/tailwind-compat.css'")
    expect(playground3MainEntry).toContain("import '@feugene/granularity/components/DsButton/styles.css'")
    expect(playground3MainEntry).not.toContain("import '@feugene/granularity/styles.css'")
    expect(playground3MainEntry).not.toContain("import '@feugene/granularity/styles/tokens.css'")
    expect(playground3MainEntry).not.toContain("import '@feugene/granularity/styles/base.css'")
    expect(playground3MainEntry).not.toContain("import '@feugene/granularity/styles/themes/light.css'")
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground3AppEntry).toContain('Примерный размер bundle')
    expect(playground3AppEntry).toContain('data-bundle-group="vue"')
    expect(playground3AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground3AppEntry).toContain('data-bundle-group="reset"')
    expect(playground3AppEntry).toContain('data-bundle-group="app"')
    expect(playground3AppEntry).toContain('gzip ~1.0 kB')
    expect(playground3AppEntry).toContain('gzip ~23.8 kB')
  })
})
