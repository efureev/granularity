import { describe, expect, it } from 'vitest'

import { propSourceState, resolvePropSource } from '../resolve/propSource'

const NO_CONFIG = { passedProps: null, componentDefaults: undefined, providerSize: undefined }

describe('источник значения пропа', () => {
  it('без провайдера всё приходит из дефолтов компонента', () => {
    expect(resolvePropSource('size', NO_CONFIG)).toBe('default')
  })

  it('проп в разметке сильнее конфига', () => {
    expect(resolvePropSource('size', {
      passedProps: { size: 'lg' },
      componentDefaults: { size: 'sm' },
      providerSize: 'xs',
    })).toBe('prop')
  })

  it('точечный дефолт компонента сильнее глобального размера', () => {
    expect(resolvePropSource('size', {
      passedProps: null,
      componentDefaults: { size: 'sm' },
      providerSize: 'xs',
    })).toBe('component-default')
  })

  it('глобальный размер виден отдельно от точечного', () => {
    expect(resolvePropSource('size', { ...NO_CONFIG, providerSize: 'xs' })).toBe('provider-size')
  })

  it('глобальный размер не отвечает за другие пропы', () => {
    expect(resolvePropSource('variant', { ...NO_CONFIG, providerSize: 'xs' })).toBe('default')
  })

  it('kebab-case из шаблона — то же имя, что camelCase в пропах', () => {
    expect(resolvePropSource('ariaLabel', { ...NO_CONFIG, passedProps: { 'aria-label': 'Закрыть' } })).toBe('prop')
  })

  it('`:size="undefined"` — это «не задавал», как и для самого Vue', () => {
    expect(resolvePropSource('size', {
      passedProps: { size: undefined },
      componentDefaults: { size: 'sm' },
      providerSize: undefined,
    })).toBe('component-default')
  })
})

describe('раскладка по группам', () => {
  it('каждый проп попадает в группу своего источника', () => {
    const state = propSourceState(
      { size: 'sm', variant: 'primary', disabled: false },
      { passedProps: { variant: 'primary' }, componentDefaults: { size: 'sm' }, providerSize: 'xs' },
    )

    expect(state).toEqual([
      { type: 'GrConfigProvider · componentDefaults', key: 'size', value: 'sm', editable: false },
      { type: 'prop', key: 'variant', value: 'primary', editable: false },
      { type: 'component default', key: 'disabled', value: false, editable: false },
    ])
  })

  it('проп без значения и без источника числится «not set», а не дефолтом', () => {
    const state = propSourceState({ tone: undefined, loading: false }, NO_CONFIG)

    expect(state).toEqual([
      { type: 'not set', key: 'tone', value: undefined, editable: false },
      { type: 'component default', key: 'loading', value: false, editable: false },
    ])
  })

  it('значения не редактируются: запись в чужое реактивное состояние сюда не входит', () => {
    const state = propSourceState({ size: 'md' }, NO_CONFIG)

    expect(state.every(entry => entry.editable === false)).toBe(true)
  })
})
