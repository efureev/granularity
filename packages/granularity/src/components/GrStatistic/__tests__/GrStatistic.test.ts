import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrStatistic, { type GrStatisticProps } from '../GrStatistic.vue'
import { granularityGlobal, stubMatchMedia } from '../../../testing'

describe('GrStatistic', () => {
  it('показывает отформатированное значение, подпись и приписки', () => {
    const wrapper = mount(GrStatistic, {
      props: { title: 'Выручка', value: 1234567.5, precision: 2, prefix: '₽', suffix: 'в месяц' },
    })

    expect(wrapper.get('[data-gr-statistic-title]').text()).toBe('Выручка')
    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toContain('1 234 567.50')
    expect(wrapper.get('[data-gr-value-prefix]').text()).toBe('₽')
    expect(wrapper.get('[data-gr-value-suffix]').text()).toBe('в месяц')
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

describe('GrStatistic — тон из знака значения', () => {
  const paint = (props: GrStatisticProps): string =>
    mount(GrStatistic, { props }).get('[data-testid="gr-statistic-value"]').html()

  it('polarity выводит тон из знака', () => {
    expect(paint({ value: 12, polarity: 'positive-good' })).toContain('var(--gr-success-text)')
    expect(paint({ value: -12, polarity: 'positive-good' })).toContain('var(--gr-danger-text)')
  })

  it('negative-good инвертирует тон, не трогая само значение', () => {
    const wrapper = mount(GrStatistic, { props: { value: -12, polarity: 'negative-good' } })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').html()).toContain('var(--gr-success-text)')
    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toContain('-12')
    expect(paint({ value: 12, polarity: 'negative-good' })).toContain('var(--gr-danger-text)')
  })

  // «Не изменилось» — третье состояние, двумя цветами оно не выражается.
  it('ноль нейтрален при любой полярности', () => {
    expect(paint({ value: 0, polarity: 'positive-good' })).toContain('var(--gr-fg)')
    expect(paint({ value: 0, polarity: 'negative-good' })).toContain('var(--gr-fg)')
  })

  it('polarity="none" тона не даёт', () => {
    expect(paint({ value: -12, polarity: 'none' })).toContain('var(--gr-fg)')
  })

  // Без этого гейта снятый жёсткий дефолт `tone` молча перекрасил бы каждую
  // вторую плитку в приложениях.
  it('без polarity плитка остаётся нейтральной', () => {
    expect(paint({ value: -12 })).toContain('var(--gr-fg)')
  })

  it('явный tone сильнее polarity', () => {
    expect(paint({ value: -12, polarity: 'positive-good', tone: 'primary' })).toContain('var(--gr-primary)')
  })

  // Ровно тот случай, ради которого дефолт уехал из `withDefaults`.
  it('явный tone="neutral" гасит polarity', () => {
    expect(paint({ value: 12, polarity: 'positive-good', tone: 'neutral' })).toContain('var(--gr-fg)')
  })

  it('нечисловое значение красить нечем', () => {
    expect(paint({ value: '2 ч 15 мин', polarity: 'positive-good' })).toContain('var(--gr-fg)')
    expect(paint({ value: '—', polarity: 'positive-good' })).toContain('var(--gr-fg)')
  })

  // Разбор тот же `toNumber`, что у перебора чисел: строка с числом — число.
  it('числовая строка красится как число', () => {
    expect(paint({ value: '-12.5', polarity: 'positive-good' })).toContain('var(--gr-danger-text)')
  })

  it('polarity читается из GrConfigProvider, локальный проп сильнее', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrStatistic },
      template: `
        <GrConfigProvider :component-defaults="{ GrStatistic: { polarity: 'negative-good' } }">
          <GrStatistic :value="-12" data-case="config" />
          <GrStatistic :value="-12" polarity="positive-good" data-case="local" />
          <GrStatistic :value="-12" tone="info" data-case="explicit" />
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)

    expect(wrapper.get('[data-case="config"]').html()).toContain('var(--gr-success-text)')
    expect(wrapper.get('[data-case="local"]').html()).toContain('var(--gr-danger-text)')
    expect(wrapper.get('[data-case="explicit"]').html()).toContain('var(--gr-info-text)')
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

    const lg = mount(GrStatistic, { props: { value: 1, title: 'x', size: 'lg', suffix: '%' } })
    expect(lg.get('[data-gr-statistic-title]').classes()).toContain('text-[length:var(--gr-text-sm)]')

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

  // Обратная сторона предыдущего правила: компонент-ссылка сам рендерит `<a>`,
  // и `href` ему нужен — а `rootTag === 'a'` для него ложно.
  it('as-компонент получает href', () => {
    const StubLink = markRaw(defineComponent({
      name: 'StubLink',
      props: { href: { type: String, default: undefined } },
      template: '<a :href="href"><slot /></a>',
    }))

    const wrapper = mount(GrStatistic, { props: { value: 1284, as: StubLink, href: '/orders' } })

    expect(wrapper.getComponent(StubLink).props('href')).toBe('/orders')
    expect(wrapper.get('a').attributes('href')).toBe('/orders')
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
    return Number(wrapper.get('[data-gr-value-number]').text().replace(/\s/g, ''))
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

    expect(wrapper.get('[data-gr-value-number]').text()).toBe('2 ч 15 мин')
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
    const visible = wrapper.get('[data-gr-value-number] [aria-hidden]')
    expect(visible.attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-gr-statistic-final]').text().replace(/\s/g, '')).toBe('1000')

    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.find('[data-gr-statistic-final]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-value-number]').attributes('aria-hidden')).toBeUndefined()
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

describe('GrStatistic — аффиксы величины', () => {
  // Знак валюты — часть самой величины, а не подпись к ней. Приглушённый,
  // мельче и с зазором он читался как «$ 14,99»: две сущности вместо одной.
  it('префикс набран как число: тот же кегль, цвет и вес', () => {
    const wrapper = mount(GrStatistic, { props: { value: 14.99, precision: 2, prefix: '$' } })
    const prefix = wrapper.get('[data-gr-value-prefix]').classes()
    const number = wrapper.get('[data-gr-value-number]').classes()

    expect(prefix).not.toContain('text-[var(--gr-muted-fg)]')
    for (const cls of number) expect(prefix).toContain(cls)
  })

  it('между валютой и числом нет зазора', () => {
    const wrapper = mount(GrStatistic, { props: { value: 14.99, prefix: '$' } })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').classes()).not.toContain('gap-1')
    expect(wrapper.get('[data-gr-value-prefix]').classes()).not.toContain('mr-1')
  })

  // Единица измерения — не часть величины: по умолчанию её приглушают и
  // отбивают. Дефолт живёт в токене, поэтому приложение вправе его сменить —
  // валюта справа (`100 ₽`) ровно этим и получается.
  it('суффикс остаётся единицей: приглушён, мельче и отбит', () => {
    const wrapper = mount(GrStatistic, { props: { value: 42, suffix: '%', size: 'md' } })
    const suffix = wrapper.get('[data-gr-value-suffix]').classes()

    expect(suffix).toContain('text-[var(--gr-value-suffix-color,var(--gr-muted-fg))]')
    expect(suffix).toContain('text-[length:var(--gr-value-suffix-size,0.85em)]')
    expect(suffix).toContain('ms-[var(--gr-value-suffix-gap,0.25rem)]')
  })

  // Тон стоит на контейнере величины, а приписки его наследуют: отрицательная
  // сумма краснеет целиком, а не числом без знака валюты.
  it('тон значения красит и валюту: это одна величина', () => {
    const wrapper = mount(GrStatistic, { props: { value: -12, prefix: '$', polarity: 'positive-good' } })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').classes())
      .toContain('text-[var(--gr-statistic-value-color,var(--gr-danger-text))]')
    expect(wrapper.get('[data-gr-value-prefix]').classes())
      .toContain('text-[var(--gr-value-prefix-color,inherit)]')
  })
})

describe('GrStatistic — обязательный проп не доехал', () => {
  it('без `value` плитка показывает прочерк, а не слово undefined', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(GrStatistic, { props: {} as never })

    expect(wrapper.get('[data-testid="gr-statistic-value"]').text()).toBe('—')
    expect(warn.mock.calls.flat().join('\n')).toContain('обязательный проп `value`')

    warn.mockRestore()
  })
})
