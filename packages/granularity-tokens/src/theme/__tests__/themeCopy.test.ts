import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { loadTheme } from '../node'
import { copyGranularityTheme, stripComputedFallbacks } from '../../../scripts/theme-copy.mjs'

const slateDir = resolve(process.cwd(), 'themes/slate')

describe('theme:copy — копия темы для granularity', () => {
  const dest = join(mkdtempSync(join(tmpdir(), 'gr-theme-copy-')), 'stone')
  const result = copyGranularityTheme({ source: 'slate', id: 'stone', dest, title: 'Камень', version: '1.0.0' })
  const theme = JSON.parse(readFileSync(join(dest, 'theme.json'), 'utf8')) as { modes: Record<string, object>, extends?: string }

  it('посчитанные фолбэки в копию не идут: их считает сборка темы', () => {
    expect(Object.values(theme.modes).every(mode => !('fallbacks' in mode))).toBe(true)
  })

  it('фолбэки, пришедшие с раскрытым предком, снимаются', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'gr-theme-copy-')), 'kept')
    cpSync(slateDir, dir, { recursive: true })
    const file = join(dir, 'theme.json')
    const data = JSON.parse(readFileSync(file, 'utf8')) as { modes: Record<string, Record<string, unknown>> }
    data.modes.light.fallbacks = { 'gr-primary-hover': '#4338ca' }
    writeFileSync(file, JSON.stringify(data))
    expect(stripComputedFallbacks(dir)).toBe(1)
    const stripped = JSON.parse(readFileSync(file, 'utf8')) as { modes: Record<string, object> }
    expect(stripped.modes.light).not.toHaveProperty('fallbacks')
  })

  it('тема каталога без extends копируется из исходника пакета — без собранного манифеста', () => {
    expect(result.dir).toBe(dest)
    expect(result.strippedFallbacks).toBe(0)
  })

  it('копия независима: без extends, со своими id и версией', () => {
    expect(theme).toMatchObject({ id: 'stone', title: 'Камень', version: '1.0.0', targets: { '@feugene/granularity': '^3.0.0' } })
    expect(theme.extends).toBeUndefined()
  })

  it('собранная копия даёт те же значения, что источник, и те же фолбэки', () => {
    const copy = loadTheme(dest)
    const source = loadTheme(slateDir)
    expect(copy.root).toEqual(source.root)
    expect(copy.components).toEqual(source.components)
    for (const mode of Object.keys(source.modes)) {
      expect(copy.modes[mode].tokens, mode).toEqual(source.modes[mode].tokens)
      expect(copy.modes[mode].fallbacks, mode).toEqual(source.modes[mode].fallbacks)
    }
  })
})
