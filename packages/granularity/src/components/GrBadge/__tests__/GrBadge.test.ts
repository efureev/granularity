import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrBadge from '../GrBadge.vue'

describe('GrBadge', () => {
  it('рендерит light-tone по указанному tone', () => {
    const wrapper = mount(GrBadge, {
      props: {
        tone: 'success',
      },
      slots: {
        default: 'Success',
      },
    })

    expect(wrapper.text()).toContain('Success')
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-success-light)]')
    // Именно `-text`, а не `--gr-success`: насыщенный тон на своей же светлой
    // подложке даёт 2.24:1.
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-success-text)]')
  })

  it('поддерживает size: sm / md / lg', () => {
    const sm = mount(GrBadge, { props: { size: 'sm' }, slots: { default: 'SM' } })
    expect(sm.attributes('class')).toContain('text-[length:var(--gr-control-text-xs)]')
    expect(sm.attributes('class')).toContain('px-2')

    const md = mount(GrBadge, { props: { size: 'md' }, slots: { default: 'MD' } })
    expect(md.attributes('class')).toContain('text-[length:var(--gr-control-text-sm)]')
    expect(md.attributes('class')).toContain('px-3')

    const lg = mount(GrBadge, { props: { size: 'lg' }, slots: { default: 'LG' } })
    expect(lg.attributes('class')).toContain('text-[length:var(--gr-control-text-md)]')
    expect(lg.attributes('class')).toContain('px-3')
    expect(lg.attributes('class')).toContain('py-1')
  })

  it('поддерживает радиусы square / semi / round', () => {
    const square = mount(GrBadge, { props: { radius: 'square' }, slots: { default: 'Square' } })
    expect(square.attributes('class')).toContain('rounded-[var(--gr-radius-none)]')

    const semi = mount(GrBadge, {
      props: { radius: 'semi', size: 'lg' },
      slots: { default: 'Semi' },
    })
    expect(semi.attributes('class')).toContain('rounded-[var(--gr-badge-semi-radius-lg,7px)]')

    const round = mount(GrBadge, { props: { radius: 'round' }, slots: { default: 'Round' } })
    expect(round.attributes('class')).toContain('rounded-[var(--gr-radius-full)]')
  })

  it('рендерит dark filled tone при dark=true', () => {
    const wrapper = mount(GrBadge, {
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

    // Заливка filled идёт через покомпонентный слой: вес у тем разный (в светлой
    // это `-solid` под светлый текст, в тёмной — роль тона под тёмный).
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-badge-success-bg,var(--gr-success-solid))]')
    // Полярность текста задаёт тема, а не захардкоженный `text-white`: тот давал
    // 2.54:1 в light и 1.92:1 в dark.
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-badge-success-fg,var(--gr-success-solid-fg))]')
    expect(wrapper.attributes('class')).toContain('rounded-[var(--gr-badge-semi-radius-lg,7px)]')
  })

  it('поддерживает новые tones slate и azure', () => {
    const slate = mount(GrBadge, {
      props: { tone: 'slate' },
      slots: { default: 'Slate' },
    })

    const azure = mount(GrBadge, {
      props: { tone: 'azure', dark: true },
      slots: { default: 'Azure' },
    })

    expect(slate.attributes('class')).toContain('bg-[var(--gr-slate-light)]')
    expect(slate.attributes('class')).toContain('text-[var(--gr-slate-text)]')
    expect(azure.attributes('class')).toContain('bg-[var(--gr-badge-azure-bg,var(--gr-azure-solid))]')
    expect(azure.attributes('class')).toContain('text-[var(--gr-badge-azure-fg,var(--gr-azure-solid-fg))]')
  })
})