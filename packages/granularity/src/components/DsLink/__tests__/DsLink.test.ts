import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsLink from '../DsLink.vue'

describe('DsLink', () => {
  it('рендерит <a> при использовании href', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: 'https://example.com',
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'Example',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.element.tagName.toLowerCase()).toBe('a')
    expect(el.attributes('href')).toBe('https://example.com')
  })

  it('добавляет target и rel для external href по умолчанию', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: 'https://example.com',
        external: true,
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'External',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.attributes('target')).toBe('_blank')
    expect(el.attributes('rel')).toBe('noopener noreferrer')
  })

  it('рендерит span и aria-disabled при disabled=true', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: 'https://example.com',
        disabled: true,
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'Disabled',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.element.tagName.toLowerCase()).toBe('span')
    expect(el.attributes('aria-disabled')).toBe('true')
    expect(el.attributes('class')).toContain('cursor-not-allowed')
  })

  it('управляет классами underline', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: '#',
        underline: 'always',
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'Link',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.attributes('class')).toContain('underline')
    expect(el.attributes('class')).toContain('underline-offset-4')
  })
})