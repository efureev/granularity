import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrLink from '../GrLink.vue'

describe('GrLink', () => {
  it('рендерит <a> при использовании href', () => {
    const wrapper = mount(GrLink, {
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
    const wrapper = mount(GrLink, {
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
    const wrapper = mount(GrLink, {
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

  it('добавляет rel noopener noreferrer при target="_blank" без external', () => {
    const wrapper = mount(GrLink, {
      props: {
        href: 'https://example.com',
        target: '_blank',
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'Blank',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.attributes('target')).toBe('_blank')
    expect(el.attributes('rel')).toBe('noopener noreferrer')
  })

  it('не навешивает focus-visible ring на disabled span', () => {
    const wrapper = mount(GrLink, {
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
    expect(el.attributes('class')).not.toContain('focus-visible:ring-2')
  })

  it('управляет классами underline', () => {
    const wrapper = mount(GrLink, {
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