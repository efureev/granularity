import { describe, expect, it } from 'vitest'

import { GR_TONES } from '../../shared/tones'
import {
  applyGrAlertOverrides,
  GR_ALERT_VARIANTS,
  grAlertCssVars,
  resolveGrAlertColors,
} from '../grAlertStyles'

describe('grAlertStyles', () => {
  it('ни один тон ни в одном варианте не содержит hex-литералов', () => {
    for (const tone of GR_TONES) {
      for (const variant of GR_ALERT_VARIANTS) {
        const colors = resolveGrAlertColors(tone, variant)

        for (const [key, value] of Object.entries(colors)) {
          expect(value, `${tone}/${variant}.${key}`).not.toMatch(/#[0-9a-f]{3,8}\b/i)
          expect(value, `${tone}/${variant}.${key}`).toMatch(/var\(--gr-/)
        }
      }
    }
  })

  it('soft красит текстовый слой тональным -text, а не насыщенным тоном', () => {
    const colors = resolveGrAlertColors('success', 'soft')

    // --gr-success (#10b981) на --gr-success-light даёт 2.24:1 — ниже 3:1
    // даже для нетекстовой графики; --gr-success-text даёт 6.78:1.
    expect(colors.text).toBe('var(--gr-success-text)')
    expect(colors.title).toBe('var(--gr-success-text)')
    expect(colors.icon).toBe('var(--gr-success-text)')
    expect(colors.bg).toBe('var(--gr-success-light)')
  })

  it('outline кладёт тон в рамку и иконку, оставляя текст нейтральным', () => {
    const colors = resolveGrAlertColors('danger', 'outline')

    expect(colors.bg).toBe('var(--gr-bg)')
    expect(colors.icon).toBe('var(--gr-danger-text)')
    expect(colors.title).toBe('var(--gr-fg)')
    expect(colors.text).toBe('var(--gr-muted-fg)')
    expect(colors.border).toContain('var(--gr-danger) 45%')
  })

  it('primary и neutral отображаются на семантические роли без -light/-text', () => {
    expect(resolveGrAlertColors('primary', 'soft')).toMatchObject({
      bg: 'var(--gr-accent)',
      text: 'var(--gr-accent-fg)',
    })
    expect(resolveGrAlertColors('neutral', 'soft')).toMatchObject({
      bg: 'var(--gr-muted)',
      text: 'var(--gr-fg)',
    })
  })

  it('textColor перекрывает весь текстовый слой целиком', () => {
    const base = resolveGrAlertColors('success', 'soft')
    const out = applyGrAlertOverrides(base, { textColor: '#f9fafb' })

    expect(out.icon).toBe('#f9fafb')
    expect(out.title).toBe('#f9fafb')
    expect(out.text).toBe('#f9fafb')
    expect(out.close).toBe('#f9fafb')
    expect(out.closeHover).toBe('#f9fafb')
    // Подложка и рамка не тронуты — переопределяли только текст.
    expect(out.bg).toBe(base.bg)
    expect(out.border).toBe(base.border)
  })

  it('пустые и пробельные переопределения игнорируются', () => {
    const base = resolveGrAlertColors('info', 'soft')
    const out = applyGrAlertOverrides(base, { backgroundColor: '   ', textColor: '', borderColor: undefined })

    expect(out).toEqual(base)
  })

  it('grAlertCssVars отдаёт полный набор публичных переменных', () => {
    const vars = grAlertCssVars(resolveGrAlertColors('info', 'soft'))

    expect(Object.keys(vars).sort()).toEqual([
      '--gr-alert-bg',
      '--gr-alert-brd',
      '--gr-alert-close-color',
      '--gr-alert-close-hover-bg',
      '--gr-alert-close-hover-color',
      '--gr-alert-icon-color',
      '--gr-alert-text-color',
      '--gr-alert-title-color',
    ])
  })
})
