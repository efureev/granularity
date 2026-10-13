import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { chronoTickerIntervals, resetChronoNow } from '../../../composables/useChronoNow'
import GrRelativeTime from '../GrRelativeTime.vue'

const NOW = new Date(2026, 7, 12, 12, 0, 0)

function at(...parts: [number, number, number, number?, number?, number?]): Date {
  const [y, m, d, h = 0, min = 0, s = 0] = parts
  return new Date(y, m - 1, d, h, min, s)
}

function mountMark(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(GrRelativeTime, {
    props: { locale: 'en-US', base: NOW, ...props },
    ...options,
  })
}

afterEach(() => {
  resetChronoNow()
})

describe('GrRelativeTime — текст и разметка', () => {
  it('это <time> с машинным моментом и абсолютной датой в подсказке', () => {
    const value = at(2026, 8, 12, 11, 57)
    const wrapper = mountMark({ value })

    // Разметка — `<time>`, а не `<span>`: момент обязан остаться машинным.
    expect(wrapper.find('time').exists()).toBe(true)
    expect(wrapper.attributes('datetime')).toBe(value.toISOString())
    expect(wrapper.attributes('title')).toBe('August 12, 2026')
    wrapper.unmount()
  })

  it('показывает относительную строку по локали', () => {
    const ru = mountMark({ value: at(2026, 8, 12, 11, 57), locale: 'ru' })
    const es = mountMark({ value: at(2026, 8, 12, 10, 0), locale: 'es' })

    expect(ru.text()).toBe('3 минуты назад')
    expect(es.text()).toBe('hace 2 horas')
    ru.unmount()
    es.unmount()
  })

  it('numeric и width меняют вид, а не смысл', () => {
    const auto = mountMark({ value: at(2026, 8, 11, 12) })
    const always = mountMark({ value: at(2026, 8, 11, 12), numeric: 'always' })
    const short = mountMark({ value: at(2026, 5, 12, 12), width: 'short' })

    expect(auto.text()).toBe('yesterday')
    expect(always.text()).toBe('1 day ago')
    expect(short.text()).toBe('3 mo. ago')
    auto.unmount()
    always.unmount()
    short.unmount()
  })

  it('будущее показывается будущим', () => {
    const wrapper = mountMark({ value: at(2026, 8, 14, 12) })

    expect(wrapper.text()).toBe('in 2 days')
    wrapper.unmount()
  })

  it('значение приходит через адаптер — как у пикеров', () => {
    const wrapper = mountMark({ value: '2026-08-11', valueAdapter: 'isoDate' })

    expect(wrapper.text()).toBe('yesterday')
    wrapper.unmount()
  })

  it.each([
    ['2026-10-07', 'tomorrow'],
    ['2026-10-06', 'today'],
    ['2026-10-05', 'yesterday'],
    ['2026-10-13', 'next week'],
  ])('дата без времени — календарный разрыв: %s утром 6 октября — %s', (value, expected) => {
    // Полночь 7 октября — через 15 часов, а 5 октября было 33 часа назад:
    // прошедшим временем это «in 15 hours» и «yesterday» лишь по случайности.
    const wrapper = mountMark({ value, valueAdapter: 'isoDate', base: new Date(2026, 9, 6, 9, 0), numeric: 'auto' })

    expect(wrapper.text()).toBe(expected)
    wrapper.unmount()
  })

  it('свой адаптер без времени объявляет это флагом и тоже считается календарём', () => {
    const dayNumber = {
      dateOnly: true,
      parse: (raw: number) => new Date(2026, 9, raw),
      serialize: (date: Date) => date.getDate(),
    }
    const wrapper = mountMark({ value: 7, valueAdapter: dayNumber, base: new Date(2026, 9, 6, 21, 30) })

    expect(wrapper.text()).toBe('tomorrow')
    wrapper.unmount()
  })

  it('машинная форма даты без времени — сама дата, а не момент в UTC', () => {
    // Локальная полночь в UTC для восточных зон — это вечер предыдущего дня.
    const wrapper = mountMark({ value: '2026-08-11', valueAdapter: 'isoDate' })

    expect(wrapper.attributes('datetime')).toBe('2026-08-11')
    wrapper.unmount()
  })

  it('неразобранное значение не рисует ни текста, ни момента', () => {
    const wrapper = mountMark({ value: 'не дата', valueAdapter: 'isoDate' })

    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('datetime')).toBe('')
    wrapper.unmount()
  })

  it('свой title потребителя перекрывает абсолютную дату', () => {
    const wrapper = mountMark({ value: at(2026, 8, 11, 12) }, { attrs: { title: 'своё' } })

    expect(wrapper.attributes('title')).toBe('своё')
    wrapper.unmount()
  })

  it('слот получает текст, абсолютную дату и момент', () => {
    const value = at(2026, 8, 11, 12)
    const wrapper = mountMark({ value }, {
      slots: {
        default: `<template #default="{ text, absolute, datetime }">
          <b>{{ text }}</b><i>{{ absolute }}</i><u>{{ datetime }}</u>
        </template>`,
      },
    })

    expect(wrapper.get('b').text()).toBe('yesterday')
    expect(wrapper.get('i').text()).toBe('August 11, 2026')
    expect(wrapper.get('u').text()).toBe(value.toISOString())
    wrapper.unmount()
  })
})

describe('GrRelativeTime — порог перехода к дате', () => {
  it('старше порога показывается обычной датой', () => {
    const wrapper = mountMark({ value: at(2026, 5, 12, 12), cutoff: 30 })

    expect(wrapper.text()).toBe('May 12, 2026')
    wrapper.unmount()
  })

  it('моложе порога остаётся относительным', () => {
    const wrapper = mountMark({ value: at(2026, 8, 1, 12), cutoff: 30 })

    expect(wrapper.text()).toBe('last week')
    wrapper.unmount()
  })

  it('порог считается днями в обе стороны', () => {
    const past = mountMark({ value: at(2026, 7, 1, 12), cutoff: 30 })
    const future = mountMark({ value: at(2026, 9, 30, 12), cutoff: 30 })

    expect(past.text()).toBe('July 1, 2026')
    expect(future.text()).toBe('September 30, 2026')
    past.unmount()
    future.unmount()
  })

  it('без порога далёкое значение остаётся относительным', () => {
    const wrapper = mountMark({ value: at(2020, 1, 1, 12) })

    expect(wrapper.text()).toBe('6 years ago')
    wrapper.unmount()
  })

  it('вид даты задаётся опциями Intl, а не строкой-паттерном', () => {
    const wrapper = mountMark({
      value: at(2026, 5, 12, 12),
      cutoff: 30,
      format: { day: '2-digit', month: '2-digit', year: 'numeric' },
    })

    expect(wrapper.text()).toBe('05/12/2026')
    wrapper.unmount()
  })
})

describe('GrRelativeTime — живое обновление', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /** Без `base` компонент читает общие часы. */
  function mountLive(props: Record<string, unknown> = {}) {
    return mount(GrRelativeTime, { props: { locale: 'en-US', ...props } })
  }

  it('текст пересчитывается по такту', async () => {
    const wrapper = mountLive({ value: at(2026, 8, 12, 11, 59, 0) })
    expect(wrapper.text()).toBe('1 minute ago')

    vi.setSystemTime(new Date(2026, 7, 12, 12, 2, 0))
    vi.advanceTimersByTime(30_000)
    await nextTick()

    expect(wrapper.text()).toBe('3 minutes ago')
    wrapper.unmount()
  })

  it('такт выбирается по единице: секундам — частый, месяцам — редкий', async () => {
    // Ради этого такт и не проп: «3 месяца назад» незачем пересчитывать
    // каждую секунду, а «только что» — раз в час.
    const seconds = mountLive({ value: at(2026, 8, 12, 11, 59, 50) })
    await nextTick()
    expect(chronoTickerIntervals()).toEqual([5000])

    const months = mountLive({ value: at(2026, 5, 12, 12) })
    await nextTick()

    expect(chronoTickerIntervals()).toEqual([5000, 3_600_000])
    seconds.unmount()
    months.unmount()
  })

  it('такт замедляется вместе со старением значения', async () => {
    const wrapper = mountLive({ value: at(2026, 8, 12, 11, 59, 55) })
    await nextTick()
    expect(chronoTickerIntervals()).toEqual([5000])

    vi.setSystemTime(new Date(2026, 7, 12, 12, 5, 0))
    vi.advanceTimersByTime(5000)
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toBe('5 minutes ago')
    // Секундный тикер осиротел и снят: подписка переехала на минутный.
    expect(chronoTickerIntervals()).toEqual([30_000])
    wrapper.unmount()
  })

  /**
   * Общие часы обновляются тактом: на секундах — раз в пять секунд. Значение,
   * пришедшее между тактами, новее последнего тика, и сравнение с ним делало
   * «только что» будущим: «in 4 sec.», а через такт — «3 sec. ago».
   */
  it('значение, сменившееся между тактами, сравнивается со свежими часами', async () => {
    const wrapper = mountLive({ value: new Date(), width: 'short' })
    await nextTick()
    expect(chronoTickerIntervals()).toEqual([5000])

    vi.advanceTimersByTime(4000)
    await wrapper.setProps({ value: new Date() })

    expect(wrapper.text()).toBe('now')
    wrapper.unmount()
  })

  it('метка, смонтированная между тактами общего таймера, не уходит в будущее', async () => {
    const first = mountLive({ value: new Date() })
    await nextTick()

    vi.advanceTimersByTime(4000)
    const second = mountLive({ value: new Date(), numeric: 'always' })
    await nextTick()

    expect(second.text()).toBe('0 seconds ago')
    first.unmount()
    second.unmount()
  })

  it('будущее меньше такта у живой метки — «сейчас»: часы сравнения отстают на такт', async () => {
    // Сервер с часами, убежавшими на пару секунд, — обычное дело.
    const ahead = mountLive({ value: new Date(Date.now() + 2000) })
    const far = mountLive({ value: new Date(Date.now() + 20_000) })
    const fixed = mountMark({ value: new Date(NOW.getTime() + 2000) })

    expect(ahead.text()).toBe('now')
    expect(far.text()).toBe('in 20 seconds')
    // С `base` часы не отстают: две секунды вперёд — это будущее.
    expect(fixed.text()).toBe('in 2 seconds')
    ahead.unmount()
    far.unmount()
    fixed.unmount()
  })

  it('live=false не заводит таймера вовсе', async () => {
    const wrapper = mountLive({ value: at(2026, 8, 12, 11, 59, 0), live: false })
    await nextTick()

    expect(chronoTickerIntervals()).toHaveLength(0)

    vi.setSystemTime(new Date(2026, 7, 12, 12, 5, 0))
    vi.advanceTimersByTime(60_000)
    await nextTick()

    expect(wrapper.text(), 'значение снято один раз на монтировании').toBe('1 minute ago')
    wrapper.unmount()
  })

  it('с base часы не читаются: ни таймера, ни расхождения рендеров', async () => {
    const wrapper = mountMark({ value: at(2026, 8, 12, 11, 59, 0) })
    await nextTick()

    expect(chronoTickerIntervals()).toHaveLength(0)
    wrapper.unmount()
  })

  it('размонтирование снимает подписку', async () => {
    const wrapper = mountLive({ value: at(2026, 8, 12, 11, 59, 0) })
    await nextTick()
    expect(chronoTickerIntervals()).toHaveLength(1)

    wrapper.unmount()

    expect(chronoTickerIntervals()).toHaveLength(0)
  })
})

describe('GrRelativeTime — серверный рендер', () => {
  it('без base расхождение помечено как ожидаемое', () => {
    // Между серверным рендером и гидрацией всегда проходит время, а сервер
    // обычно ещё и в UTC.
    const wrapper = mount(GrRelativeTime, { props: { value: at(2026, 8, 11, 12), locale: 'en-US' } })

    expect(wrapper.attributes('data-allow-mismatch')).toBe('children')
    wrapper.unmount()
  })

  it('с base метка исчезает: рендер стал детерминированным', () => {
    const wrapper = mountMark({ value: at(2026, 8, 11, 12) })

    expect(wrapper.attributes('data-allow-mismatch')).toBeUndefined()
    wrapper.unmount()
  })
})
