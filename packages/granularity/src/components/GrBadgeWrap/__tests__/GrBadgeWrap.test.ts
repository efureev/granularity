import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrBadgeWrap from '../GrBadgeWrap.vue'
import { formatBadgeValue, isBadgeWrapPulse } from '../grBadgeWrapStyles'

describe('GrBadgeWrap', () => {
  it('рендерит слот без бейджа по умолчанию', () => {
    const wrapper = mount(GrBadgeWrap, {
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    expect(wrapper.html()).toContain('Inbox')
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(0)
  })

  it('показывает dot-индикатор, когда dot=true', () => {
    const wrapper = mount(GrBadgeWrap, {
      props: {
        dot: true,
      },
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    const badges = wrapper.findAll('[aria-hidden="true"]')

    expect(badges).toHaveLength(1)
    expect(badges[0].attributes('class')).toContain('h-2')
    expect(badges[0].text()).toBe('')
  })

  it('показывает числовое значение, когда value задан и dot=false', () => {
    const wrapper = mount(GrBadgeWrap, {
      props: {
        value: 7,
      },
      slots: {
        default: '<button>Inbox</button>',
      },
    })

    const badge = wrapper.get('[data-gr-badge-wrap-count]')

    expect(badge.text()).toBe('7')
    expect(badge.attributes('class')).toContain('min-w-5')
    expect(badge.attributes('class')).toContain('text-[length:var(--gr-text-2xs)]')
  })
})
describe('GrBadgeWrap — счётчик и его озвучивание', () => {
  it('число объявляется словами, а не пропадает вместе с aria-hidden', () => {
    const wrapper = mount(GrBadgeWrap, {
      props: { value: 3 },
      slots: { default: '<button>Inbox</button>' },
    })

    // Само число декоративно, потому что рядом идёт полноценная подпись:
    // раньше «3 непрочитанных» для диктора просто не существовало.
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('aria-hidden')).toBe('true')
    const label = wrapper.get('[data-gr-badge-wrap-label]')
    expect(label.classes()).toContain('sr-only')
    expect(label.text()).toBe('3 new')
  })

  it('ariaLabel перебивает подпись из локали', () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 3, ariaLabel: 'три задачи' } })

    expect(wrapper.get('[data-gr-badge-wrap-label]').text()).toBe('три задачи')
  })

  it('max сворачивает число, но озвучивает настоящее', () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 120, max: 99 } })

    expect(wrapper.get('[data-gr-badge-wrap-count]').text()).toBe('99+')
    // «99 плюс» пользователю ничего не говорит.
    expect(wrapper.get('[data-gr-badge-wrap-label]').text()).toBe('120 new')
  })

  it('ноль скрыт, пока не попросили showZero', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 0 } })
    expect(wrapper.find('[data-gr-badge-wrap-count]').exists()).toBe(false)

    await wrapper.setProps({ showZero: true })
    expect(wrapper.get('[data-gr-badge-wrap-count]').text()).toBe('0')
  })

  it('точка молчит, пока ей не дали подпись', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { dot: true } })

    expect(wrapper.get('[data-gr-badge-wrap-dot]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-gr-badge-wrap-label]').exists()).toBe(false)

    await wrapper.setProps({ ariaLabel: 'есть новое' })
    expect(wrapper.get('[data-gr-badge-wrap-label]').text()).toBe('есть новое')
  })
})

describe('GrBadgeWrap — тон и положение', () => {
  it('tone красит бейдж из шкалы пакета', () => {
    const danger = mount(GrBadgeWrap, { props: { value: 1 } })
    expect(danger.get('[data-gr-badge-wrap-count]').classes()).toContain('bg-[var(--gr-danger)]')

    const success = mount(GrBadgeWrap, { props: { value: 1, tone: 'success' } })
    const badge = success.get('[data-gr-badge-wrap-count]')
    expect(badge.classes()).toContain('bg-[var(--gr-success)]')
    // Текст берётся из `-fg`, а не из белого литерала: он переживает смену темы.
    expect(badge.classes()).toContain('text-[var(--gr-success-fg)]')
  })

  it('placement двигает бейдж по углам, смещение — из переменных', () => {
    const topRight = mount(GrBadgeWrap, { props: { value: 1 } })
    expect(topRight.get('[data-gr-badge-wrap-count]').classes())
      .toContain('right-[var(--gr-badge-wrap-offset-x,-0.5rem)]')

    const bottomLeft = mount(GrBadgeWrap, { props: { value: 1, placement: 'bottom-left' } })
    const badge = bottomLeft.get('[data-gr-badge-wrap-count]')
    expect(badge.classes()).toContain('left-[var(--gr-badge-wrap-offset-x,-0.5rem)]')
    expect(badge.classes()).toContain('bottom-[var(--gr-badge-wrap-offset-y,-0.5rem)]')
  })

  it('formatBadgeValue — чистая функция', () => {
    expect(formatBadgeValue(5)).toBe('5')
    expect(formatBadgeValue(120, 99)).toBe('99+')
    expect(formatBadgeValue(99, 99)).toBe('99')
    // Строковое значение обрезать нечем — отдаём как есть.
    expect(formatBadgeValue('NEW', 99)).toBe('NEW')
  })
})

describe('GrBadgeWrap — анимация счётчика', () => {
  it('isBadgeWrapPulse отмечает прибавление и молчит на убыли', () => {
    expect(isBadgeWrapPulse(undefined, 3)).toBe(true)
    expect(isBadgeWrapPulse(3, 7)).toBe(true)

    expect(isBadgeWrapPulse(7, 2)).toBe(false)
    expect(isBadgeWrapPulse(2, undefined)).toBe(false)
    expect(isBadgeWrapPulse(undefined, undefined)).toBe(false)
    expect(isBadgeWrapPulse(3, 3)).toBe(false)

    // Порядка у строк нет, поэтому событием считается любая смена.
    expect(isBadgeWrapPulse('NEW', 'HOT')).toBe(true)
    expect(isBadgeWrapPulse('NEW', 'NEW')).toBe(false)
  })

  it('без animate значение меняется молча', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 1 } })

    await wrapper.setProps({ value: 5 })

    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBeUndefined()
  })

  it('с animate рост помечает счётчик, animationend снимает пометку', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 1, animate: true } })

    await wrapper.setProps({ value: 2 })
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBe('true')

    await wrapper.get('[data-gr-badge-wrap-count]').trigger('animationend')
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBeUndefined()
  })

  it('появление счётчика анимируется, первый рендер — нет', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 3, animate: true } })

    // Страница, на которой при загрузке пульсируют все бейджи разом, — тот же шум.
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBeUndefined()

    await wrapper.setProps({ value: 0 })
    await wrapper.setProps({ value: 1 })
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBe('true')
  })

  it('пачка изменений даёт один «поп», а не мельтешение', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 1, animate: true } })

    await wrapper.setProps({ value: 2 })
    await wrapper.setProps({ value: 3 })
    await wrapper.setProps({ value: 4 })

    const badge = wrapper.get('[data-gr-badge-wrap-count]')
    expect(badge.text()).toBe('4')

    // Перезапуска не было: единственный animationend оставляет счётчик чистым.
    await badge.trigger('animationend')
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBeUndefined()
  })

  it('убыль значения счётчик не помечает', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 9, animate: true } })

    await wrapper.setProps({ value: 4 })

    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBeUndefined()
  })

  it('счётчик, исчезнувший во время анимации, снова анимируется при появлении', async () => {
    const wrapper = mount(GrBadgeWrap, { props: { value: 1, animate: true } })

    await wrapper.setProps({ value: 2 })
    // `animationend` от удалённого элемента не придёт — флаг обязан сняться сам.
    await wrapper.setProps({ value: 0 })
    expect(wrapper.find('[data-gr-badge-wrap-count]').exists()).toBe(false)

    await wrapper.setProps({ value: 1 })
    expect(wrapper.get('[data-gr-badge-wrap-count]').attributes('data-gr-badge-wrap-pop')).toBe('true')
  })
})
