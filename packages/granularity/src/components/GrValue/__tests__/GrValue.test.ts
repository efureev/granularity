import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrValue from '../GrValue.vue'

describe('GrValue', () => {
  it('печатает величину с приписками в порядке «префикс, значение, суффикс»', () => {
    const wrapper = mount(GrValue, { props: { value: '14,99', prefix: '$', suffix: 'за заказ' } })

    expect(wrapper.get('[data-gr-value-prefix]').text()).toBe('$')
    expect(wrapper.get('[data-gr-value-number]').text()).toBe('14,99')
    expect(wrapper.get('[data-gr-value-suffix]').text()).toBe('за заказ')
    expect(wrapper.text()).toBe('$14,99за заказ')
  })

  it('незаданная приписка узла не занимает', () => {
    const wrapper = mount(GrValue, { props: { value: 42 } })

    expect(wrapper.find('[data-gr-value-prefix]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-value-suffix]').exists()).toBe(false)
  })

  // Величина — не обязательно число: примитив ничего не форматирует.
  it.each(['2 ч 15 мин', '—', ''])('значение выводится как есть (%s)', (value) => {
    const wrapper = mount(GrValue, { props: { value } })

    expect(wrapper.get('[data-gr-value-number]').text()).toBe(value)
  })
})

describe('GrValue — оформление приписок', () => {
  /**
   * Дефолты в токенах, а не в решении компонента. Проверяется, что фолбэк
   * записан именно так: `inherit` у префикса и есть то «по умолчанию как
   * величина», ради которого тон доезжает до валюты сам.
   */
  it('префикс по умолчанию наследует цвет и кегль величины, без отбивки', () => {
    const prefix = mount(GrValue, { props: { value: 1, prefix: '$' } }).get('[data-gr-value-prefix]').classes()

    expect(prefix).toContain('text-[var(--gr-value-prefix-color,inherit)]')
    expect(prefix).toContain('text-[length:var(--gr-value-prefix-size,inherit)]')
    expect(prefix).toContain('me-[var(--gr-value-prefix-gap,0)]')
  })

  it('суффикс по умолчанию приглушён, мельче и отбит', () => {
    const suffix = mount(GrValue, { props: { value: 1, suffix: '%' } }).get('[data-gr-value-suffix]').classes()

    expect(suffix).toContain('text-[var(--gr-value-suffix-color,var(--gr-muted-fg))]')
    expect(suffix).toContain('text-[length:var(--gr-value-suffix-size,0.85em)]')
    expect(suffix).toContain('ms-[var(--gr-value-suffix-gap,0.25rem)]')
  })

  /**
   * Фолбэк у префикса — `inherit`, и это законно: там оно стоит **значением
   * свойства** `color`/`font-size`. А вот в самом токене `inherit` значит
   * «наследовать переменную», то есть ничего: рецепт «сделать приписку частью
   * величины» пишется через `currentColor` и `1em`. Грабля молчаливая —
   * переопределение просто не срабатывает, — поэтому зафиксирована здесь.
   */
  it('фолбэк префикса — inherit как значение свойства, а не как токен', () => {
    const prefix = mount(GrValue, { props: { value: 1, prefix: '$' } }).get('[data-gr-value-prefix]').classes()

    expect(prefix.join(' ')).toContain(',inherit)')
    expect(prefix.join(' ')).not.toContain(':inherit')
  })

  // В RTL отбивка обязана встать с другой стороны, иначе суффикс прилипнет.
  it('отбивка задана логическим отступом, а не левым-правым', () => {
    const suffix = mount(GrValue, { props: { value: 1, suffix: '%' } }).get('[data-gr-value-suffix]').classes()

    expect(suffix.some(cls => cls.startsWith('ml-') || cls.startsWith('mr-'))).toBe(false)
  })
})

describe('GrValue — слоты', () => {
  it('слоты замещают приписки и значение', () => {
    const wrapper = mount(GrValue, {
      props: { value: 1, prefix: '$', suffix: '%' },
      slots: { default: 'своё', prefix: '€', suffix: 'шт' },
    })

    expect(wrapper.get('[data-gr-value-number]').text()).toBe('своё')
    expect(wrapper.get('[data-gr-value-prefix]').text()).toBe('€')
    expect(wrapper.get('[data-gr-value-suffix]').text()).toBe('шт')
  })

  it('слот приписки включает её узел без пропа', () => {
    const wrapper = mount(GrValue, { props: { value: 1 }, slots: { suffix: '<b>шт</b>' } })

    expect(wrapper.get('[data-gr-value-suffix]').html()).toContain('<b>шт</b>')
  })

  // `lead` — знак у `GrDelta`: он обязан встать перед валютой, а не после неё.
  it('lead идёт перед префиксом, trail — после значения', () => {
    const wrapper = mount(GrValue, {
      props: { value: '0,028', prefix: '$' },
      slots: { lead: '+', trail: '<i data-final>0,03</i>' },
    })

    expect(wrapper.text()).toBe('+$0,0280,03')
    expect(wrapper.get('[data-gr-value-number]').text()).toBe('0,028')
    expect(wrapper.find('[data-final]').exists()).toBe(true)
  })

  /**
   * Приписки читаются вслух — прятать их нельзя.
   *
   * `aria-hidden` на префиксе выглядит безобидно (значок же декоративный), но
   * тогда «$14,99» превращается в «14,99», а «42 %» — в «42». Единица измерения
   * и валюта — часть величины, а не украшение, и потерять их дороже, чем
   * услышать лишний символ.
   */
  it('префикс и суффикс не спрятаны от скринридера', () => {
    const wrapper = mount(GrValue, { props: { value: '14,99', prefix: '$', suffix: '%' } })

    expect(wrapper.get('[data-gr-value-prefix]').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('[data-gr-value-suffix]').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('[data-gr-value-number]').attributes('aria-hidden')).toBeUndefined()
  })

  // Примитив показывает величину и не притворяется виджетом.
  it('не навешивает ни роли, ни aria-атрибутов', () => {
    const wrapper = mount(GrValue, { props: { value: 42, prefix: '$', suffix: '%' } })

    for (const el of [wrapper.element, ...wrapper.element.querySelectorAll('*')]) {
      expect(el.getAttribute('role')).toBeNull()
      expect([...el.attributes].map(a => a.name).filter(name => name.startsWith('aria-'))).toEqual([])
    }
  })
})
