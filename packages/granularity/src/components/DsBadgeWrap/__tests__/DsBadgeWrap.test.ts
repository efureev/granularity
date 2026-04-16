import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsBadgeWrap from '../DsBadgeWrap.vue'

describe('DsBadgeWrap', () => {
  it('рендерит слот без бейджа по умолчанию', () => {
    const wrapper = mount(DsBadgeWrap, {
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    expect(wrapper.html()).toContain('Inbox')
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(0)
  })

  it('показывает dot-индикатор, когда dot=true', () => {
    const wrapper = mount(DsBadgeWrap, {
      props: {
        dot: true,
      },
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    const badges = wrapper.findAll('[aria-hidden="true"]')

    expect(badges).toHaveLength(1)
    expect(badges[0].attributes('class')).toContain('h-2')
    expect(badges[0].text()).toBe('')
  })

  it('показывает числовое значение, когда value задан и dot=false', () => {
    const wrapper = mount(DsBadgeWrap, {
      props: {
        value: 7,
      },
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    const badge = wrapper.get('[aria-hidden="true"]')

    expect(badge.text()).toBe('7')
    expect(badge.attributes('class')).toContain('min-w-5')
    expect(badge.attributes('class')).toContain('text-[11px]')
  })
})