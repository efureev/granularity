import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  playground4GranularityChunkGroup,
  playground4VueChunkGroup,
} from '../../vite.config'

const playground4MainEntry = readFileSync(
  fileURLToPath(new URL('../main.ts', import.meta.url)),
  'utf8',
)

const playground4AppEntry = readFileSync(
  fileURLToPath(new URL('../App.vue', import.meta.url)),
  'utf8',
)

describe('playground-4 config', () => {
  it('выделяет vue и granularity в отдельные чанки', () => {
    expect(playground4VueChunkGroup.name).toBe('vue')
    expect(playground4GranularityChunkGroup.name).toBe('granularity')
    expect(playground4VueChunkGroup.priority).toBeGreaterThan(playground4GranularityChunkGroup.priority)
  })

  it('сочетает subpath JS с общим CSS пакета', () => {
    expect(playground4AppEntry).toContain("import { DsButton } from '@feugene/granularity/components/DsButton'")
    expect(playground4AppEntry).toContain("import { DsInput } from '@feugene/granularity/components/DsInput'")
    expect(playground4MainEntry).toContain("import '@unocss/reset/tailwind-compat.css'")
    expect(playground4MainEntry).toContain("import '@feugene/granularity/styles.css'")
    expect(playground4MainEntry).not.toContain("import '@feugene/granularity/styles/tokens.css'")
    expect(playground4MainEntry).not.toContain("import '@feugene/granularity/styles/base.css'")
    expect(playground4MainEntry).not.toContain("import '@feugene/granularity/styles/themes/light.css'")
  })

  it('показывает на странице примерные размеры bundle', () => {
    expect(playground4AppEntry).toContain('Примерный размер bundle')
    expect(playground4AppEntry).toContain('data-bundle-group="vue"')
    expect(playground4AppEntry).toContain('data-bundle-group="granularity"')
    expect(playground4AppEntry).toContain('data-bundle-group="reset"')
    expect(playground4AppEntry).toContain('data-bundle-group="app"')
    expect(playground4AppEntry).toContain('gzip ~1.0 kB')
    expect(playground4AppEntry).toContain('gzip ~23.6 kB')
  })
})
