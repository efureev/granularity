import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GrTable from '../GrTable.vue'

describe('GrTable', () => {
  it('рендерит head и body slots внутри таблицы', () => {
    const wrapper = mount(GrTable, {
      slots: {
        head: '<tr><th>Title</th></tr>',
        default: '<tr><td>Value</td></tr>',
      },
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').text()).toContain('Title')
    expect(wrapper.find('tbody').text()).toContain('Value')
  })

  it('рендерит tfoot только при наличии слота #foot', () => {
    const without = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(without.find('tfoot').exists()).toBe(false)

    const withFoot = mount(GrTable, {
      slots: {
        default: '<tr><td>x</td></tr>',
        foot: '<tr><td>total</td></tr>',
      },
    })
    expect(withFoot.find('tfoot').exists()).toBe(true)
    expect(withFoot.find('tfoot').text()).toContain('total')
  })

  it('рендерит caption из пропа как sr-only', () => {
    const wrapper = mount(GrTable, {
      props: { caption: 'Users list' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    const caption = wrapper.find('caption')
    expect(caption.exists()).toBe(true)
    expect(caption.text()).toBe('Users list')
    expect(caption.classes()).toContain('sr-only')
  })

  it('слот #caption имеет приоритет над пропом', () => {
    const wrapper = mount(GrTable, {
      props: { caption: 'from prop' },
      slots: {
        caption: 'from slot',
        default: '<tr><td>x</td></tr>',
      },
    })
    expect(wrapper.find('caption').text()).toBe('from slot')
  })

  it('не рендерит caption, если не задан ни проп, ни слот', () => {
    const wrapper = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(wrapper.find('caption').exists()).toBe(false)
  })

  it('включает role="region" + tabindex при regionLabel', () => {
    const withRegion = mount(GrTable, {
      props: { regionLabel: 'Scrollable users table' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    const scroll = withRegion.find('[data-ds-table-scroll]')
    expect(scroll.attributes('role')).toBe('region')
    expect(scroll.attributes('tabindex')).toBe('0')
    expect(scroll.attributes('aria-label')).toBe('Scrollable users table')

    const without = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    const scrollNo = without.find('[data-ds-table-scroll]')
    expect(scrollNo.attributes('role')).toBeUndefined()
    expect(scrollNo.attributes('tabindex')).toBeUndefined()
  })

  it('пробрасывает aria-label / aria-labelledby на <table>', () => {
    const wrapperLabel = mount(GrTable, {
      props: { ariaLabel: 'Users' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    expect(wrapperLabel.find('table').attributes('aria-label')).toBe('Users')

    const wrapperBy = mount(GrTable, {
      props: { ariaLabel: 'ignored', ariaLabelledby: 'caption-id' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    expect(wrapperBy.find('table').attributes('aria-labelledby')).toBe('caption-id')
    expect(wrapperBy.find('table').attributes('aria-label')).toBeUndefined()
  })

  it('меняет размер текста по density', () => {
    const regular = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(regular.find('table').classes()).toContain('text-sm')

    const compact = mount(GrTable, {
      props: { density: 'compact' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    expect(compact.find('table').classes()).toContain('text-[13px]')
  })
})
