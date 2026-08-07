import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/inbox', () => {
  return {
    default: defineComponent({
      name: 'IconInbox',
      template: '<svg data-icon="inbox" />',
    }),
  }
})

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrEmptyState from '../GrEmptyState.vue'

function mountInProvider(config: Record<string, unknown>, props: Record<string, unknown> = {}) {
  return mount(defineComponent({
    render: () => h(GrConfigProvider, config, { default: () => h(GrEmptyState, props) }),
  }))
}

describe('GrEmptyState', () => {
  it('рендерит title, optional description и slot', () => {
    const wrapper = mount(GrEmptyState, {
      props: {
        title: 'No data',
        description: 'Try changing filters',
      },
      slots: {
        default: '<button>Reload</button>',
      },
    })

    expect(wrapper.text()).toContain('No data')
    expect(wrapper.text()).toContain('Try changing filters')
    expect(wrapper.html()).toContain('Reload')
    expect(wrapper.find('[data-icon="inbox"]').exists()).toBe(true)
  })

  it('не рендерит description-block без description', () => {
    const wrapper = mount(GrEmptyState, {
      props: {
        title: 'No data',
      },
    })

    expect(wrapper.text()).toContain('No data')
    expect(wrapper.find('[data-gr-empty-state-description]').exists()).toBe(false)
  })
})

describe('GrEmptyState — заголовок', () => {
  it('заголовок — настоящий heading, по умолчанию третьего уровня', () => {
    const wrapper = mount(GrEmptyState, { props: { title: 'No data' } })
    const title = wrapper.get('[data-gr-empty-state-title]')

    // Пустое состояние объясняет, почему на экране ничего нет: `<div>` не
    // находится навигацией по заголовкам.
    expect(title.element.tagName).toBe('H3')
    expect(title.classes()).toContain('mb-0')
  })

  it('уровень задаётся пропом и читается из GrConfigProvider', () => {
    const local = mount(GrEmptyState, { props: { title: 'No data', headingLevel: 2 } })
    expect(local.get('[data-gr-empty-state-title]').element.tagName).toBe('H2')

    const fromConfig = mountInProvider(
      { componentDefaults: { GrEmptyState: { headingLevel: 5 } } },
      { title: 'No data' },
    )
    expect(fromConfig.get('[data-gr-empty-state-title]').element.tagName).toBe('H5')
  })

  it('без title и слота заголовок берётся из локали', () => {
    const wrapper = mount(GrEmptyState)

    expect(wrapper.get('[data-gr-empty-state-title]').text()).toBe('Nothing here yet')
  })

  it('слоты сильнее пропов', () => {
    const wrapper = mount(GrEmptyState, {
      props: { title: 'No data', description: 'Try changing filters' },
      slots: {
        title: '<a href="/import">Импортировать данные</a>',
        description: '<em>ничего не найдено</em>',
      },
    })

    const title = wrapper.get('[data-gr-empty-state-title]')
    expect(title.text()).toBe('Импортировать данные')
    expect(title.find('a').exists()).toBe(true)
    expect(wrapper.get('[data-gr-empty-state-description]').html()).toContain('<em>')
  })

  it('слот #description показывает блок даже без пропа', () => {
    const wrapper = mount(GrEmptyState, {
      props: { title: 'No data' },
      slots: { description: '<span>подробности</span>' },
    })

    expect(wrapper.get('[data-gr-empty-state-description]').text()).toBe('подробности')
  })
})

describe('GrEmptyState — вариант поверхности', () => {
  it('outlined держит рамку и фон, ghost их снимает', async () => {
    const wrapper = mount(GrEmptyState, { props: { title: 'No data' } })
    const root = wrapper.get('[data-gr-empty-state]')
    expect(root.classes()).toContain('border')
    expect(root.classes()).toContain('bg-[var(--gr-card)]')

    await wrapper.setProps({ variant: 'ghost' })
    // Карточка внутри карточки: вторая рамка только шумит.
    expect(root.classes()).not.toContain('border')
    expect(root.classes()).not.toContain('bg-[var(--gr-card)]')
    expect(root.classes()).not.toContain('rounded-[var(--gr-radius-lg)]')
  })

  it('вариант читается из GrConfigProvider, локальный проп сильнее', () => {
    const fromConfig = mountInProvider(
      { componentDefaults: { GrEmptyState: { variant: 'ghost' } } },
      { title: 'No data' },
    )
    expect(fromConfig.get('[data-gr-empty-state]').classes()).not.toContain('border')

    const local = mountInProvider(
      { componentDefaults: { GrEmptyState: { variant: 'ghost' } } },
      { title: 'No data', variant: 'outlined' },
    )
    expect(local.get('[data-gr-empty-state]').classes()).toContain('border')
  })
})

describe('GrEmptyState — размер', () => {
  it('ступени двигают падинг, коробку иконки и кегль заголовка', () => {
    const small = mount(GrEmptyState, { props: { title: 'No data', size: 'sm' } })
    expect(small.get('[data-gr-empty-state]').classes()).toContain('p-4')
    expect(small.get('[data-gr-empty-state-icon]').classes()).toContain('h-10')
    expect(small.get('[data-gr-empty-state-title]').classes()).toContain('text-[length:var(--gr-text-sm)]')

    const large = mount(GrEmptyState, { props: { title: 'No data', size: 'lg' } })
    expect(large.get('[data-gr-empty-state]').classes()).toContain('p-8')
    expect(large.get('[data-gr-empty-state-icon]').classes()).toContain('h-14')
    expect(large.get('[data-gr-empty-state-title]').classes()).toContain('text-[length:var(--gr-text-base)]')
  })

  it('шкала не усечена: xs — своя ступень, а не откат к md', () => {
    const tiny = mount(GrEmptyState, { props: { title: 'No data', size: 'xs' } })

    expect(tiny.get('[data-gr-empty-state]').classes()).toContain('p-3')
    expect(tiny.get('[data-gr-empty-state-icon]').classes()).toContain('h-8')
  })

  it('размер читается из GrConfigProvider, локальный проп сильнее', () => {
    const fromConfig = mountInProvider({ size: 'lg' }, { title: 'No data' })
    expect(fromConfig.get('[data-gr-empty-state]').classes()).toContain('p-8')

    const local = mountInProvider({ size: 'lg' }, { title: 'No data', size: 'sm' })
    expect(local.get('[data-gr-empty-state]').classes()).toContain('p-4')
  })
})

describe('GrEmptyState — иконка', () => {
  it('встроенная иконка декоративна', () => {
    const wrapper = mount(GrEmptyState, { props: { title: 'No data' } })

    expect(wrapper.get('[data-icon="inbox"]').attributes('aria-hidden')).toBe('true')
  })

  it('слот #icon заменяет встроенную', () => {
    const wrapper = mount(GrEmptyState, {
      props: { title: 'No data' },
      slots: { icon: '<span data-custom-icon>★</span>' },
    })

    expect(wrapper.find('[data-icon="inbox"]').exists()).toBe(false)
    expect(wrapper.find('[data-custom-icon]').exists()).toBe(true)
  })
})
