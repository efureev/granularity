import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetGranularityDom } from '../../../testing'
import GrChip from '../../GrChip/GrChip.vue'
import GrChipGroup from '../GrChipGroup.vue'

/**
 * Группа — составной виджет, и проверяется здесь именно это: одна остановка
 * `Tab`, роли по режиму выбора, стрелка двигает фокус и **не** трогает модель.
 * Последнее легко потерять при правке: в `radiogroup` формы принято обратное.
 */
const TAGS = ['alpha', 'beta', 'gamma']

function mountGroup(groupProps: Record<string, unknown> = {}, chipProps: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    name: 'HarnessChipGroup',
    components: { GrChip, GrChipGroup },
    props: {
      groupProps: { type: Object, default: () => ({}) },
      chipProps: { type: Object, default: () => ({}) },
    },
    data: () => ({ tags: TAGS }),
    template: `
      <GrChipGroup v-bind="groupProps">
        <GrChip v-for="tag in tags" :key="tag" :value="tag" :label="tag" v-bind="chipProps" />
      </GrChipGroup>
    `,
  })

  return mount(Harness, { props: { groupProps, chipProps }, attachTo: document.body })
}

const chips = (wrapper: ReturnType<typeof mountGroup>) => wrapper.findAll('[data-gr-chip]')

afterEach(() => {
  resetGranularityDom()
})

describe('GrChipGroup', () => {
  it('множественный выбор объявляется listbox с option', () => {
    const wrapper = mountGroup({ modelValue: ['beta'] })

    expect(wrapper.get('[data-gr-chip-group]').attributes('role')).toBe('listbox')
    expect(wrapper.get('[data-gr-chip-group]').attributes('aria-multiselectable')).toBe('true')

    const list = chips(wrapper)
    expect(list.map(chip => chip.attributes('role'))).toEqual(['option', 'option', 'option'])
    expect(list.map(chip => chip.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])
    // Роль одна на весь набор: `aria-pressed` тут был бы вторым способом сказать то же.
    expect(list[0].attributes('aria-pressed')).toBeUndefined()
  })

  it('одиночный выбор объявляется radiogroup с radio', () => {
    const wrapper = mountGroup({ modelValue: 'beta', selection: 'single' })

    expect(wrapper.get('[data-gr-chip-group]').attributes('role')).toBe('radiogroup')
    expect(wrapper.get('[data-gr-chip-group]').attributes('aria-multiselectable')).toBeUndefined()

    const list = chips(wrapper)
    expect(list.map(chip => chip.attributes('role'))).toEqual(['radio', 'radio', 'radio'])
    expect(list.map(chip => chip.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])
  })

  it('множественный выбор добавляет и убирает значение', async () => {
    const wrapper = mountGroup({ modelValue: ['beta'] })
    const group = wrapper.findComponent(GrChipGroup)

    await chips(wrapper)[0].trigger('click')
    expect(group.emitted('update:modelValue')?.[0]).toEqual([['beta', 'alpha']])

    await chips(wrapper)[1].trigger('click')
    expect(group.emitted('update:modelValue')?.[1]).toEqual([[]])
  })

  /**
   * Повторный выбор в одиночном режиме сбрасывает значение: набор фильтров без
   * выбранного осмыслен («любой»), и отменить выбор иначе было бы нечем.
   */
  it('одиночный выбор снимается повторным нажатием', async () => {
    const wrapper = mountGroup({ modelValue: 'beta', selection: 'single' })
    const group = wrapper.findComponent(GrChipGroup)

    await chips(wrapper)[1].trigger('click')
    expect(group.emitted('update:modelValue')?.[0]).toEqual([null])

    await chips(wrapper)[2].trigger('click')
    expect(group.emitted('update:modelValue')?.[1]).toEqual(['gamma'])
  })

  /**
   * Инвариант «ровно один `tabindex=0`» держится с первого тика, а не с первого
   * рендера: состав группа узнаёт из `setup` детей, а он идёт после того, как
   * ранние чипы уже отрисовались. Ровно так же ведёт себя `GrRadioGroup` в
   * слот-режиме — это свойство регистрации, а не чипов, и до кадра браузера оно
   * не доживает.
   */
  it('набор — одна остановка Tab', async () => {
    const wrapper = mountGroup({ modelValue: ['beta'] })
    await nextTick()

    const tabindexes = chips(wrapper).map(chip => chip.attributes('tabindex'))

    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
    // Остановку держит выбранный чип, а не первый попавшийся.
    expect(tabindexes).toEqual(['-1', '0', '-1'])
  })

  it('стрелка двигает фокус и не трогает модель', async () => {
    const wrapper = mountGroup({ modelValue: 'alpha', selection: 'single' })
    const group = wrapper.findComponent(GrChipGroup)

    await chips(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(chips(wrapper)[1].attributes('tabindex')).toBe('0')
    // Обратная сторона: дойти до нужного чипа нельзя ценой смены значения.
    expect(group.emitted('update:modelValue')).toBeUndefined()
  })

  it('Home и End уводят к краям набора', async () => {
    const wrapper = mountGroup({ modelValue: ['beta'] })

    await chips(wrapper)[1].trigger('keydown', { key: 'End' })
    await nextTick()
    expect(chips(wrapper)[2].attributes('tabindex')).toBe('0')

    await chips(wrapper)[2].trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(chips(wrapper)[0].attributes('tabindex')).toBe('0')
  })

  it('closable группы доезжает до чипов, и Delete снимает под фокусом', async () => {
    const wrapper = mountGroup({ modelValue: [], closable: true })
    const group = wrapper.findComponent(GrChipGroup)

    expect(chips(wrapper)[0].find('[data-gr-chip-close]').exists()).toBe(true)

    await chips(wrapper)[1].trigger('keydown', { key: 'Delete' })

    expect(group.emitted('remove')?.[0]).toEqual(['beta'])
    // Снятие — просьба: состав лежит у потребителя, и модель группа не меняет.
    expect(group.emitted('update:modelValue')).toBeUndefined()
  })

  it('выключенная группа гасит чипы', async () => {
    const wrapper = mountGroup({ modelValue: [], disabled: true })
    const group = wrapper.findComponent(GrChipGroup)

    expect(wrapper.get('[data-gr-chip-group]').attributes('aria-disabled')).toBe('true')
    expect(chips(wrapper).map(chip => chip.attributes('aria-disabled'))).toEqual(['true', 'true', 'true'])

    await chips(wrapper)[0].trigger('click')
    expect(group.emitted('update:modelValue')).toBeUndefined()
  })

  it('readonly показывает выбор, но не даёт его менять', async () => {
    const wrapper = mountGroup({ modelValue: ['beta'], readonly: true, closable: true })
    const group = wrapper.findComponent(GrChipGroup)

    expect(wrapper.get('[data-gr-chip-group]').attributes('aria-readonly')).toBe('true')
    expect(chips(wrapper)[1].attributes('aria-selected')).toBe('true')
    // Только для чтения снимает и крестик: он обещал бы действие, которого нет.
    expect(chips(wrapper)[1].find('[data-gr-chip-close]').exists()).toBe(false)

    await chips(wrapper)[0].trigger('click')
    expect(group.emitted('update:modelValue')).toBeUndefined()
  })

  /**
   * Значение уходит в форму скрытыми полями рядом с чипами: внутрь роли-виджета
   * нельзя вкладывать интерактивное, и скрытый `<input>` исключением не является.
   */
  it('name отдаёт значение нативной форме по полю на значение', () => {
    const wrapper = mountGroup({ modelValue: ['alpha', 'gamma'], name: 'tags' })

    const hidden = wrapper.findAll('input[type="hidden"]')

    expect(hidden.map(input => input.attributes('value'))).toEqual(['alpha', 'gamma'])
    expect(hidden.every(input => input.attributes('name') === 'tags')).toBe(true)
    // Без `name` в форму ничего не уходит — поля не появляются вовсе.
    expect(mountGroup({ modelValue: ['alpha'] }).findAll('input[type="hidden"]')).toHaveLength(0)
  })

  it('выбранный чип в наборе отличается заливкой, а не только контуром', () => {
    const wrapper = mountGroup({ modelValue: ['beta'], tone: 'primary' })
    const [unselected, selected] = chips(wrapper)

    expect(selected.attributes('class')).toContain('--gr-badge-primary-bg')
    expect(unselected.attributes('class')).toContain('var(--gr-accent)')
    expect(unselected.attributes('class')).not.toContain('--gr-badge-primary-bg')
  })

  it('размер группы доезжает до чипов, а проп чипа сильнее', () => {
    const fromGroup = mountGroup({ modelValue: [], size: 'lg' })
    expect(chips(fromGroup)[0].attributes('class')).toContain('--gr-control-text-lg')

    const fromChip = mountGroup({ modelValue: [], size: 'lg' }, { size: 'xs' })
    expect(chips(fromChip)[0].attributes('class')).toContain('--gr-control-text-xs')
  })
})
