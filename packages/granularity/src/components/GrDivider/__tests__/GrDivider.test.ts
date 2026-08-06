import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
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

describe('GrDivider — имя, начертание и размеры', () => {
  it('подпись становится именем разделителя: внутри роли separator текст презентационный', () => {
    const wrapper = mount(GrDivider, { props: { label: 'или' } })

    expect(wrapper.attributes('aria-label')).toBe('или')
    expect(wrapper.text()).toBe('или')
  })

  it('ariaLabel даёт имя подписи из слота и перебивает label', () => {
    const fromSlot = mount(GrDivider, {
      props: { ariaLabel: 'Ещё три записи' },
      slots: { default: '<b>+3</b>' },
    })
    expect(fromSlot.attributes('aria-label')).toBe('Ещё три записи')

    const both = mount(GrDivider, { props: { label: 'или', ariaLabel: 'выбор способа входа' } })
    expect(both.attributes('aria-label')).toBe('выбор способа входа')
  })

  it('без подписи имени нет — линия ничего не сообщает', () => {
    expect(mount(GrDivider).attributes('aria-label')).toBeUndefined()
  })

  it('variant меняет начертание во всех трёх ветках рендера', () => {
    const plain = mount(GrDivider, { props: { variant: 'dashed' } })
    expect(plain.attributes('class')).toContain('border-dashed')

    const vertical = mount(GrDivider, { props: { orientation: 'vertical', variant: 'dotted' } })
    expect(vertical.attributes('class')).toContain('border-dotted')

    // У подписи линии — отдельные элементы, начертание должно доехать до них.
    const labelled = mount(GrDivider, { props: { label: 'или', variant: 'dashed' } })
    expect(labelled.findAll('.border-dashed')).toHaveLength(2)
  })

  it('spacing даёт вертикальные отступы горизонтальному и горизонтальные — вертикальному', () => {
    const horizontal = mount(GrDivider, { props: { spacing: 'md' } })
    expect(horizontal.attributes('class')).toContain('my-3')

    const vertical = mount(GrDivider, { props: { orientation: 'vertical', spacing: 'md' } })
    expect(vertical.attributes('class')).toContain('mx-3')

    // Дефолт `none` — чтобы существующие раскладки не поехали.
    expect(mount(GrDivider).attributes('class')).not.toContain('my-')
  })

  it('thickness уезжает в переменную, а length — в высоту или ширину', () => {
    const vertical = mount(GrDivider, { props: { orientation: 'vertical', thickness: 2, length: 24 } })
    expect(vertical.attributes('style')).toContain('--gr-divider-thickness: 2px')
    expect(vertical.attributes('style')).toContain('height: 24px')

    const horizontal = mount(GrDivider, { props: { thickness: '0.5rem', length: '50%' } })
    expect(horizontal.attributes('style')).toContain('--gr-divider-thickness: 0.5rem')
    expect(horizontal.attributes('style')).toContain('width: 50%')
  })

  it('variant и spacing читаются из GrConfigProvider', () => {
    const wrapper = mount({
      components: { GrConfigProvider, GrDivider },
      template: `
        <GrConfigProvider :component-defaults="{ GrDivider: { variant: 'dashed', spacing: 'lg' } }">
          <GrDivider />
        </GrConfigProvider>
      `,
    })

    const divider = wrapper.find('[data-gr-divider]')
    expect(divider.attributes('class')).toContain('border-dashed')
    expect(divider.attributes('class')).toContain('my-4')
  })

  it('локальный проп сильнее провайдера', () => {
    const wrapper = mount({
      components: { GrConfigProvider, GrDivider },
      template: `
        <GrConfigProvider :component-defaults="{ GrDivider: { variant: 'dashed' } }">
          <GrDivider variant="dotted" />
        </GrConfigProvider>
      `,
    })

    expect(wrapper.find('[data-gr-divider]').attributes('class')).toContain('border-dotted')
  })
})
