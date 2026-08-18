import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrDescriptionList from '../GrDescriptionList.vue'

const items = [
  { label: 'Статус', value: 'Активен', name: 'status' },
  { label: 'Создан', value: '2026-08-17' },
  { label: 'Запрос', value: 'req_01HX', name: 'request' },
]

describe('GrDescriptionList', () => {
  // Ради этого компонент и заводится: в приложении дважды встретился `<dl>`
  // с голыми `<div>` внутри — ни парсер, ни скринридер пары там не видели.
  it('на каждую пару ровно один dt и один dd внутри dl', () => {
    const wrapper = mount(GrDescriptionList, { props: { items } })

    expect(wrapper.element.tagName).toBe('DL')

    const pairs = wrapper.findAll('[data-gr-description-pair]')
    expect(pairs).toHaveLength(3)

    for (const pair of pairs) {
      expect(pair.findAll('dt')).toHaveLength(1)
      expect(pair.findAll('dd')).toHaveLength(1)
    }

    expect(wrapper.findAll('dt').map(el => el.text())).toEqual(['Статус', 'Создан', 'Запрос'])
    expect(wrapper.findAll('dd').map(el => el.text())).toEqual(['Активен', '2026-08-17', 'req_01HX'])
  })

  // «Поле есть, значения нет» и «поля нет» — разные утверждения.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['пустую строку', ''],
  ])('печатает прочерк на %s, а не выбрасывает строку', (_name, value) => {
    const wrapper = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value }, { label: 'Создан', value: 'вчера' }] },
    })

    expect(wrapper.findAll('[data-gr-description-pair]')).toHaveLength(2)
    expect(wrapper.findAll('dd')[0].text()).toBe('—')
  })

  it('ноль — это значение, а не пустота', () => {
    const wrapper = mount(GrDescriptionList, { props: { items: [{ label: 'Ошибок', value: 0 }] } })

    expect(wrapper.get('dd').text()).toBe('0')
  })

  it('emptyText перекрывает прочерк, слот #empty — сильнее обоих', () => {
    const text = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value: null }], emptyText: 'нет данных' },
    })
    expect(text.get('dd').text()).toBe('нет данных')

    const slot = mount(GrDescriptionList, {
      props: { items: [{ label: 'Статус', value: null }], emptyText: 'нет данных' },
      slots: { empty: '<i>—</i>' },
    })
    expect(slot.find('dd i').exists()).toBe(true)
  })

  it('слот #value-<name> перебивает строковое значение', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items },
      slots: { 'value-status': '<b data-badge>Живой</b>' },
    })

    expect(wrapper.findAll('dd')[0].get('[data-badge]').text()).toBe('Живой')
    // Соседи без слота остаются строками.
    expect(wrapper.findAll('dd')[1].text()).toBe('2026-08-17')
  })

  it('слот #label-<name> перебивает подпись', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items },
      slots: { 'label-request': '<abbr data-abbr>Req</abbr>' },
    })

    expect(wrapper.findAll('dt')[2].get('[data-abbr]').text()).toBe('Req')
  })

  // Красная подпись читается как «поле сломано», хотя проблема в величине.
  it('тон красит только значение', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items: [{ label: 'Баланс', value: '-120', tone: 'danger' }] },
    })

    expect(wrapper.get('dd').classes()).toContain('text-[var(--gr-danger-text)]')
    expect(wrapper.get('dt').classes().join(' ')).not.toContain('danger')
  })

  it('inline держит колонку подписей, stacked её снимает', () => {
    const inline = mount(GrDescriptionList, { props: { items, labelWidth: '9rem' } })
    expect(inline.get('dt').attributes('style')).toContain('width: 9rem')
    expect(inline.get('[data-gr-description-pair]').classes()).toContain('items-baseline')

    const stacked = mount(GrDescriptionList, { props: { items, layout: 'stacked' } })
    expect(stacked.get('dt').attributes('style')).toBeUndefined()
  })

  // В узкой колонке фиксированная подпись выжимает значение в букву на строку.
  it('ниже stackBelow inline переключается на stacked', async () => {
    const observers: Array<(entries: Array<{ contentRect: { width: number } }>) => void> = []

    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: (entries: Array<{ contentRect: { width: number } }>) => void) {
        observers.push(callback)
      }

      observe() {}
      disconnect() {}
    })

    const wrapper = mount(GrDescriptionList, { props: { items, stackBelow: 480 } })

    // До измерения действует заданная раскладка — это же и серверный рендер.
    expect(wrapper.get('dt').attributes('style')).toContain('width')

    observers[0]([{ contentRect: { width: 320 } }])
    await nextTick()
    expect(wrapper.get('dt').attributes('style')).toBeUndefined()

    observers[0]([{ contentRect: { width: 900 } }])
    await nextTick()
    expect(wrapper.get('dt').attributes('style')).toContain('width')
  })

  it('flow строит строку, а не сетку', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, layout: 'flow' } })

    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-wrap')
    expect(wrapper.classes()).not.toContain('grid')
  })

  // Колонки принадлежат сетке: в строке задавать их нечему.
  it('columns в flow не подмешивает сетку', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, layout: 'flow', columns: 4 } })

    expect(wrapper.classes().some(cls => cls.includes('grid-cols'))).toBe(false)
  })

  it('в flow подпись и значение стоят рядом узким зазором', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, layout: 'flow' } })
    const pair = wrapper.get('[data-gr-description-pair]')

    expect(pair.classes()).toContain('items-baseline')
    expect(pair.classes()).toContain('gap-1')
    // Фиксированной колонки подписей в строке нет.
    expect(wrapper.get('dt').attributes('style')).toBeUndefined()
  })

  // Строка переносится сама — подменять её на `stacked` незачем.
  it('stackBelow не трогает flow', async () => {
    const observers: Array<(entries: Array<{ contentRect: { width: number } }>) => void> = []

    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: (entries: Array<{ contentRect: { width: number } }>) => void) {
        observers.push(callback)
      }

      observe() {}
      disconnect() {}
    })

    const wrapper = mount(GrDescriptionList, {
      props: { items, layout: 'flow', stackBelow: 480 },
    })

    observers[0]([{ contentRect: { width: 320 } }])
    await nextTick()

    expect(wrapper.classes()).toContain('flex-wrap')
    expect(wrapper.classes()).not.toContain('grid')
  })

  // Колонки считает CSS по ширине контейнера, а не медиазапрос по вьюпорту:
  // вьюпортная лестница включала две колонки в узкой карточке на широком
  // экране, и значение переносилось посимвольно — «30» печаталось как «3»/«0».
  it.each([2, 3, 4] as const)('columns=%i задаёт потолок колонок, а не приказ', (columns) => {
    const wrapper = mount(GrDescriptionList, { props: { items, columns } })
    const style = wrapper.attributes('style') ?? ''

    expect(style).toContain('repeat(auto-fit')
    expect(style).toContain(`/ ${columns})`)
    expect(style).toContain('--gr-description-list-column-min')
    // Ни одного вьюпортного класса не остаётся.
    expect(wrapper.classes().some(cls => cls.includes(':grid-cols'))).toBe(false)
  })

  // В `inline` подпись и значение стоят рядом, поэтому колонка обязана вместить
  // обоих. Колонка шириной с одну подпись оставляла значению 25px, и «Business»
  // рвался на три строки — тот же дефект, что и посимвольный перенос числа.
  it('в inline минимум колонки складывается из подписи и значения', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items, columns: 2, labelWidth: '11rem' },
    })
    const style = wrapper.attributes('style') ?? ''

    expect(style).toContain('11rem + var(--gr-description-list-value-min')
  })

  it('в stacked ширина подписи в расчёт не идёт: значение под ней, а не рядом', () => {
    const wrapper = mount(GrDescriptionList, {
      props: { items, columns: 2, layout: 'stacked', labelWidth: '11rem' },
    })

    expect(wrapper.attributes('style') ?? '').not.toContain('11rem')
  })

  it('одна колонка остаётся классом: формула там вырождается', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, columns: 1 } })

    expect(wrapper.classes()).toContain('grid-cols-1')
    expect(wrapper.attributes('style') ?? '').not.toContain('auto-fit')
  })

  // `column-count` раскладывает поток и разорвал бы пару между колонками.
  it('columns=2 не рвёт пару: dt и dd остаются в одном элементе сетки', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, columns: 2 } })

    expect(wrapper.classes().some(cls => cls.startsWith('columns-'))).toBe(false)

    for (const pair of wrapper.findAll('[data-gr-description-pair]')) {
      expect(pair.findAll('dt')).toHaveLength(1)
      expect(pair.findAll('dd')).toHaveLength(1)
    }
  })

  it('в flow колонок нет ни классом, ни стилем', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, layout: 'flow', columns: 4 } })

    expect(wrapper.attributes('style') ?? '').not.toContain('auto-fit')
    expect(wrapper.classes().some(cls => cls.includes('grid-cols'))).toBe(false)
  })

  it('divided отбивает пары линией, кроме последней', () => {
    const wrapper = mount(GrDescriptionList, { props: { items, divided: true } })

    expect(wrapper.get('[data-gr-description-pair]').classes()).toContain('last:border-b-0')
  })

  it('пустой список рендерит пустой dl без пар', () => {
    const wrapper = mount(GrDescriptionList, { props: { items: [] } })

    expect(wrapper.element.tagName).toBe('DL')
    expect(wrapper.findAll('[data-gr-description-pair]')).toHaveLength(0)
  })

  it('оформление читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrDescriptionList },
      setup: () => ({ items }),
      template: `
        <GrConfigProvider :component-defaults="{ GrDescriptionList: { layout: 'stacked', emptyText: 'н/д', columns: 2 } }">
          <GrDescriptionList :items="[{ label: 'Статус', value: null }]" />
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)
    expect(wrapper.get('dd').text()).toBe('н/д')
    expect(wrapper.get('dt').attributes('style')).toBeUndefined()
    expect(wrapper.get('[data-gr-description-list]').attributes('style')).toContain('/ 2)')
  })

  /**
   * Семантика — то, ради чего компонент существует.
   *
   * Список характеристик, собранный из `<div>`, для скринридера просто набор
   * текста: связи «термин → значение» в нём нет, перемещаться по парам нечем.
   * Поэтому корень обязан быть `<dl>`, а пара — `dt` + `dd` внутри обёртки
   * (`dl > div > dt + dd` валиден по HTML5 и нужен раскладке).
   */
  it('рендерит настоящий dl с парами dt + dd', () => {
    const wrapper = mount(GrDescriptionList, { props: { items } })

    expect(wrapper.element.tagName).toBe('DL')

    const pairs = wrapper.findAll('[data-gr-description-pair]')
    expect(pairs).toHaveLength(items.length)

    for (const pair of pairs) {
      expect(pair.element.parentElement).toBe(wrapper.element)
      expect(pair.get('[data-gr-description-label]').element.tagName).toBe('DT')
      expect(pair.get('[data-gr-description-value]').element.tagName).toBe('DD')
    }

    expect(wrapper.findAll('dt')).toHaveLength(items.length)
    expect(wrapper.findAll('dd')).toHaveLength(items.length)
  })

  /**
   * Пустое значение печатается, а не выкидывает `<dd>`.
   *
   * Пара без `dd` ломает `dl` структурно: следующий `dt` встаёт термином без
   * значения, и дальше вся связка едет на единицу. Прочерк на месте — дешевле
   * и честнее.
   */
  it.each([undefined, null, ''])('пустое значение (%s) остаётся парой с dd', (value) => {
    const wrapper = mount(GrDescriptionList, {
      props: { items: [{ label: 'Комментарий', value }] },
    })

    expect(wrapper.findAll('dt')).toHaveLength(1)
    expect(wrapper.findAll('dd')).toHaveLength(1)
    expect(wrapper.get('dd').text()).toBe('—')
  })

  // Ролей поверх нативной семантики нет: `dl` уже несёт её сам.
  it('не подменяет семантику ролями', () => {
    const wrapper = mount(GrDescriptionList, { props: { items } })

    for (const el of [wrapper.element, ...wrapper.element.querySelectorAll('*')]) {
      expect(el.getAttribute('role'), el.tagName).toBeNull()
    }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
