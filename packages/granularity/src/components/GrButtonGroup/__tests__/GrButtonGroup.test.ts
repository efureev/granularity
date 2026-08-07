import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrButton from '../../GrButton/GrButton.vue'
import GrButtonGroup from '../GrButtonGroup.vue'
import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'

function mountGroup(props: Record<string, unknown> = {}, buttonProps: Record<string, unknown> = {}) {
  return mount(GrButtonGroup, {
    props,
    slots: {
      default: () => [
        h(GrButton, buttonProps, { default: () => 'Первая' }),
        h(GrButton, null, { default: () => 'Вторая' }),
      ],
    },
  })
}

describe('GrButtonGroup', () => {
  it('объявляет себя группой — иначе кнопки читаются как несвязанные', () => {
    const wrapper = mount(GrButtonGroup, { slots: { default: '<button>A</button>' } })

    expect(wrapper.attributes('role')).toBe('group')
  })

  it('принимает доступное имя группы', () => {
    const wrapper = mount(GrButtonGroup, {
      props: { ariaLabel: 'Режим отображения' },
      slots: { default: '<button>A</button>' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Режим отображения')
  })

  it('без ariaLabel не подставляет пустой атрибут', () => {
    // Пустой `aria-label` затирает имя, вычисленное из содержимого.
    const wrapper = mount(GrButtonGroup, { slots: { default: '<button>A</button>' } })

    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('сохраняет порядок и состав вложенных кнопок', () => {
    const wrapper = mount(GrButtonGroup, {
      slots: {
        default: () => [
          h(GrButton, null, { default: () => 'Первая' }),
          h(GrButton, null, { default: () => 'Вторая' }),
        ],
      },
    })

    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toEqual(['Первая', 'Вторая'])
  })

  it('кнопки растягиваются по высоте — иначе группа выглядит рваной', () => {
    const wrapper = mount(GrButtonGroup, { slots: { default: '<button>A</button>' } })

    expect(wrapper.classes()).toContain('items-stretch')
    expect(wrapper.classes()).toContain('inline-flex')
  })

  it('ориентация и режим склейки выражены атрибутами, а не классами CSS', () => {
    const horizontal = mountGroup()
    expect(horizontal.attributes('data-orientation')).toBe('horizontal')
    expect(horizontal.attributes('data-attached')).toBe('')

    const vertical = mountGroup({ orientation: 'vertical', attached: false })
    expect(vertical.attributes('data-orientation')).toBe('vertical')
    // Без склейки атрибута нет вовсе — CSS склейки на него и опирается.
    expect(vertical.attributes('data-attached')).toBeUndefined()
    expect(vertical.classes()).toContain('flex-col')
    expect(vertical.classes()).toContain('gap-2')
  })
})

describe('GrButtonGroup — оформление кнопок', () => {
  it('размер, вариант и тон группы доходят до кнопок', () => {
    const wrapper = mountGroup({ size: 'lg', variant: 'outline', tone: 'danger' })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('h-11')
    expect(button.attributes('data-gr-variant')).toBe('outline')
    expect(button.attributes('data-gr-tone')).toBe('danger')
  })

  it('проп самой кнопки сильнее группы', () => {
    const wrapper = mountGroup({ size: 'lg' }, { size: 'xs' })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].classes()).toContain('h-7')
    expect(buttons[1].classes()).toContain('h-11')
  })

  it('группа сильнее `GrConfigProvider`: она ближе к кнопке', () => {
    const Harness = defineComponent({
      components: { GrButton, GrButtonGroup, GrConfigProvider },
      template: `
        <GrConfigProvider size="xs">
          <GrButtonGroup size="lg">
            <GrButton>В группе</GrButton>
          </GrButtonGroup>
          <GrButton>Снаружи</GrButton>
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)
    const buttons = wrapper.findAll('button')

    expect(buttons[0].classes()).toContain('h-11')
    expect(buttons[1].classes()).toContain('h-7')
  })

  it('молчаливая группа не мешает провайдеру', () => {
    const Harness = defineComponent({
      components: { GrButton, GrButtonGroup, GrConfigProvider },
      template: `
        <GrConfigProvider size="xs">
          <GrButtonGroup>
            <GrButton>Кнопка</GrButton>
          </GrButtonGroup>
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('button').classes()).toContain('h-7')
  })
})
