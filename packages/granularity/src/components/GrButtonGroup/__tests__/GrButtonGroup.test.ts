import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrButton from '../../GrButton/GrButton.vue'
import GrButtonGroup from '../GrButtonGroup.vue'

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
})
