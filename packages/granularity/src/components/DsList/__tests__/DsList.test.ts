import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsList, { DsListItem } from '..'

describe('DsList', () => {
  it('рендерит список внутри карточки и по умолчанию добавляет разделители', () => {
    const wrapper = mount(DsList, {
      slots: {
        default: `
          <DsListItem title="Notifications" description="Choose delivery channels">
            <button type="button">Manage</button>
          </DsListItem>
        `,
      },
      global: {
        components: {
          DsListItem,
        },
      },
    })

    expect(wrapper.text()).toContain('Notifications')
    expect(wrapper.text()).toContain('Choose delivery channels')
    expect(wrapper.get('button').text()).toBe('Manage')
    expect(wrapper.find('.divide-y').exists()).toBe(true)
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.find('[role="listitem"]').exists()).toBe(true)
  })

  it('не добавляет divide-y при divided=false, но сохраняет role="list"', () => {
    const wrapper = mount(DsList, {
      props: { divided: false },
      slots: { default: '<div data-testid="child">child</div>' },
    })

    expect(wrapper.find('.divide-y').exists()).toBe(false)
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
  })
})

describe('DsListItem', () => {
  it('экспортируется и скрывает description, если он не передан', () => {
    const wrapper = mount(DsListItem, {
      props: {
        title: 'Security',
      },
      slots: {
        default: '<span>Status</span>',
      },
    })

    expect(wrapper.text()).toContain('Security')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.find('.ds-muted').exists()).toBe(false)
    expect(wrapper.attributes('role')).toBe('listitem')
  })

  it('поддерживает слоты title, description и prefix', () => {
    const wrapper = mount(DsListItem, {
      slots: {
        title: '<span data-testid="title">Custom <b>Title</b></span>',
        description: '<span data-testid="desc">Custom description</span>',
        prefix: '<span data-testid="prefix">ICON</span>',
      },
    })

    expect(wrapper.get('[data-testid="title"]').text()).toContain('Custom')
    expect(wrapper.get('[data-testid="desc"]').text()).toBe('Custom description')
    expect(wrapper.get('[data-testid="prefix"]').text()).toBe('ICON')
  })

  it('меняет вертикальный паддинг при density="compact"', () => {
    const compact = mount(DsListItem, { props: { title: 'T', density: 'compact' } })
    expect(compact.attributes('class')).toContain('py-2')
    expect(compact.attributes('class')).not.toContain('py-3')

    const regular = mount(DsListItem, { props: { title: 'T' } })
    expect(regular.attributes('class')).toContain('py-3')
  })
})
