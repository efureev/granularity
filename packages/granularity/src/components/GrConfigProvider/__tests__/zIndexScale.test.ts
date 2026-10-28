import { grFoundationTokens } from '@feugene/granularity-tokens'
import { describe, expect, it } from 'vitest'

import { themeData, THEMES } from '../../../__tests__/themeCss'
import { GR_Z_INDEX_OFFSETS } from '../zIndexScale'

const LAYERS = grFoundationTokens
  .filter(token => token.name.startsWith('--gr-z-'))
  .map(token => token.name)

describe('zIndexBase: смещения шкалы', () => {
  it('сдвигает каждый слой реестра, а не часть шкалы', () => {
    expect(Object.keys(GR_Z_INDEX_OFFSETS).sort()).toEqual([...LAYERS].sort())
  })

  it.each(THEMES)('смещения повторяют шкалу темы «%s» от слоя выпадашек', (theme) => {
    const root = themeData(theme).root as Record<string, string>
    const base = Number(root['gr-z-dropdown'])

    for (const name of LAYERS)
      expect(GR_Z_INDEX_OFFSETS[name], name).toBe(Number(root[name.slice(2)]) - base)
  })
})
