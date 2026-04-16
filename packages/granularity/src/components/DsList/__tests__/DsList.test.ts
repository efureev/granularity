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
  })

  it('экспортирует DsListItem и скрывает description, если он не передан', () => {
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
  })
})