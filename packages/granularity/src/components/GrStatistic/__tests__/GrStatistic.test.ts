import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrStatistic from '../GrStatistic.vue'
import { granularityGlobal, stubMatchMedia } from '../../../testing'

describe('GrStatistic', () => {
  it('показывает отформатированное значение, подпись и приписки', () => {
    const wrapper = mount(GrStatistic, {
      props: { title: 'Выручка', value: 1234567.5, precision: 2, prefix: '₽', suffix: 'в месяц' },
    })

    expect(wrapper.get('[data-gr-statistic-title]').text()).toBe('Выручка')
    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toContain('1 234 567.50')
    expect(wrapper.get('[data-gr-statistic-prefix]').text()).toBe('₽')
    expect(wrapper.get('[data-gr-statistic-suffix]').text()).toBe('в месяц')
  })

  it('строка динамики окрашивается по направлению', () => {
    const up = mount(GrStatistic, { props: { value: 10, trend: 'up', trendText: '+12%' } })
    expect(up.get('[data-testid="gr-statistic-trend"]').classes().join(' ')).toContain('var(--gr-success-text)')
    expect(up.get('[data-testid="gr-statistic-trend"]').find('svg').exists()).toBe(true)

    const down = mount(GrStatistic, { props: { value: 10, trend: 'down', trendText: '-3%' } })
    expect(down.get('[data-testid="gr-statistic-trend"]').classes().join(' ')).toContain('var(--gr-danger-text)')
  })

  it('без trend/trendText строка динамики не рендерится', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10 } })
    expect(wrapper.find('[data-testid="gr-statistic-trend"]').exists()).toBe(false)
  })

  it('loading подменяет значение плейсхолдером', () => {
    const wrapper = mount(GrStatistic, { props: { value: 42, loading: true } })

    expect(wrapper.find('[data-testid="gr-statistic-value"]').exists()).toBe(false)
    const placeholder = wrapper.get('[data-testid="gr-statistic-placeholder"]')
    expect(placeholder.attributes('aria-busy')).toBe('true')
  })

  it('слот по умолчанию заменяет форматированное значение', () => {
    const wrapper = mount(GrStatistic, {
      props: { value: 42 },
      slots: { default: '<span data-testid="custom">почти сорок два</span>' },
    })

    expect(wrapper.get('[data-testid="custom"]').text()).toBe('почти сорок два')
    expect(wrapper.text()).not.toContain('42')
  })

  it('тон меняет цвет значения', () => {
    const wrapper = mount(GrStatistic, { props: { value: 1, tone: 'danger' } })
    expect(wrapper.get('[data-testid="gr-statistic-value"]').html()).toContain('var(--gr-danger-text)')
  })
})

describe('GrStatistic — доступность динамики и загрузки', () => {
  it('направление тренда доносит скрытая подпись, а не только цвет и иконка', () => {
    const cases = [
      ['up', 'Increase'],
      ['down', 'Decrease'],
      ['flat', 'No change'],
    ] as const

    for (const [trend, label] of cases) {
      const wrapper = mount(GrStatistic, { props: { value: 10, trend, trendText: '+12%' } })
      const hidden = wrapper.get('[data-gr-statistic-trend-label]')

      expect(hidden.text()).toBe(label)
      expect(hidden.classes()).toContain('sr-only')
      // Иконка направления остаётся декоративной: иначе диктор прочитает его дважды.
      expect(wrapper.get('[data-testid="gr-statistic-trend"] svg').attributes('aria-hidden')).toBe('true')
    }
  })

  it('подпись направления переживает подмену слота #trend', () => {
    const wrapper = mount(GrStatistic, {
      props: { value: 10, trend: 'down', trendText: '-4%' },
      slots: { trend: '<span>свой блок</span>' },
    })

    expect(wrapper.get('[data-gr-statistic-trend-label]').text()).toBe('Decrease')
    expect(wrapper.get('[data-testid="gr-statistic-trend"]').text()).toContain('свой блок')
  })

  it('без trend скрытой подписи нет — направления не существует', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10, trendText: 'год к году' } })

    expect(wrapper.find('[data-gr-statistic-trend-label]').exists()).toBe(false)
  })

  it('живая область загрузки не молчит', () => {
    const wrapper = mount(GrStatistic, { props: { value: 10, loading: true } })
    const placeholder = wrapper.get('[data-testid="gr-statistic-placeholder"]')

    expect(placeholder.attributes('role')).toBe('status')
    expect(placeholder.text()).toBe('Loading...')
    expect(placeholder.find('.sr-only').exists()).toBe(true)
  })
})

describe('GrStatistic — размеры и локаль', () => {
  it('лестницы кеглей идут от токенов --gr-text-*', () => {
    const xs = mount(GrStatistic, { props: { value: 1, title: 'x', size: 'xs', suffix: '%' } })
    expect(xs.get('[data-gr-statistic-title]').classes()).toContain('text-[length:var(--gr-text-2xs)]')
    expect(xs.get('[data-gr-statistic-suffix]').classes()).toContain('text-[length:var(--gr-text-xs)]')

    const lg = mount(GrStatistic, { props: { value: 1, title: 'x', size: 'lg', suffix: '%' } })
    expect(lg.get('[data-gr-statistic-title]').classes()).toContain('text-[length:var(--gr-text-sm)]')
    expect(lg.get('[data-gr-statistic-suffix]').classes()).toContain('text-[length:var(--gr-text-xl)]')

    expect(xs.html()).not.toMatch(/text-\[\d+px\]/)
    expect(lg.html()).not.toMatch(/text-\[\d+px\]/)
  })

  it('локаль берётся из i18n-адаптера, а проп locale её перебивает', () => {
    const { provide } = granularityGlobal({ i18n: { locale: 'de-DE' } })

    const fromAdapter = mount(GrStatistic, { props: { value: 1234567.5, precision: 2 }, global: { provide } })
    expect(fromAdapter.get('[data-testid="gr-statistic-value"]').text()).toBe('1.234.567,50')

    const fromProp = mount(GrStatistic, {
      props: { value: 1234567.5, precision: 2, locale: 'en-US' },
      global: { provide },
    })
    expect(fromProp.get('[data-testid="gr-statistic-value"]').text()).toBe('1,234,567.50')

    const explicit = mount(GrStatistic, {
      props: { value: 1234567.5, precision: 2, groupSeparator: ' ', decimalSeparator: '.' },
      global: { provide },
    })
    expect(explicit.get('[data-testid="gr-statistic-value"]').text()).toBe('1 234 567.50')
  })

  it('без адаптера остаются ручные разделители', () => {
    const wrapper = mount(GrStatistic, { props: { value: 1234567.5, precision: 2 } })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toBe('1 234 567.50')
  })
})

describe('GrStatistic — пара «термин — значение»', () => {
  it('с подписью это dl/dt/dd, без неё — прежние блоки', () => {
    const titled = mount(GrStatistic, { props: { title: 'Заказы', value: 1284 } })

    // Диктор получает пару, а не два соседних блока подряд.
    expect(titled.get('[data-gr-statistic-title]').element.tagName).toBe('DT')
    expect(titled.get('[data-testid="gr-statistic-value"]').element.tagName).toBe('DD')
    expect(titled.find('dl').exists()).toBe(true)

    const untitled = mount(GrStatistic, { props: { value: 1284 } })
    // Список определений без термина — та же бессвязность, только с претензией.
    expect(untitled.find('dl').exists()).toBe(false)
    expect(untitled.get('[data-testid="gr-statistic-value"]').element.tagName).toBe('DIV')
  })

  it('поля dl и dd обнулены: preflight пакета сбрасывает их только у body', () => {
    const wrapper = mount(GrStatistic, { props: { title: 'Заказы', value: 1284 } })

    expect(wrapper.get('dl').classes()).toContain('m-0')
    expect(wrapper.get('[data-testid="gr-statistic-value"]').classes()).toContain('m-0')
  })

  it('строка динамики остаётся снаружи dl', () => {
    const wrapper = mount(GrStatistic, {
      props: { title: 'Заказы', value: 1284, trend: 'up', trendText: '+12%' },
    })

    // Внутри `dl` разрешены только группы dt/dd — посторонний блок невалиден.
    expect(wrapper.get('dl').find('[data-testid="gr-statistic-trend"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="gr-statistic-trend"]').exists()).toBe(true)
  })

  it('плейсхолдер загрузки занимает место значения, а не соседствует с ним', () => {
    const wrapper = mount(GrStatistic, { props: { title: 'Заказы', value: 1284, loading: true } })

    expect(wrapper.get('[data-testid="gr-statistic-placeholder"]').element.tagName).toBe('DD')
    expect(wrapper.find('[data-testid="gr-statistic-value"]').exists()).toBe(false)
  })
})

describe('GrStatistic — переход к деталям', () => {
  it('по умолчанию корень остаётся div и не интерактивен', () => {
    const wrapper = mount(GrStatistic, { props: { value: 1284 } })
    const root = wrapper.get('[data-gr-statistic]')

    expect(root.element.tagName).toBe('DIV')
    expect(root.classes().join(' ')).not.toContain('focus-visible:ring-2')
  })

  it('href даёт ссылку, clickable — кнопку, as — свой тег', () => {
    const link = mount(GrStatistic, { props: { value: 1284, href: '/orders' } })
    expect(link.get('[data-gr-statistic]').element.tagName).toBe('A')
    expect(link.get('[data-gr-statistic]').attributes('href')).toBe('/orders')

    const button = mount(GrStatistic, { props: { value: 1284, clickable: true } })
    expect(button.get('[data-gr-statistic]').element.tagName).toBe('BUTTON')
    // Без явного типа кнопка внутри формы отправляла бы её.
    expect(button.get('[data-gr-statistic]').attributes('type')).toBe('button')

    const custom = mount(GrStatistic, { props: { value: 1284, as: 'article', href: '/orders' } })
    expect(custom.get('[data-gr-statistic]').element.tagName).toBe('ARTICLE')
    // `href` уезжает только на настоящую ссылку.
    expect(custom.get('[data-gr-statistic]').attributes('href')).toBeUndefined()
  })

  it('интерактивный корень получает фокус-кольцо и эмитит click', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1284, clickable: true } })

    expect(wrapper.get('[data-gr-statistic]').classes()).toContain('focus-visible:ring-2')

    await wrapper.get('[data-gr-statistic]').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})

describe('GrStatistic — перебор чисел', () => {
  /** Число из строки: разделитель разрядов — неразрывный пробел, а не обычный. */
  function digits(wrapper: ReturnType<typeof mount>): number {
    return Number(wrapper.get('[data-gr-statistic-number]').text().replace(/\s/g, ''))
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('без animate значение стоит на месте с первого кадра', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1284 } })
    await nextTick()

    expect(digits(wrapper)).toBe(1284)
    expect(wrapper.find('[data-gr-statistic-final]').exists()).toBe(false)
  })

  it('с animate число добегает от нуля до конечного', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true } })
    await nextTick()
    expect(digits(wrapper)).toBe(0)

    vi.advanceTimersByTime(300)
    await nextTick()
    const middle = digits(wrapper)
    expect(middle).toBeGreaterThan(0)
    expect(middle).toBeLessThan(1000)

    vi.advanceTimersByTime(400)
    await nextTick()
    expect(digits(wrapper)).toBe(1000)
  })

  it('смена значения перебирает от прежнего числа, а не от нуля', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true } })
    vi.advanceTimersByTime(700)
    await nextTick()

    await wrapper.setProps({ value: 2000 })
    await nextTick()

    // Перебор «с нуля» на каждом обновлении дашборда читался бы как сброс данных.
    expect(digits(wrapper)).toBe(1000)

    vi.advanceTimersByTime(700)
    await nextTick()
    expect(digits(wrapper)).toBe(2000)
  })

  it('animateDuration задаёт длительность', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true, animateDuration: 200 } })
    await nextTick()

    vi.advanceTimersByTime(250)
    await nextTick()
    expect(digits(wrapper)).toBe(1000)
  })

  it('нечисловое значение ставится сразу: перебирать «2 ч 15 мин» нечем', async () => {
    const wrapper = mount(GrStatistic, { props: { value: '2 ч 15 мин', animate: true } })
    await nextTick()

    expect(wrapper.get('[data-gr-statistic-number]').text()).toBe('2 ч 15 мин')
    expect(wrapper.find('[data-gr-statistic-final]').exists()).toBe(false)
  })

  it('под prefers-reduced-motion перебора нет вовсе', async () => {
    // Глобальный кламп в `base.css` гасит CSS, но не JS-твин — его гасит сам компонент.
    const restoreMatchMedia = stubMatchMedia({ reducedMotion: true })

    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true } })
    await nextTick()

    expect(digits(wrapper)).toBe(1000)
    expect(wrapper.find('[data-gr-statistic-final]').exists()).toBe(false)

    restoreMatchMedia()
  })

  it('пока идёт перебор, диктор получает конечное значение', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true } })
    vi.advanceTimersByTime(300)
    await nextTick()

    // «1 000» глазами и «743» в ушах — не шум, а неверные данные.
    const visible = wrapper.get('[data-gr-statistic-number]')
    expect(visible.attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-gr-statistic-final]').text().replace(/\s/g, '')).toBe('1000')

    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.find('[data-gr-statistic-final]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-statistic-number]').attributes('aria-hidden')).toBeUndefined()
  })

  it('загрузка перебор не запускает: перебирать нечего', async () => {
    const wrapper = mount(GrStatistic, { props: { value: 1000, animate: true, loading: true } })
    await nextTick()

    expect(wrapper.find('[data-testid="gr-statistic-placeholder"]').exists()).toBe(true)

    await wrapper.setProps({ loading: false })
    await nextTick()
    expect(digits(wrapper)).toBe(1000)
  })
})

describe('GrStatistic — иконка блока', () => {
const CustomIcon = defineComponent({ name: 'CustomIcon', render: () => h('svg', { 'data-custom-icon': '' }) })

  it('принимает и класс, и компонент', () => {
    const byClass = mount(GrStatistic, { props: { value: 10, icon: 'i-lucide-users' } })
    expect(byClass.find('span.i-lucide-users').exists()).toBe(true)

    const byComponent = mount(GrStatistic, { props: { value: 10, icon: CustomIcon } })
    expect(byComponent.find('[data-custom-icon]').exists()).toBe(true)
  })
})
