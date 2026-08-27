import { describe, expect, it } from 'vitest'

import { GR_REQUIRED_PROPS } from '../data/requiredMap.generated'
import { missingRequiredMessage, missingRequiredProps } from '../resolve/requiredProps'

describe('карта обязательных пропов', () => {
  it('собрана из типов ядра и не пуста', () => {
    expect(Object.keys(GR_REQUIRED_PROPS).length).toBeGreaterThan(30)
    expect(GR_REQUIRED_PROPS.GrBreadcrumbs).toEqual(['items'])
  })
})

describe('поиск недостающих пропов', () => {
  it('находит ровно недостающие', () => {
    expect(missingRequiredProps('GrBottomNav', { modelValue: 'a' })).toEqual(['items'])
  })

  it('`null`, `0` и пустая строка переданы осознанно', () => {
    expect(missingRequiredProps('GrBreadcrumbs', { items: null })).toEqual([])
    expect(missingRequiredProps('GrCodeBlock', { code: '' })).toEqual([])
  })

  it('компонент вне карты не даёт ложной тревоги', () => {
    expect(missingRequiredProps('AppHeader', {})).toEqual([])
    expect(missingRequiredProps('GrButton', {})).toEqual([])
  })

  it('пропов может не быть вовсе', () => {
    expect(missingRequiredProps('GrBreadcrumbs', undefined)).toEqual(['items'])
  })

  it('сообщение согласовано в числе', () => {
    expect(missingRequiredMessage('GrBottomNav', ['items'])).toBe('missing required prop: `items`')
    expect(missingRequiredMessage('GrBottomNav', ['modelValue', 'items'])).toBe('missing required props: `modelValue`, `items`')
  })
})
