import { describe, expect, it } from 'vitest'

import { collectMissingComponentValues, collectUnknownComponentValues, type ThemeGateData } from '../gates/themeGate'

const TOKENS = [
  { owner: 'GrCard', name: '--gr-card-bg', kind: 'theme' },
  { owner: 'GrCard', name: '--gr-card-pad', kind: 'theme' },
  { owner: 'GrCard', name: '--gr-card-gap', kind: 'hook' },
  { owner: 'GrCard', name: '--gr-card-ring', kind: 'theme' },
]

function theme(components: ThemeGateData['components']): ThemeGateData {
  return {
    id: 'stone',
    defaultMode: 'light',
    modes: { light: {}, dark: {}, dim: { extends: 'dark' } },
    targets: { '@acme/ui': '^1.0.0' },
    components,
  }
}

describe('defineThemeGate: значения компонентов', () => {
  it('значение режима — root раздела, цепочка режима или режим по умолчанию', () => {
    const full = theme({ '@acme/ui': { GrCard: { root: { 'gr-card-pad': '4px' }, modes: { light: { 'gr-card-bg': '#fff', 'gr-card-ring': 'blue' }, dark: { 'gr-card-bg': '#000' } } } } })
    expect(collectMissingComponentValues(full, { '@acme/ui': TOKENS })).toEqual([])
  })

  it('нехватка называется по режиму и компоненту; хук значения не требует', () => {
    const lacking = theme({ '@acme/ui': { GrCard: { modes: { dark: { 'gr-card-bg': '#000' } } } } })
    expect(collectMissingComponentValues(lacking, { '@acme/ui': TOKENS })).toEqual([
      'light: --gr-card-bg (@acme/ui:GrCard)',
      'light: --gr-card-pad (@acme/ui:GrCard)',
      'dark: --gr-card-pad (@acme/ui:GrCard)',
      'dim: --gr-card-pad (@acme/ui:GrCard)',
      'light: --gr-card-ring (@acme/ui:GrCard)',
      'dark: --gr-card-ring (@acme/ui:GrCard)',
      'dim: --gr-card-ring (@acme/ui:GrCard)',
    ])
  })

  it('лишнее: хук, свой токен компонента, неизвестный компонент, пакет вне целей', () => {
    const extra = theme({
      '@acme/ui': { GrCard: { root: { 'gr-card-gap': '2px', 'gr-card-typo': '1px', 'gr-card-pad': '4px' } }, GrGhost: { root: { 'gr-ghost-x': '1' } } },
      '@acme/other': { GrX: { root: { 'gr-x': '1' } } },
    })
    expect(collectUnknownComponentValues(extra, { '@acme/ui': TOKENS })).toEqual([
      '@acme/ui:GrCard: --gr-card-gap — не токен вида theme этого компонента',
      '@acme/ui:GrCard: --gr-card-typo — не токен вида theme этого компонента',
      '@acme/ui:GrGhost: у пакета нет такого компонента с токенами',
      '@acme/other: пакет не назван в targets гейта — значения не с чем сверить',
    ])
  })
})
