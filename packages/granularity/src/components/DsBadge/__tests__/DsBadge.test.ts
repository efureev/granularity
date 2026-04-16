import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DsBadge from '../DsBadge.vue'

describe('DsBadge', () => {
  it('рендерит light-tone по указанному tone', () => {
    const wrapper = mount(DsBadge, {
      props: {
        tone: 'success',
      },
      slots: {
        default: 'Success',
      },
    })

    expect(wrapper.text()).toContain('Success')
    expect(wrapper.attributes('class')).toContain('bg-[var(--ds-success-light)]')
    expect(wrapper.attributes('class')).toContain('text-[var(--ds-success)]')
  })

  it('поддерживает size: sm / md / lg', () => {
    const sm = mount(DsBadge, { props: { size: 'sm' }, slots: { default: 'SM' } })
    expect(sm.attributes('class')).toContain('text-[11px]')
    expect(sm.attributes('class')).toContain('px-2')

    const md = mount(DsBadge, { props: { size: 'md' }, slots: { default: 'MD' } })
    expect(md.attributes('class')).toContain('text-[12px]')
    expect(md.attributes('class')).toContain('px-2.5')

    const lg = mount(DsBadge, { props: { size: 'lg' }, slots: { default: 'LG' } })
    expect(lg.attributes('class')).toContain('text-[13px]')
    expect(lg.attributes('class')).toContain('px-3')
    expect(lg.attributes('class')).toContain('py-1')
  })

  it('поддерживает радиусы square / semi / round', () => {
    const square = mount(DsBadge, { props: { radius: 'square' }, slots: { default: 'Square' } })
    expect(square.attributes('class')).toContain('rounded-[var(--ds-radius-none)]')

    const semi = mount(DsBadge, {
      props: { radius: 'semi', size: 'lg' },
      slots: { default: 'Semi' },
    })
    expect(semi.attributes('class')).toContain('rounded-[5px]')

    const round = mount(DsBadge, { props: { radius: 'round' }, slots: { default: 'Round' } })
    expect(round.attributes('class')).toContain('rounded-full')
  })

  it('рендерит dark filled tone при dark=true', () => {
    const wrapper = mount(DsBadge, {
      props: {
        tone: 'success',
        dark: true,
        size: 'lg',
        radius: 'semi',
      },
      slots: {
        default: 'Success',
      },
    })

    expect(wrapper.attributes('class')).toContain('bg-[var(--ds-success)]')
    expect(wrapper.attributes('class')).toContain('text-white')
    expect(wrapper.attributes('class')).toContain('rounded-[5px]')
  })

  it('поддерживает новые tones slate и azure', () => {
    const slate = mount(DsBadge, {
      props: { tone: 'slate' },
      slots: { default: 'Slate' },
    })

    const azure = mount(DsBadge, {
      props: { tone: 'azure', dark: true },
      slots: { default: 'Azure' },
    })

    expect(slate.attributes('class')).toContain('bg-[var(--ds-slate-light)]')
    expect(slate.attributes('class')).toContain('text-[var(--ds-slate-text)]')
    expect(azure.attributes('class')).toContain('bg-[var(--ds-azure)]')
    expect(azure.attributes('class')).toContain('text-[var(--ds-azure-fg)]')
  })
})