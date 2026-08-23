import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrRating from '../GrRating.vue'

describe('GrRating', () => {
  it('рендерит шкалу с WAI-ARIA slider-контрактом', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, max: 5, ariaLabel: 'Оценка отеля' } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    expect(scale.attributes('role')).toBe('slider')
    expect(scale.attributes('aria-valuemin')).toBe('0')
    expect(scale.attributes('aria-valuemax')).toBe('5')
    expect(scale.attributes('aria-valuenow')).toBe('3')
    expect(scale.attributes('aria-valuetext')).toBe('3 of 5')
    expect(scale.attributes('aria-label')).toBe('Оценка отеля')
    expect(scale.attributes('tabindex')).toBe('0')
    expect(wrapper.findAll('[data-gr-rating-symbol]')).toHaveLength(5)
  })

  it('заливает символы пропорционально значению (включая половину)', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2.5, max: 5, allowHalf: true } })
    const widths = wrapper.findAll('[data-gr-rating-fill]').map(el => el.attributes('style'))

    expect(widths[0]).toContain('width: 100%')
    expect(widths[1]).toContain('width: 100%')
    expect(widths[2]).toContain('width: 50%')
    expect(widths[3]).toContain('width: 0%')
  })

  it('клик по символу выставляет оценку', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 0 } })
    await wrapper.get('[data-testid="gr-rating-symbol-2"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([3])
  })

  it('clearable: повторный клик по текущей оценке сбрасывает её', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, clearable: true } })
    await wrapper.get('[data-testid="gr-rating-symbol-2"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    // Снятие оценки объявляется отдельно: по `update:modelValue` со значением 0
    // потребитель не отличит сброс от честной нулевой оценки.
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('без clearable сброса нет — и события тоже', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3 } })
    await wrapper.get('[data-testid="gr-rating-symbol-2"]').trigger('click')

    expect(wrapper.emitted('clear')).toBeUndefined()
  })

  it('стрелки меняют оценку на шаг, Home/End — к границам', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, max: 5 } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    await scale.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])

    await scale.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])

    await scale.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])

    await scale.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5])
  })

  it('allowHalf: шаг клавиатуры — половина символа', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, allowHalf: true } })
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2.5])
  })

  it('значение клампится границами шкалы', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 5, max: 5 } })
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue') ?? []).toHaveLength(0)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([5])
  })

  it('readonly: показ без ввода — role="img" и оценка в подписи', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 4, readonly: true, ariaLabel: 'Оценка' } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    expect(scale.attributes('role')).toBe('img')
    expect(scale.attributes('tabindex')).toBeUndefined()
    expect(scale.attributes('aria-label')).toBe('Оценка: 4 of 5')

    await wrapper.get('[data-testid="gr-rating-symbol-0"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('disabled: не реагирует на клик и помечен aria-disabled', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, disabled: true } })

    const scale = wrapper.get('[data-testid="gr-rating-scale"]')
    // Отключённый контрол остаётся slider-ом (штатный ARIA-паттерн), но вне таб-порядка.
    expect(scale.attributes('role')).toBe('slider')
    expect(scale.attributes('aria-disabled')).toBe('true')
    expect(scale.attributes('tabindex')).toBe('-1')
    await wrapper.get('[data-testid="gr-rating-symbol-4"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('hover показывает предпросмотр оценки, уход курсора его снимает', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 1 } })

    await wrapper.get('[data-testid="gr-rating-symbol-3"]').trigger('mousemove')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([4])
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuenow')).toBe('4')

    // Обработчик висит на самой шкале: уход курсора с неё снимает предпросмотр,
    // даже если курсор остался внутри компонента — например, на подписи.
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('mouseleave')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([null])
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuenow')).toBe('1')
  })
})

describe('GrRating — предпросмотр', () => {
  it('перевод курсора со шкалы на подпись снимает предпросмотр', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 1, showText: true } })

    await wrapper.get('[data-testid="gr-rating-symbol-3"]').trigger('mousemove')
    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('4')

    // Подпись лежит внутри `[data-gr-rating]`: раньше обработчик висел там, и
    // курсор, ушедший на текст, из контейнера не выходил — предпросмотр залипал.
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('mouseleave')

    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('1')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([null])
  })

  it('потеря фокуса тоже снимает предпросмотр', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2 } })

    await wrapper.get('[data-testid="gr-rating-symbol-4"]').trigger('mousemove')
    await wrapper.get('[data-testid="gr-rating-scale"]').trigger('blur')

    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuenow')).toBe('2')
    expect(wrapper.emitted('hoverChange')?.at(-1)).toEqual([null])
  })

  it('в readonly предпросмотра нет', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2, readonly: true } })

    await wrapper.get('[data-testid="gr-rating-symbol-4"]').trigger('mousemove')

    expect(wrapper.emitted('hoverChange')).toBeFalsy()
  })
})

describe('GrRating — подписи делений и компактный вид', () => {
  const texts = ['Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично']

  it('подпись деления уходит и в текст, и в aria-valuetext', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, texts, showText: true } })

    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('Нормально')
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuetext'))
      .toBe('3 of 5, Нормально')
  })

  it('половинка округляется вверх до своего деления', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 2.5, texts, allowHalf: true, showText: true } })

    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('Нормально')
  })

  it('formatText сильнее texts', () => {
    const wrapper = mount(GrRating, {
      props: { modelValue: 3, texts, showText: true, formatText: (value: number) => `${value}/5` },
    })

    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('3/5')
  })

  it('короткий массив подписей не ломает шкалу', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 5, texts: ['Плохо'], showText: true } })

    expect(wrapper.get('[data-gr-rating-text]').text()).toBe('5')
    expect(wrapper.get('[data-testid="gr-rating-scale"]').attributes('aria-valuetext')).toBe('5 of 5')
  })

  it('compact рисует только заполненные символы', () => {
    const full = mount(GrRating, { props: { modelValue: 3, readonly: true } })
    expect(full.findAll('[data-gr-rating-symbol]')).toHaveLength(5)

    const compact = mount(GrRating, { props: { modelValue: 3, readonly: true, compact: true } })
    expect(compact.findAll('[data-gr-rating-symbol]')).toHaveLength(3)

    // Половинка — тоже символ: иначе «2.5» потеряло бы половину звезды.
    const half = mount(GrRating, { props: { modelValue: 2.5, readonly: true, compact: true, allowHalf: true } })
    expect(half.findAll('[data-gr-rating-symbol]')).toHaveLength(3)
  })
})

describe('GrRating — оформление и размеры', () => {
  it('disabled гасится токеном, а не прозрачностью', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, disabled: true } })
    const scale = wrapper.get('[data-testid="gr-rating-scale"]')

    expect(scale.classes()).toContain('text-[var(--gr-disabled-fg)]')
    expect(scale.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('xs из GrConfigProvider доходит до шкалы', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrRating },
      template: `
        <GrConfigProvider size="xs">
          <GrRating :model-value="3" />
        </GrConfigProvider>
      `,
    })

    const symbol = mount(Harness).get('[data-gr-rating-symbol]')
    expect(symbol.classes().join(' ')).toContain('0.875rem')
  })
})

describe('GrRating — name (нативная форма)', () => {
  it('с `name` рендерит hidden input со значением; 0 — «не выбрано», без input', async () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, name: 'score', ariaLabel: 'Score' } })
    const hidden = wrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('score')
    expect((hidden.element as HTMLInputElement).value).toBe('3')

    await wrapper.setProps({ modelValue: 0 })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('без `name` hidden input отсутствует', () => {
    const wrapper = mount(GrRating, { props: { modelValue: 3, ariaLabel: 'Score' } })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('GrRating — символ иконкой', () => {
  const CustomIcon = defineComponent({ name: 'CustomIcon', render: () => h('svg', { 'data-custom-icon': '' }) })

  it('класс от потребителя уезжает на `span`, компонент рисуется как есть', () => {
    const byClass = mount(GrRating, { props: { modelValue: 3, icon: 'i-lucide-heart' } })
    expect(byClass.find('span.i-lucide-heart').exists()).toBe(true)

    const byComponent = mount(GrRating, { props: { modelValue: 3, icon: CustomIcon } })
    expect(byComponent.find('[data-custom-icon]').exists()).toBe(true)
  })
})
