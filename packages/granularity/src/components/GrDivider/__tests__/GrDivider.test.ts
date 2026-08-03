import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrDivider from '../GrDivider.vue'

/**
 * У разделителя три взаимоисключающие ветки рендера, и они отличаются не
 * стилями, а семантикой: `<hr>` против `role="separator"` с ориентацией.
 * Тест держит именно это соответствие.
 */
describe('GrDivider', () => {
  it('без подписи — нативный <hr>, без лишней ARIA', () => {
    const wrapper = mount(GrDivider)

    expect(wrapper.element.tagName).toBe('HR')
    // `<hr>` уже имеет неявную роль separator — дублировать её нельзя.
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('вертикальный — separator с явной ориентацией', () => {
    const wrapper = mount(GrDivider, { props: { orientation: 'vertical' } })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('с подписью — separator с текстом и линиями по обе стороны', () => {
    const wrapper = mount(GrDivider, { props: { label: 'или' } })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
    expect(wrapper.text()).toBe('или')
    expect(wrapper.element.tagName).not.toBe('HR')
  })

  it('слот перекрывает проп label', () => {
    const wrapper = mount(GrDivider, {
      props: { label: 'из пропа' },
      slots: { default: 'из слота' },
    })

    expect(wrapper.text()).toBe('из слота')
  })

  it('align управляет тем, с какой стороны рисуется линия', () => {
    const start = mount(GrDivider, { props: { label: 'A', align: 'start' } })
    const end = mount(GrDivider, { props: { label: 'A', align: 'end' } })
    const center = mount(GrDivider, { props: { label: 'A' } })

    // `start` — линия только справа, `end` — только слева, по умолчанию — обе.
    expect(start.findAll('.flex-1')).toHaveLength(1)
    expect(end.findAll('.flex-1')).toHaveLength(1)
    expect(center.findAll('.flex-1')).toHaveLength(2)
  })

  it('вертикальная ветка игнорирует подпись — линия остаётся линией', () => {
    const wrapper = mount(GrDivider, { props: { orientation: 'vertical', label: 'или' } })

    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })
})
