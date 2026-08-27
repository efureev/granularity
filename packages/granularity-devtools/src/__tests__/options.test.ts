import { describe, expect, it } from 'vitest'

import { resolveOptions } from '../options'

describe('опции панели', () => {
  it('по умолчанию проверки включены, а глубину буфера не трогаем', () => {
    expect(resolveOptions()).toEqual({ checks: 'all', eventLimit: null })
  })

  it('глубина буфера берётся целым числом', () => {
    expect(resolveOptions({ eventLimit: 12.7 }).eventLimit).toBe(12)
  })

  it('ноль и отрицательные не проходят: буфер без записей бессмыслен', () => {
    expect(resolveOptions({ eventLimit: 0 }).eventLimit).toBeNull()
    expect(resolveOptions({ eventLimit: -5 }).eventLimit).toBeNull()
  })

  it('проверки выключаются явным значением', () => {
    expect(resolveOptions({ checks: 'off' }).checks).toBe('off')
  })
})
