import { describe, expect, it } from 'vitest'

import { componentSheet, lookElement } from '../../../__tests__/componentSheet'
import { grFieldLookAttrs } from '../grFieldLook'
import type { GrFieldLookOptions } from '../grFieldLook'

/**
 * Вид рамки поля — лист `GrInput` по атрибутам `grFieldLookAttrs`. Его ставят все
 * поля ядра и спутников, поэтому проверяется сам лист, а не каждый компонент.
 */
const { look } = componentSheet('GrInput/GrInput.vue')

function frame(options: Partial<GrFieldLookOptions> = {}) {
  return lookElement('div', grFieldLookAttrs({ size: 'md', ...options }))
}

const RING = 'box-shadow'

describe('grFieldLookAttrs', () => {
  it('ошибка снимает подсветку: правила рамки не спорят', () => {
    const attrs = grFieldLookAttrs({ size: 'sm', state: 'success', invalid: true })
    expect(attrs['data-gr-state']).toBeUndefined()
    expect(attrs['data-gr-invalid']).toBe('')
  })

  it('недоступное поле не бывает «только для чтения»', () => {
    const attrs = grFieldLookAttrs({ size: 'sm', disabled: true, readonly: true })
    expect(attrs['data-gr-off']).toBe('')
    expect(attrs['data-gr-readonly']).toBeUndefined()
  })

  it('по умолчанию — однострочная коробка без подсветки', () => {
    expect(grFieldLookAttrs({ size: 'lg', state: 'default' })).toEqual({
      'data-gr-field': 'line',
      'data-gr-size': 'lg',
      'data-gr-shape': undefined,
      'data-gr-state': undefined,
      'data-gr-invalid': undefined,
      'data-gr-off': undefined,
      'data-gr-readonly': undefined,
      'data-gr-trigger': undefined,
    })
  })
})

describe('лист рамки поля', () => {
  it('покой: рамка `--gr-input`, подложка страницы, скругление ступени', () => {
    expect(look(frame({ size: 'xs' }))).toMatchObject({
      'border-color': 'var(--gr-input)',
      'background-color': 'var(--gr-bg)',
      'border-radius': 'var(--gr-radius-control-xs)',
      'height': '1.75rem',
    })
    expect(look(frame({ shape: 'pill' }))['border-radius']).toBe('var(--gr-radius-full)')
  })

  it.each([
    ['success', 'var(--gr-success)'],
    ['warning', 'var(--gr-warning)'],
    ['danger', 'var(--gr-danger)'],
  ] as const)('подсветка %s красит рамку и кольцо', (state, color) => {
    const style = look(frame({ state }), { focusWithin: true })
    expect(style['border-color']).toBe(color)
    expect(style[RING]).toContain(color)
  })

  it('ошибка красит рамку и кольцо своими ролями и сильнее подсветки', () => {
    const style = look(frame({ state: 'success', invalid: true }), { focusWithin: true })
    expect(style['border-color']).toBe('var(--gr-invalid-brd)')
    expect(style[RING]).toContain('var(--gr-invalid-ring)')
  })

  it('недоступность и «только чтение» гасят лишь рамку покоя', () => {
    expect(look(frame({ disabled: true }))).toMatchObject({
      'border-color': 'var(--gr-disabled-brd)',
      'background-color': 'var(--gr-muted)',
      'color': 'var(--gr-muted-fg)',
      'cursor': 'not-allowed',
    })
    expect(look(frame({ readonly: true }))).toMatchObject({
      'border-color': 'var(--gr-input-readonly-brd)',
      'background-color': 'var(--gr-input-readonly-bg)',
    })
    expect(look(frame({ disabled: true, state: 'warning' }))['border-color']).toBe('var(--gr-warning)')
    expect(look(frame({ readonly: true, invalid: true }))['border-color']).toBe('var(--gr-invalid-brd)')
  })

  it('рабочее поле откликается на указатель и фокус, сфокусированное под указателем держит фокус', () => {
    expect(look(frame(), { hover: true })['border-color']).toBe('var(--gr-input-hover)')
    expect(look(frame(), { focusWithin: true })['border-color']).toBe('var(--gr-input-focus-brd)')
    expect(look(frame(), { hover: true, focusWithin: true })['border-color']).toBe('var(--gr-input-focus-brd)')
  })

  it('у ошибки, подсветки, недоступного и «только чтения» рамка — сообщение, отклика нет', () => {
    expect(look(frame({ invalid: true }), { hover: true })['border-color']).toBe('var(--gr-invalid-brd)')
    expect(look(frame({ state: 'danger' }), { focusWithin: true })['border-color']).toBe('var(--gr-danger)')
    expect(look(frame({ disabled: true }), { hover: true })['border-color']).toBe('var(--gr-disabled-brd)')
    expect(look(frame({ readonly: true }), { focusWithin: true })['border-color']).toBe('var(--gr-input-readonly-brd)')
  })

  it('кольцо — толщины темы и только при фокусе', () => {
    expect(look(frame())[RING]).toBeUndefined()
    expect(look(frame(), { focusWithin: true })[RING]).toBe('0 0 0 var(--gr-input-focus-ring-width) var(--gr-ring)')
  })

  it('триггер зажигает кольцо своим `:focus-visible`, а не фокусом внутри', () => {
    expect(look(frame({ trigger: true }), { focusWithin: true })[RING]).toBeUndefined()
    expect(look(frame({ trigger: true }), { focus: true })[RING]).toContain('var(--gr-ring)')
  })
})
