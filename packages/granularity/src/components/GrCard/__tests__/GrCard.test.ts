import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrCard from '../GrCard.vue'

describe('GrCard', () => {
  it('рендерит слот и базовые card-классы', () => {
    const wrapper = mount(GrCard, {
      slots: {
        default: '<div>Card content</div>',
      },
    })

    expect(wrapper.text()).toContain('Card content')
    expect(wrapper.attributes('class')).toContain('rounded-[var(--gr-radius-lg)]')
    expect(wrapper.attributes('class')).toContain('border-[var(--gr-brd)]')
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-card)]')
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-card-fg)]')
  })

  // Карточка — база `GrCollapse` и `GrList`: любая обёртка или отступ по
  // умолчанию поехали бы у них, поэтому дефолт зафиксирован тестом.
  it('без пропов остаётся одним div со слотом — ни обёрток, ни отступов', () => {
    const wrapper = mount(GrCard, { slots: { default: '<span>x</span>' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('[data-gr-card-body]').exists()).toBe(false)
    expect(wrapper.classes()).toContain('shadow-sm')
    expect(wrapper.classes().some(cls => /^p-\d/.test(cls))).toBe(false)
  })
})

describe('GrCard — padding и variant', () => {
  it.each([
    ['sm', 'p-3'],
    ['md', 'p-4'],
    ['lg', 'p-6'],
  ] as const)('padding=%s кладёт отступ на саму поверхность', (padding, expected) => {
    const wrapper = mount(GrCard, { props: { padding }, slots: { default: 'x' } })

    expect(wrapper.classes()).toContain(expected)
    // Обёртки по-прежнему нет: секций не просили.
    expect(wrapper.find('[data-gr-card-body]').exists()).toBe(false)
  })

  it('outlined снимает тень, ghost — ещё и рамку', () => {
    const outlined = mount(GrCard, { props: { variant: 'outlined' }, slots: { default: 'x' } })
    expect(outlined.classes()).toContain('border')
    expect(outlined.classes()).not.toContain('shadow-sm')

    const ghost = mount(GrCard, { props: { variant: 'ghost' }, slots: { default: 'x' } })
    expect(ghost.classes()).not.toContain('border')
    expect(ghost.classes()).not.toContain('shadow-sm')
    expect(ghost.classes()).toContain('bg-[var(--gr-card)]')
  })

  it('оба пропа читаются из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrCard },
      template: `
        <GrConfigProvider :component-defaults="{ GrCard: { padding: 'lg', variant: 'outlined' } }">
          <GrCard>x</GrCard>
        </GrConfigProvider>
      `,
    })

    const card = mount(Harness).get('[data-gr-card]')
    expect(card.classes()).toContain('p-6')
    expect(card.classes()).not.toContain('shadow-sm')
  })
})

describe('GrCard — секции', () => {
  const slots = {
    header: '<h3>Заголовок</h3>',
    default: '<p>Тело</p>',
    footer: '<button>Действие</button>',
  }

  it('шапка и подвал отбиваются разделителями', () => {
    const wrapper = mount(GrCard, { props: { padding: 'md' }, slots })

    expect(wrapper.get('[data-gr-card-header]').classes()).toContain('border-b')
    expect(wrapper.get('[data-gr-card-footer]').classes()).toContain('border-t')
    expect(wrapper.get('[data-gr-card-body]').text()).toBe('Тело')
  })

  // Иначе отступ был бы и у поверхности, и у каждой секции — двойной.
  it('с секциями отступ принадлежит секциям, а не корню', () => {
    const wrapper = mount(GrCard, { props: { padding: 'md' }, slots })

    expect(wrapper.classes()).not.toContain('p-4')
    expect(wrapper.get('[data-gr-card-header]').classes()).toContain('p-4')
    expect(wrapper.get('[data-gr-card-body]').classes()).toContain('p-4')
    expect(wrapper.get('[data-gr-card-footer]').classes()).toContain('p-4')
  })

  it('секции необязательны по отдельности', () => {
    const wrapper = mount(GrCard, {
      props: { padding: 'sm' },
      slots: { header: '<h3>H</h3>', default: 'body' },
    })

    expect(wrapper.find('[data-gr-card-header]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-card-footer]').exists()).toBe(false)
  })

  it('bodyClass сам по себе включает обёртку тела', () => {
    const wrapper = mount(GrCard, {
      props: { bodyClass: 'grid gap-2' },
      slots: { default: 'body' },
    })

    expect(wrapper.get('[data-gr-card-body]').classes()).toContain('grid')
  })
})

describe('GrCard — интерактивность', () => {
  it('href делает карточку ссылкой', () => {
    const wrapper = mount(GrCard, { props: { href: '/report' }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/report')
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('clickable делает карточку кнопкой и эмитит click', async () => {
    const wrapper = mount(GrCard, { props: { clickable: true }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('as подменяет корневой тег', () => {
    const wrapper = mount(GrCard, { props: { as: 'section' }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('hoverable подсвечивает карточку, не делая её кнопкой', () => {
    const wrapper = mount(GrCard, { props: { hoverable: true }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('hover:bg-[var(--gr-muted)]')
    expect(wrapper.classes()).not.toContain('focus-visible:ring-2')
  })

  it('интерактивная карточка получает кольцо фокуса', () => {
    const wrapper = mount(GrCard, { props: { clickable: true }, slots: { default: 'x' } })

    expect(wrapper.classes()).toContain('focus-visible:ring-2')
  })
})
