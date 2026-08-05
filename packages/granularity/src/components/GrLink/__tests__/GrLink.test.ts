import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/external-link', () => {
  return {
    default: defineComponent({
      name: 'IconExternal',
      template: '<svg data-icon="external-link" />',
    }),
  }
})

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

  it('рендерит кастомный корень через проп `as` (с пробросом href/target/rel и GR-классов)', () => {
    const CustomLink = {
      name: 'CustomLink',
      props: ['href'],
      template: '<a data-custom="1" :href="href"><slot /></a>',
    }

    const wrapper = mount(GrLink, {
      props: {
        as: CustomLink,
        href: '/dashboard',
        external: true,
        variant: 'default',
        tone: 'primary',
      },
      attrs: {
        'data-testid': 'link',
        'data-extra': 'kept',
      },
      slots: {
        default: 'Go',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.element.tagName.toLowerCase()).toBe('a')
    expect(el.attributes('data-custom')).toBe('1')
    expect(el.attributes('data-extra')).toBe('kept')
    expect(el.attributes('href')).toBe('/dashboard')
    expect(el.attributes('target')).toBe('_blank')
    expect(el.attributes('rel')).toBe('noopener noreferrer')
    expect(el.attributes('class')).toContain('inline-flex')
    expect(el.attributes('class')).toContain('focus-visible:ring-2')
  })

  it('игнорирует `as` при disabled и рендерит span', () => {
    const CustomLink = {
      name: 'CustomLink',
      props: ['href'],
      template: '<a data-custom="1" :href="href"><slot /></a>',
    }

    const wrapper = mount(GrLink, {
      props: {
        as: CustomLink,
        href: '/dashboard',
        disabled: true,
      },
      attrs: {
        'data-testid': 'link',
      },
      slots: {
        default: 'Go',
      },
    })

    const el = wrapper.get('[data-testid="link"]')
    expect(el.element.tagName.toLowerCase()).toBe('span')
    expect(el.attributes('aria-disabled')).toBe('true')
    expect(el.attributes('href')).toBeUndefined()
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

describe('GrLink — смена контекста (WCAG 3.2.5)', () => {
  // Открытие в новой вкладке — смена контекста, и о ней надо предупредить:
  // визуально это делает иконка, для скринридера — скрытый суффикс.
  it('внешняя ссылка объявляет новую вкладку и показывает иконку', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Документация' },
    })

    expect(wrapper.get('.sr-only').text()).toBe('(opens in a new tab)')
    expect(wrapper.find('[data-icon="external-link"]').exists()).toBe(true)
  })

  // Условие — реальное поведение ссылки, а не наличие пропа `external`:
  // `target="_blank"` снаружи даёт ровно тот же сюрприз.
  it('явный target=_blank объявляется так же', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', target: '_blank' },
      slots: { default: 'Отчёт' },
    })

    expect(wrapper.get('.sr-only').text()).toBe('(opens in a new tab)')
  })

  it('обычная ссылка ничего лишнего не добавляет', () => {
    const wrapper = mount(GrLink, {
      props: { href: '/inner' },
      slots: { default: 'Внутрь' },
    })

    expect(wrapper.find('.sr-only').exists()).toBe(false)
    expect(wrapper.find('[data-icon="external-link"]').exists()).toBe(false)
  })

  // `aria-label` перекрывает содержимое целиком — вместе со скрытой подсказкой.
  it('заданное имя собирается вместе с подсказкой, а не теряет её', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', external: true, ariaLabel: 'Документация' },
      slots: { default: 'Docs' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Документация, opens in a new tab')
    // Иначе диктор прочитал бы подсказку дважды.
    expect(wrapper.find('.sr-only').exists()).toBe(false)
  })

  it('подсказка переопределяется пропом', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', external: true, newTabLabel: 'в новом окне' },
      slots: { default: 'Docs' },
    })

    expect(wrapper.get('.sr-only').text()).toBe('(в новом окне)')
  })

  it('иконка отключается пропом, подсказка остаётся', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', external: true, externalIcon: false },
      slots: { default: 'Docs' },
    })

    expect(wrapper.find('[data-icon="external-link"]').exists()).toBe(false)
    expect(wrapper.get('.sr-only').text()).toBe('(opens in a new tab)')
  })

  it('иконку можно включить и внутренней ссылке', () => {
    const wrapper = mount(GrLink, {
      props: { href: '/inner', externalIcon: true },
      slots: { default: 'Внутрь' },
    })

    expect(wrapper.find('[data-icon="external-link"]').exists()).toBe(true)
    expect(wrapper.find('.sr-only').exists()).toBe(false)
  })

  it('disabled не объявляет вкладку — ссылка не кликабельна', () => {
    const wrapper = mount(GrLink, {
      props: { href: 'https://example.com', external: true, disabled: true },
      slots: { default: 'Docs' },
    })

    expect(wrapper.find('.sr-only').exists()).toBe(false)
    expect(wrapper.find('[data-icon="external-link"]').exists()).toBe(false)
  })
})

describe('GrLink — disabled', () => {
  it('гасится цветом, а не прозрачностью', () => {
    const wrapper = mount(GrLink, {
      props: { href: '/x', disabled: true },
      slots: { default: 'Docs' },
    })

    expect(wrapper.classes()).toContain('text-[var(--gr-muted-fg)]')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })
})
