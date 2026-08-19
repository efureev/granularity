import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { resetChronoNow } from '../../../composables/useChronoNow'
import GrDuration from '../GrDuration.vue'

function factory(props: Record<string, unknown> = {}) {
  return mount(GrDuration, { props: { locale: 'ru', ...props } })
}

describe('GrDuration', () => {
  it('секунды показываются двумя единицами', () => {
    expect(factory({ value: 9000 }).text()).toBe('2 ч 30 мин')
  })

  it('пара дат меряет промежуток между ними', () => {
    const wrapper = factory({ value: [new Date(2026, 7, 12, 9, 0), new Date(2026, 7, 12, 11, 30)] })

    expect(wrapper.text()).toBe('2 ч 30 мин')
  })

  it('одна дата меряет время до «сейчас»', () => {
    const base = new Date(2026, 7, 12, 12, 0)
    const wrapper = factory({ value: new Date(2026, 7, 12, 9, 30), base })

    expect(wrapper.text()).toBe('2 ч 30 мин')
  })

  it('это `<time>` с машинной длиной по полному значению', () => {
    // `maxUnits` сокращает текст для человека; разметка обязана остаться точной.
    const wrapper = factory({ value: 10_770 })

    expect(wrapper.find('time').exists()).toBe(true)
    expect(wrapper.attributes('datetime')).toBe('PT2H59M30S')
    expect(wrapper.text()).toBe('2 ч 59 мин')
  })

  it('подробность и длина имён настраиваются', () => {
    expect(factory({ value: 90_061, maxUnits: 4 }).text()).toContain('1 с')
    expect(factory({ value: 9000, width: 'long', locale: 'en' }).text()).toContain('hour')
  })

  it('пустое значение рисует пустую метку, а ноль — «0 с»', () => {
    expect(factory({ value: null }).text()).toBe('')
    expect(factory().text()).toBe('')
    expect(factory({ value: 0 }).text()).toBe('0 с')
  })

  it('хвостовой ноль не печатается: ровно два часа — это «2 ч»', () => {
    // `maxUnits` — потолок, а не квота: «2 ч 0 мин» ничего не добавляет.
    expect(factory({ value: 7200 }).text()).toBe('2 ч')
  })

  it('слот получает то же, что компонент рисует сам', () => {
    const wrapper = mount(GrDuration, {
      props: { locale: 'ru', value: 9000 },
      slots: { default: '<span data-own>{{ params.text }} / {{ params.datetime }}</span>' },
    })

    expect(wrapper.get('[data-own]').text()).toBe('2 ч 30 мин / PT2H30M')
  })
})

describe('GrDuration — живой счёт', () => {
  it('без `base` метка тикает и помечена как расходящаяся с сервером', async () => {
    vi.useFakeTimers()
    resetChronoNow()
    const started = new Date(Date.now() - 90_000)

    const wrapper = factory({ value: started })

    expect(wrapper.attributes('data-allow-mismatch')).toBe('children')
    const before = wrapper.text()

    vi.advanceTimersByTime(120_000)
    await nextTick()

    expect(wrapper.text()).not.toBe(before)

    wrapper.unmount()
    vi.useRealTimers()
    resetChronoNow()
  })

  it('`base` делает рендер детерминированным и снимает пометку', () => {
    const wrapper = factory({ value: new Date(2026, 7, 12, 9, 30), base: new Date(2026, 7, 12, 12, 0) })

    expect(wrapper.attributes('data-allow-mismatch')).toBeUndefined()
  })

  it('число и пара дат часов не читают вовсе — им нечему тикать', () => {
    expect(factory({ value: 9000 }).attributes('data-allow-mismatch')).toBeUndefined()
    expect(
      factory({ value: [new Date(2026, 7, 12, 9, 0), new Date(2026, 7, 12, 11, 30)] })
        .attributes('data-allow-mismatch'),
    ).toBeUndefined()
  })
})
