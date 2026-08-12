import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/loader-circle', () => {
  return {
    default: defineComponent({
      name: 'IconLoader',
      template: '<svg data-icon="loader" />',
    }),
  }
})

import GrFormField from '../../GrFormField/GrFormField.vue'
import GrRadio from '../../GrRadio/GrRadio.vue'
import GrRadioGroup from '../GrRadioGroup.vue'

describe('GrRadioGroup', () => {
  it('рендерит options и эмитит update:modelValue для radiobox-варианта', async () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    })

    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(2)
    expect(radios[0].attributes('aria-checked')).toBe('true')

    await radios[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('оборачивает button-вариант в GrButtonGroup', () => {
    const wrapper = mount(GrRadioGroup, {
      props: {
        modelValue: 'a',
        variant: 'button',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    })

    expect(wrapper.find('[data-gr-button-group]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-button][role="radio"]').length).toBe(2)
  })
})

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', description: 'Второй вариант' },
  { value: 'c', label: 'Option C', disabled: true },
]

describe('GrRadioGroup — опции', () => {
  // Раньше отключить одну опцию можно было только через слот.
  it('опция умеет быть отключённой и с описанием', () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    const radios = wrapper.findAll('[data-gr-radio]')

    expect(radios[2].attributes('aria-disabled')).toBe('true')
    expect(radios[2].attributes('tabindex')).toBe('-1')
    expect(wrapper.get('[data-gr-radio-description]').text()).toBe('Второй вариант')
  })

  it('отключённая опция работает и в кнопочном варианте', () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', variant: 'button', options } })

    expect(wrapper.findAll('[data-gr-radio]')[2].attributes('aria-disabled')).toBe('true')
  })

  it('отключённая опция пропускается стрелками', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'b', options } })

    await wrapper.findAll('[data-gr-radio]')[1].trigger('keydown', { key: 'ArrowDown' })

    // За `b` идёт отключённый `c`, поэтому выбор уходит по кругу на `a`.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })
})

describe('GrRadioGroup — раскладка', () => {
  it('по умолчанию вертикальная, horizontal переводит в ряд', () => {
    const vertical = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    expect(vertical.get('[data-gr-radio-group] > div').classes()).toContain('grid')

    const horizontal = mount(GrRadioGroup, { props: { modelValue: 'a', options, orientation: 'horizontal' } })
    expect(horizontal.get('[data-gr-radio-group] > div').classes()).toContain('flex')
  })
})

describe('GrRadioGroup — состояния', () => {
  it('readonly не меняет выбор и не обещает клик курсором', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options, readonly: true } })
    const radios = wrapper.findAll('[data-gr-radio]')

    await radios[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    expect(wrapper.get('[data-gr-radio-group]').attributes('aria-readonly')).toBe('true')
    expect(radios[0].classes()).toContain('cursor-default')
  })

  it('внутри GrFormField берёт имя, описание и состояние ошибки', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrRadioGroup },
      data: () => ({ value: 'a', options }),
      template: `
        <GrFormField label="Статус" hint="Виден в списке" error="Выберите статус" required>
          <GrRadioGroup v-model="value" :options="options" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)
    const group = wrapper.get('[data-gr-radio-group]')

    expect(group.attributes('aria-labelledby')).toBeTruthy()
    expect(group.attributes('aria-describedby')).toBeTruthy()
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(group.attributes('aria-required')).toBe('true')
    // Ошибка поля доходит и до вида переключателей.
    expect(wrapper.findAll('[data-gr-radio]')[0].attributes('aria-invalid')).toBe('true')
  })

  it('слотовый режим получает те же раскладку и контекст', () => {
    const Harness = defineComponent({
      components: { GrRadioGroup, GrRadio },
      data: () => ({ value: 'a' }),
      template: `
        <GrRadioGroup v-model="value" orientation="horizontal" disabled>
          <GrRadio value="a">A</GrRadio>
          <GrRadio value="b">B</GrRadio>
        </GrRadioGroup>
      `,
    })

    const wrapper = mount(Harness)

    expect(wrapper.get('[data-gr-radio-group] > div').classes()).toContain('flex')
    expect(wrapper.findAll('[data-gr-radio]')[1].attributes('aria-disabled')).toBe('true')
  })
})

/**
 * Кольцо roving-фокуса собрано на общем `useRovingFocus` и живёт в группе:
 * состав переключателей знает только она. Инвариант паттерна `radiogroup` —
 * ровно одна остановка `Tab` на группу; ноль означает, что до переключателей
 * не добраться с клавиатуры вовсе, и увидеть это можно только счётом.
 */
describe('GrRadioGroup — остановка Tab и клавиатура', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B', disabled: true },
    { value: 'c', label: 'C' },
  ]

  function stops(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[role="radio"]')
      .map(radio => radio.attributes('tabindex'))
  }

  it('остановка стоит на выбранном переключателе', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'c', options } })
    await nextTick()

    expect(stops(wrapper)).toEqual(['-1', '-1', '0'])
  })

  it('выбранный выключенный переключатель не забирает группу из таб-порядка', async () => {
    // На выключенном `GrRadio` ставит `tabindex="-1"` сам, поэтому остановка,
    // назначенная ему, отрисовалась бы как её отсутствие: ни один элемент не
    // получил бы `0`, и группа выпала бы из обхода целиком.
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'b', options } })
    await nextTick()
    await nextTick()

    expect(stops(wrapper)).toEqual(['0', '-1', '-1'])
  })

  it('стрелка переносит и выбор, и остановку, перешагивая выключенный', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    await nextTick()

    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])
  })

  it('кольцо замкнуто: с последнего вперёд — на первый', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'c', options } })
    await nextTick()

    await wrapper.findAll('[role="radio"]')[2].trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })

  it('обе оси стрелок работают — требование паттерна radiogroup', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    await nextTick()

    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowUp' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])
  })

  it('Home и End ведут на края доступного набора', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options } })
    await nextTick()

    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])

    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })

  it('readonly не даёт стрелке поменять выбор', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options, readonly: true } })
    await nextTick()

    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
