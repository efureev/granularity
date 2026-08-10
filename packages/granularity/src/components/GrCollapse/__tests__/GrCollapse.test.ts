import { flushPromises, mount } from '@vue/test-utils'
import type { PropType } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrCard from '../../GrCard/GrCard.vue'
import { GR_CONFIG_KEY } from '../../GrConfigProvider/context'

vi.mock('~icons/lucide/chevron-down', () => {
  return {
    default: defineComponent({
      name: 'IconChevronDown',
      template: '<svg data-icon="chevron-down" />',
    }),
  }
})

import GrCollapse, { GrCollapseItem, type GrCollapseModelValue } from '..'

const CollapseHarness = defineComponent({
  name: 'CollapseHarness',
  components: {
    GrCollapse,
    GrCollapseItem,
  },
  props: {
    accordion: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    divided: {
      type: Boolean,
      default: true,
    },
    initialValue: {
      type: [Array, String, Number] as PropType<GrCollapseModelValue>,
      default: undefined,
    },
    secondDisabled: {
      type: Boolean,
      default: false,
    },
    borderless: {
      type: Boolean,
      default: false,
    },
    headingLevel: {
      type: Number as PropType<2 | 3 | 4 | 5 | 6>,
      default: undefined,
    },
    expandIconPosition: {
      type: String as PropType<'start' | 'end'>,
      default: undefined,
    },
    size: {
      type: String as PropType<'xs' | 'sm' | 'md' | 'lg'>,
      default: undefined,
    },
    beforeChange: {
      type: Function as PropType<(name: string | number, expanding: boolean) => boolean | void | Promise<boolean | void>>,
      default: undefined,
    },
  },
  setup(props) {
    const value = ref<GrCollapseModelValue>(props.initialValue)

    return {
      value,
    }
  },
  template: `
    <GrCollapse
      v-model="value"
      :accordion="accordion"
      :disabled="disabled"
      :divided="divided"
      :borderless="borderless"
      :heading-level="headingLevel"
      :expand-icon-position="expandIconPosition"
      :size="size"
      :before-change="beforeChange"
    >
      <GrCollapseItem name="first" title="First item">
        First body
      </GrCollapseItem>
      <GrCollapseItem name="second" title="Second item" :disabled="secondDisabled">
        Second body
      </GrCollapseItem>
    </GrCollapse>
  `,
})

describe('GrCollapse', () => {
  it('раскрывает несколько элементов и эмитит новый массив значений', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        initialValue: ['first'],
      },
    })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')
    const regions = wrapper.findAll('[role="region"]')

    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
    expect(regions[0].classes()).toContain('grid-rows-[1fr]')
    expect(regions[1].classes()).toContain('grid-rows-[0fr]')

    await triggers[1].trigger('click')

    expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([
      [['first', 'second']],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('true')
    expect(regions[1].classes()).toContain('grid-rows-[1fr]')
  })

  it('в accordion-режиме оставляет раскрытым только один элемент и позволяет свернуть его повторно', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        accordion: true,
        initialValue: 'first',
      },
    })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')

    await triggers[1].trigger('click')
    await triggers[1].trigger('click')

    expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([
      ['second'],
      [undefined],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('false')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
  })

  it('не переключает disabled-элемент и сохраняет активность для доступных item', async () => {
    const wrapper = mount(CollapseHarness, {
      props: {
        secondDisabled: true,
      },
    })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')

    expect(triggers[1].attributes('disabled')).toBeDefined()

    await triggers[1].trigger('click')
    await triggers[0].trigger('click')

    expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([
      [['first']],
    ])
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('false')
  })

  it('связывает заголовок и панель, а свёрнутую панель делает inert', () => {
    const wrapper = mount(CollapseHarness, {
      props: { initialValue: ['first'] },
    })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')
    const regions = wrapper.findAll('[role="region"]')

    for (const [index, trigger] of triggers.entries()) {
      expect(trigger.attributes('aria-controls')).toBe(regions[index].attributes('id'))
      expect(regions[index].attributes('aria-labelledby')).toBe(trigger.attributes('id'))
    }

    // Свёрнутая панель не просто нулевой высоты: без `inert` её ссылки ловятся
    // Tab'ом, а скринридер читает содержимое закрытых секций подряд.
    expect(regions[0].attributes('inert')).toBeUndefined()
    expect(regions[1].attributes('inert')).toBeDefined()
  })

  it('клавиатура: стрелки, Home/End по заголовкам, Space/Enter — переключение', async () => {
    const wrapper = mount(CollapseHarness, { attachTo: document.body })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')
    const first = triggers[0].element as HTMLElement
    const second = triggers[1].element as HTMLElement

    first.focus()
    await triggers[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second)

    await triggers[1].trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(first)

    // Стрелки зациклены: с первого вверх — на последний.
    await triggers[0].trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(second)

    await triggers[1].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(first)

    await triggers[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(second)

    await triggers[0].trigger('keydown', { key: ' ' })
    await triggers[1].trigger('keydown', { key: 'Enter' })

    expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([
      [['first']],
      [['first', 'second']],
    ])

    wrapper.unmount()
  })

  // Вложенный аккордеон внутри раскрытой панели тоже помечен `[data-gr-collapse]`:
  // без фильтра стрелки внешнего перескакивали бы на заголовки внутреннего.
  it('стрелки ходят только по заголовкам своего аккордеона, минуя вложенный', async () => {
    const Nested = defineComponent({
      components: { GrCollapse, GrCollapseItem },
      template: `
        <GrCollapse :model-value="['outer-1']">
          <GrCollapseItem name="outer-1" title="Outer first">
            <GrCollapse :model-value="['inner']">
              <GrCollapseItem name="inner" title="Inner" data-inner />
            </GrCollapse>
          </GrCollapseItem>
          <GrCollapseItem name="outer-2" title="Outer second" />
        </GrCollapse>
      `,
    })

    const wrapper = mount(Nested, { attachTo: document.body })

    const triggers = wrapper.findAll('[data-gr-collapse-trigger]')
    expect(triggers).toHaveLength(3)

    const outerFirst = triggers[0].element as HTMLElement
    const outerSecond = wrapper.findAll('[data-gr-collapse-item]')
      .at(-1)!
      .find('[data-gr-collapse-trigger]').element as HTMLElement

    outerFirst.focus()
    await triggers[0].trigger('keydown', { key: 'ArrowDown' })

    expect(document.activeElement).toBe(outerSecond)

    // И обратно: End внешнего аккордеона тоже не должен уводить внутрь панели.
    await triggers[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(outerSecond)

    wrapper.unmount()
  })

  it('borderless рендерит аккордеон без обёртки в GrCard', () => {
    const withCard = mount(CollapseHarness)
    expect(withCard.findComponent(GrCard).exists()).toBe(true)
    expect(withCard.get('[data-gr-collapse]').classes()).toContain('rounded-[var(--gr-radius-lg)]')

    const borderless = mount(CollapseHarness, { props: { borderless: true } })
    expect(borderless.findComponent(GrCard).exists()).toBe(false)

    const root = borderless.get('[data-gr-collapse]')
    expect(root.classes()).toContain('divide-y')
    expect(root.findAll('[data-gr-collapse-item]')).toHaveLength(2)
  })

  it('headingLevel задаёт уровень заголовка секции, по умолчанию h3', () => {
    const byDefault = mount(CollapseHarness)
    expect(byDefault.findAll('h3')).toHaveLength(2)

    const deep = mount(CollapseHarness, { props: { headingLevel: 5 } })
    expect(deep.findAll('h3')).toHaveLength(0)
    expect(deep.findAll('h5')).toHaveLength(2)
    // Кнопка остаётся внутри заголовка — этого требует APG для accordion.
    expect(deep.get('h5').find('[data-gr-collapse-trigger]').exists()).toBe(true)
  })

  it('expandIconPosition переставляет шеврон перед заголовком', () => {
    const atEnd = mount(CollapseHarness)
    const endChildren = atEnd.get('[data-gr-collapse-trigger]').element.children
    expect(endChildren[endChildren.length - 1].hasAttribute('data-gr-collapse-chevron')).toBe(true)

    const atStart = mount(CollapseHarness, { props: { expandIconPosition: 'start' } })
    expect(atStart.get('[data-gr-collapse-trigger]').element.children[0].hasAttribute('data-gr-collapse-chevron')).toBe(true)
  })

  // `<button>` внутри `<button>` — невалидная разметка, axe ловит это как
  // `nested-interactive`, поэтому `#extra` живёт рядом с триггером.
  it('слот #extra рендерится рядом с триггером, а не внутри него', () => {
    const wrapper = mount(defineComponent({
      components: { GrCollapse, GrCollapseItem },
      template: `
        <GrCollapse>
          <GrCollapseItem name="one" title="One">
            <template #extra>
              <button type="button" data-extra-action>Action</button>
            </template>
            Body
          </GrCollapseItem>
        </GrCollapse>
      `,
    }))

    expect(wrapper.get('[data-gr-collapse-extra]').find('[data-extra-action]').exists()).toBe(true)
    expect(wrapper.get('[data-gr-collapse-trigger]').find('[data-extra-action]').exists()).toBe(false)
  })

  it('disabled гасится токеном фона, а не opacity', () => {
    const wrapper = mount(CollapseHarness, { props: { secondDisabled: true } })

    const [enabled, disabled] = wrapper.findAll('[data-gr-collapse-trigger]')

    expect(disabled.classes()).toContain('bg-[var(--gr-muted)]')
    expect(disabled.classes().some(cls => cls.includes('opacity'))).toBe(false)
    expect(enabled.classes().some(cls => cls.includes('opacity'))).toBe(false)
  })

  it('размер приходит из GrConfigProvider, локальный проп сильнее', () => {
    const provide = {
      [GR_CONFIG_KEY as symbol]: {
        size: computed(() => 'lg'),
        componentDefaults: computed(() => ({})),
      },
    }

    const fromConfig = mount(CollapseHarness, { global: { provide } })
    expect(fromConfig.get('[data-gr-collapse-trigger]').classes()).toContain('px-5')

    const localWins = mount(CollapseHarness, { props: { size: 'xs' }, global: { provide } })
    expect(localWins.get('[data-gr-collapse-trigger]').classes()).toContain('px-3')
  })

  describe('beforeChange', () => {
    it('отменяет переключение, когда guard вернул false', async () => {
      const beforeChange = vi.fn(() => false)
      const wrapper = mount(CollapseHarness, { props: { beforeChange } })

      await wrapper.get('[data-gr-collapse-trigger]').trigger('click')
      await flushPromises()

      expect(beforeChange).toHaveBeenCalledWith('first', true)
      expect(wrapper.findComponent(GrCollapse).emitted('change')).toBeUndefined()
      expect(wrapper.get('[data-gr-collapse-trigger]').attributes('aria-expanded')).toBe('false')
    })

    it('пропускает переключение после async-подтверждения', async () => {
      const beforeChange = vi.fn(async () => true)
      const wrapper = mount(CollapseHarness, { props: { beforeChange, initialValue: ['first'] } })

      await wrapper.get('[data-gr-collapse-trigger]').trigger('click')
      await flushPromises()

      // Второй аргумент — куда идёт секция: сворачивание, а не раскрытие.
      expect(beforeChange).toHaveBeenCalledWith('first', false)
      expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([[[]]])
    })

    it('не спрашивает guard повторно, пока предыдущий ответ не пришёл', async () => {
      let resolveGuard: (value: boolean) => void = () => {}
      const beforeChange = vi.fn(() => new Promise<boolean>((resolve) => {
        resolveGuard = resolve
      }))

      const wrapper = mount(CollapseHarness, { props: { beforeChange } })
      const trigger = wrapper.get('[data-gr-collapse-trigger]')

      await trigger.trigger('click')
      await trigger.trigger('click')
      expect(beforeChange).toHaveBeenCalledTimes(1)

      resolveGuard(true)
      await flushPromises()

      expect(wrapper.findComponent(GrCollapse).emitted('change')).toEqual([[['first']]])
    })
  })

  it('выбрасывает ошибку, если GrCollapseItem используется вне GrCollapse', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      expect(() => mount(GrCollapseItem, {
        props: {
          title: 'Standalone item',
        },
      })).toThrowError('GrCollapseItem must be used inside GrCollapse')
    }
    finally {
      consoleWarnSpy.mockRestore()
    }
  })
})

describe('GrCollapse — пустое состояние', () => {
  it('аккордеон без секций показывает текст из локали, а не пустую рамку', () => {
    const wrapper = mount(GrCollapse)

    expect(wrapper.get('[data-gr-collapse-empty]').text()).toBe('Nothing here yet')
  })

  it('`emptyText` сильнее локали, слот `#empty` сильнее обоих', () => {
    const withProp = mount(GrCollapse, { props: { emptyText: 'Нет разделов' } })
    expect(withProp.get('[data-gr-collapse-empty]').text()).toBe('Нет разделов')

    const withSlot = mount(GrCollapse, {
      props: { emptyText: 'Нет разделов' },
      slots: { empty: '<span data-custom>Настройте фильтр</span>' },
    })

    expect(withSlot.get('[data-custom]').text()).toBe('Настройте фильтр')
    expect(withSlot.get('[data-gr-collapse-empty]').text()).not.toContain('Нет разделов')
  })

  it('с секциями заглушки нет', () => {
    const wrapper = mount(CollapseHarness)

    expect(wrapper.find('[data-gr-collapse-empty]').exists()).toBe(false)
    expect(wrapper.findAll('[data-gr-collapse-item]')).toHaveLength(2)
  })

  it('`:empty="false"` подавляет автоопределение — секции приедут позже', () => {
    const wrapper = mount(GrCollapse, { props: { empty: false } })

    expect(wrapper.find('[data-gr-collapse-empty]').exists()).toBe(false)
  })

  /**
   * Ровно та ловушка, ради которой пустоту считает общий разборщик слота:
   * `v-if` оставляет после себя комментарий, `v-for` приходит фрагментом, а
   * шаблон — переносами строк. Наивная проверка «слот не пуст» считала бы всё
   * это содержимым и заглушку не показала бы никогда.
   */
  it('комментарии от `v-if` и пробелы содержимым не считаются', () => {
    const Harness = defineComponent({
      components: { GrCollapse, GrCollapseItem },
      props: { show: { type: Boolean, default: false } },
      template: `
        <GrCollapse>
          <GrCollapseItem v-if="show" name="a" title="A">body</GrCollapseItem>
          <GrCollapseItem v-for="name in []" :key="name" :name="name" title="X" />
        </GrCollapse>
      `,
    })

    const empty = mount(Harness)
    expect(empty.find('[data-gr-collapse-empty]').exists()).toBe(true)

    const filled = mount(Harness, { props: { show: true } })
    expect(filled.find('[data-gr-collapse-empty]').exists()).toBe(false)
  })

  it('заглушка живёт и в `borderless`, не ломая разделители секций', () => {
    const empty = mount(GrCollapse, { props: { borderless: true } })
    expect(empty.findComponent(GrCard).exists()).toBe(false)
    expect(empty.find('[data-gr-collapse-empty]').exists()).toBe(true)

    const filled = mount(CollapseHarness, { props: { borderless: true } })
    expect(filled.get('[data-gr-collapse]').classes()).toContain('divide-y')
  })
})
