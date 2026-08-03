import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrKbd from '../GrKbd.vue'

describe('GrKbd', () => {
  it('рендерится нативным <kbd> — семантика клавиши, а не стилизованный span', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.text()).toBe('Esc')
  })

  it('размер меняет метрики, а не только шрифт', () => {
    const sm = mount(GrKbd, { props: { size: 'sm' }, slots: { default: 'K' } })
    const md = mount(GrKbd, { slots: { default: 'K' } })

    expect(sm.classes()).toContain('h-6')
    expect(md.classes(), 'md — размер по умолчанию').toContain('h-7')
  })

  it('минимальная ширина держит одиночный символ квадратным', () => {
    // Без `min-w` клавиша «K» была бы уже, чем «Esc», и ряд хоткеев прыгал бы.
    const wrapper = mount(GrKbd, { slots: { default: 'K' } })

    expect(wrapper.classes().some(c => c.startsWith('min-w-'))).toBe(true)
  })

  it('цифры не пляшут по ширине (tabular-nums)', () => {
    const wrapper = mount(GrKbd, { slots: { default: '1' } })

    expect(wrapper.classes()).toContain('tabular-nums')
  })

  it('оформление берётся из токенов, а не из хардкода', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })
    const className = wrapper.attributes('class') ?? ''

    expect(className).toContain('var(--gr-brd)')
    expect(className).toContain('var(--gr-muted)')
  })
})
