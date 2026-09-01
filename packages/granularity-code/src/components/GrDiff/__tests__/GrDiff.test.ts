import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrDiff from '../GrDiff.vue'

const BEFORE = 'const a = 1\nconst b = 2\nconst c = 3'
const AFTER = 'const a = 1\nconst b = 20\nconst c = 3'

describe('GrDiff', () => {
  it('показывает сводку добавленного и удалённого', () => {
    const wrapper = mount(GrDiff, { props: { before: BEFORE, after: AFTER } })

    // Сводка — живой регион: без неё диктор читает поток строк, не понимая,
    // что перед ним сравнение.
    const status = wrapper.get('[role="status"]')

    expect(status.text()).toContain('1')
  })

  it('совпадающие входы объявляются как «изменений нет»', () => {
    const wrapper = mount(GrDiff, { props: { before: BEFORE, after: BEFORE } })

    expect(wrapper.get('[role="status"]').text()).toMatch(/No changes|Изменений нет/)
  })

  it('пустой `hunks` с сервера — то же пустое сравнение, а не пустая рамка', () => {
    const wrapper = mount(GrDiff, { props: { hunks: [] } })

    expect(wrapper.text()).toMatch(/Nothing to compare|Сравнивать нечего/)
  })

  it('пустое сравнение показывает своё состояние, а не пустоту', () => {
    const wrapper = mount(GrDiff, { props: { before: '', after: '' } })

    expect(wrapper.text()).toMatch(/Nothing to compare|Сравнивать нечего/)
  })

  /** Знак в жёлобе — второй носитель смысла: цвет один был бы WCAG 1.4.1. */
  it('добавленное и удалённое различаются знаком, а не только цветом', () => {
    const wrapper = mount(GrDiff, { props: { before: BEFORE, after: AFTER } })
    const text = wrapper.get('[role="region"]').text()

    expect(text).toContain('+')
    expect(text).toContain('−')
  })

  it('номера строк идут по своей стороне', () => {
    const wrapper = mount(GrDiff, { props: { before: 'a', after: 'b', context: 5 } })
    const rows = wrapper.findAll('.gr-diff__gutter').map(el => el.text())

    // Удалённая: номер слева есть, справа пусто. Добавленная — наоборот.
    expect(rows).toContain('1')
    expect(rows).toContain('')
  })

  it('номера выключаются пропом', () => {
    const wrapper = mount(GrDiff, { props: { before: 'a', after: 'b', lineNumbers: false } })

    expect(wrapper.findAll('.gr-diff__gutter')).toHaveLength(0)
  })

  describe('схлопывание', () => {
    const long = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
    const changed = long.replace('line 15', 'line 15 changed')

    /** Сколько строк показано: пропуск строкой не считается. */
    const shownLines = (wrapper: { findAll: (s: string) => unknown[] }) =>
      wrapper.findAll('.gr-diff__row').length

    it('длинный неизменный участок сворачивается в пропуск с двумя краями', () => {
      const wrapper = mount(GrDiff, { props: { before: long, after: changed, context: 2 } })
      const buttons = wrapper.findAll('button')

      // Скрыто 13 строк при шаге 10 — значит края открываются раздельно.
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(buttons[0]!.attributes('aria-label')).toMatch(/top of the gap|в начале пропуска/)
      expect(buttons.at(-1)!.attributes('aria-label')).toMatch(/bottom of the gap|в конце пропуска/)
    })

    it('нажатие открывает ровно шаг, а не весь пропуск', async () => {
      const wrapper = mount(GrDiff, {
        props: { before: long, after: changed, context: 2, expandStep: 4 },
      })
      const before = shownLines(wrapper)

      await wrapper.get('button').trigger('click')

      expect(shownLines(wrapper) - before).toBe(4)
      expect(wrapper.emitted('expand')?.[0]).toEqual([expect.any(String), 'top'])
    })

    it('второе нажатие открывает ещё шаг, а не начинает заново', async () => {
      const wrapper = mount(GrDiff, {
        props: { before: long, after: changed, context: 2, expandStep: 4 },
      })
      const before = shownLines(wrapper)

      await wrapper.get('button').trigger('click')
      await wrapper.get('button').trigger('click')

      expect(shownLines(wrapper) - before).toBe(8)
    })

    it('края открываются независимо друг от друга', async () => {
      const wrapper = mount(GrDiff, {
        props: { before: long, after: changed, context: 2, expandStep: 4 },
      })

      const buttons = wrapper.findAll('button')
      await buttons[0]!.trigger('click')
      await wrapper.findAll('button').at(-1)!.trigger('click')

      expect(wrapper.emitted('expand')?.map(call => call[1])).toEqual(['top', 'bottom'])
    })

    /**
     * Остаток в один шаг открывается целиком: кнопка, которая больше ничего не
     * откроет, — тупик, в который упираются один раз и больше ей не верят.
     */
    it('остаток меньше шага открывается целиком, и пропуск исчезает', async () => {
      // Верхний пропуск прячет 13 строк при шаге 10.
      const wrapper = mount(GrDiff, { props: { before: long, after: changed, context: 2 } })

      // Два края у верхнего пропуска и два у нижнего.
      expect(wrapper.findAll('button')).toHaveLength(4)

      await wrapper.get('button').trigger('click')

      // Осталось три — краям больше нечего делить, полоса становится одной кнопкой.
      const afterStep = wrapper.findAll('button')
      expect(afterStep).toHaveLength(3)

      await afterStep[0]!.trigger('click')

      // Верхний пропуск открылся целиком и исчез; нижний не тронут.
      expect(wrapper.findAll('button')).toHaveLength(2)
    })

    /**
     * Строки встают **над** пропуском, и без поправки содержимое уезжает вниз
     * ровно на их высоту: пользователь нажал «показать ещё» и потерял из виду
     * ту самую правку, ради которой смотрел. Ровно так выглядел исходный отчёт
     * «строки пропадают».
     *
     * В jsdom раскладки нет, поэтому высота подменяется счётом отрисованных
     * рядов — измеряется поправка, а не вёрстка.
     */
    it('раскрытие сверху удерживает позицию, снизу — прокрутку не трогает', async () => {
      const wrapper = mount(GrDiff, {
        props: { before: long, after: changed, context: 2, expandStep: 4, maxHeight: 200 },
        attachTo: document.body,
      })

      const scroller = wrapper.get('[class*="overflow-auto"]').element as HTMLElement
      const ROW = 20
      const height = () => wrapper.findAll('.gr-diff__row').length * ROW

      Object.defineProperty(scroller, 'scrollHeight', { get: height })
      Object.defineProperty(scroller, 'clientHeight', { get: () => 100 })

      const grew = height()
      await wrapper.get('button').trigger('click')
      await flushPromises()

      // Поправка равна приросту: пропуск остался ровно там, где был.
      expect(scroller.scrollTop).toBe(height() - grew)
      expect(scroller.scrollTop).toBeGreaterThan(0)

      const afterTop = scroller.scrollTop
      await wrapper.findAll('button').at(-1)!.trigger('click')
      await flushPromises()

      expect(scroller.scrollTop).toBe(afterTop)
    })

    it('пропуск в один шаг показывает одну кнопку на всю полосу', () => {
      const short = Array.from({ length: 12 }, (_, i) => `line ${i}`).join('\n')
      const wrapper = mount(GrDiff, {
        props: { before: short, after: short.replace('line 0', 'line 0 changed'), context: 1, expandStep: 10 },
      })
      const buttons = wrapper.findAll('button')

      expect(buttons).toHaveLength(1)
      expect(buttons[0]!.text()).toMatch(/more lines|ещё/)
    })
  })

  describe('режим split', () => {
    it('замена строки встаёт в одну пару колонок', () => {
      const wrapper = mount(GrDiff, {
        props: { before: BEFORE, after: AFTER, mode: 'split', context: 5 },
      })

      const rows = wrapper.findAll('.gr-diff__row')
      const withBothSides = rows.filter(row => row.text().includes('const b = 2') && row.text().includes('const b = 20'))

      expect(withBothSides.length).toBe(1)
    })

    /**
     * Цвет — не единственный носитель смысла (WCAG 1.4.1), и обещание это
     * пакет даёт списком возможностей. В `unified` знак был всегда, а в `split`
     * его не было вовсе: на монохромной печати колонки становились одинаковыми.
     */
    it('знак стоит в обеих колонках, а не только в unified', () => {
      const wrapper = mount(GrDiff, {
        props: { before: BEFORE, after: AFTER, mode: 'split', context: 5 },
      })

      const changed = wrapper.findAll('.gr-diff__row')
        .find(row => row.text().includes('const b = 20'))!

      expect(changed.text()).toContain('−')
      expect(changed.text()).toContain('+')
    })

    it('блок из нескольких строк идёт парами, а не лесенкой', () => {
      const wrapper = mount(GrDiff, {
        props: {
          before: 'head\nsigned: false\nstatus: draft\ntail',
          after: 'head\nsigned: true\nstatus: signed\ntail',
          mode: 'split',
          context: 5,
        },
      })

      const rows = wrapper.findAll('.gr-diff__row').map(row => row.text())

      expect(rows.some(text => text.includes('signed: false') && text.includes('signed: true'))).toBe(true)
      expect(rows.some(text => text.includes('status: draft') && text.includes('status: signed'))).toBe(true)
      // Строки разных правок вместе не встают.
      expect(rows.some(text => text.includes('status: draft') && text.includes('signed: true'))).toBe(false)
    })

    it('слот row-actions доступен и в split', () => {
      const wrapper = mount(GrDiff, {
        props: { before: BEFORE, after: AFTER, mode: 'split', context: 5 },
        slots: { 'row-actions': '<span class="probe">·</span>' },
      })

      expect(wrapper.findAll('.probe').length).toBeGreaterThan(0)
    })
  })

  describe('бюджет', () => {
    it('исчерпание эмитится и объявляется в сводке', () => {
      const wrapper = mount(GrDiff, {
        props: { before: 'a\nb\nc', after: 'x\ny\nz', budget: 1 },
      })

      expect(wrapper.emitted('budgetExceeded')).toHaveLength(1)
      expect(wrapper.get('[role="status"]').text()).toMatch(/coarser|огрублённ/)
    })
  })

  describe('не-строки', () => {
    /**
     * Порядок ключей — не изменение. Без устойчивой сериализации потребитель
     * увидел бы правку там, где её не было.
     */
    it('объекты с разным порядком ключей дают пустой дифф', () => {
      const wrapper = mount(GrDiff, {
        props: { before: { a: 1, b: 2 }, after: { b: 2, a: 1 } },
      })

      expect(wrapper.get('[role="status"]').text()).toMatch(/No changes|Изменений нет/)
    })

    it('настоящая правка объекта видна', () => {
      const wrapper = mount(GrDiff, {
        props: { before: { a: 1 }, after: { a: 2 } },
      })

      expect(wrapper.get('[role="status"]').text()).not.toMatch(/No changes|Изменений нет/)
    })
  })

  describe('подсветка', () => {
    it('без подсветки строки видны как текст', () => {
      const wrapper = mount(GrDiff, { props: { before: BEFORE, after: AFTER } })

      expect(wrapper.text()).toContain('const a = 1')
    })

    it('подключённая подсветка красит строки ролями', async () => {
      const wrapper = mount(GrDiff, {
        props: {
          before: BEFORE,
          after: AFTER,
          language: 'ts',
          highlighter: (code: string) => code.split('\n').map(text => [{ text, role: 'keyword' as const }]),
        },
      })

      await flushPromises()

      expect(wrapper.html()).toContain('--gr-code-block-keyword')
    })
  })

  describe('встроенный разбор', () => {
    /**
     * Сравнивают чаще всего то, что до этого смотрели блоком. Оставь дифф без
     * встроенного разбора — один и тот же JSON на соседних экранах выглядел бы
     * по-разному, и объяснить это пользователю нечем.
     */
    // Неизменная строка: у изменённой роль перекрывает пословная подсветка.
    const BEFORE = '{\n  "keep": 1,\n  "a": 1\n}'
    const AFTER = '{\n  "keep": 1,\n  "a": 2\n}'

    it('JSON красится тем же разбором, что и блок, без подсветки приложения', () => {
      const wrapper = mount(GrDiff, {
        props: { before: BEFORE, after: AFTER, language: 'json' },
      })

      expect(wrapper.html()).toContain('--gr-code-block-key')
      expect(wrapper.html()).toContain('--gr-code-block-number')
    })

    /**
     * Объект сериализует сам компонент — значит это JSON. Оставь по умолчанию
     * `text`, и сравнение записей показало бы серым ровно то, что блок на
     * соседнем экране красит.
     */
    it('сравнение значений разбирается как JSON без явного языка', () => {
      const wrapper = mount(GrDiff, {
        props: { before: { keep: 1, a: 1 }, after: { keep: 1, a: 2 } },
      })

      expect(wrapper.html()).toContain('--gr-code-block-key')
    })

    it('сравнение строк без явного языка остаётся текстом', () => {
      const wrapper = mount(GrDiff, { props: { before: BEFORE, after: AFTER } })

      expect(wrapper.html()).not.toContain('--gr-code-block-key')
    })

    it('явный язык сильнее вывода из входа', () => {
      const wrapper = mount(GrDiff, {
        props: { before: { keep: 1, a: 1 }, after: { keep: 1, a: 2 }, language: 'text' },
      })

      expect(wrapper.html()).not.toContain('--gr-code-block-key')
    })

    it('язык без встроенного разбора остаётся обычным текстом', () => {
      const wrapper = mount(GrDiff, {
        props: { before: BEFORE, after: AFTER, language: 'text' },
      })

      expect(wrapper.html()).not.toContain('--gr-code-block-key')
    })
  })

  describe('пословная подсветка', () => {
    it('в паре «удалено/добавлено» отмечено изменённое слово, а не строка целиком', () => {
      const wrapper = mount(GrDiff, {
        props: { before: 'const b = 2', after: 'const b = 20', context: 5 },
      })

      // Общая часть строки остаётся без плотной подложки — иначе правка одного
      // слова читалась бы как «строка целиком другая».
      expect(wrapper.html()).toContain('--gr-diff-word-added')
      expect(wrapper.html()).toContain('--gr-diff-word-removed')
    })
  })

  describe('готовый дифф с бэкенда', () => {
    it('`hunks` сильнее `before`/`after`', () => {
      const wrapper = mount(GrDiff, {
        props: {
          before: 'игнорируется',
          after: 'тоже',
          hunks: [
            { op: 'equal' as const, lines: ['одинаково'] },
            { op: 'add' as const, lines: ['добавлено'] },
          ],
        },
      })

      const text = wrapper.get('[role="region"]').text()

      expect(text).toContain('одинаково')
      expect(text).toContain('добавлено')
      expect(text).not.toContain('игнорируется')
    })
  })
})

/**
 * Признак изменения не может держаться на одном цвете: строка отличается тоном,
 * а знак `+`/`−` спрятан от доступного дерева. Без подписи скринридер читает
 * дифф как две копии текста подряд — то есть не читает его вовсе.
 */
describe('GrDiff: изменение доступно не только цветом', () => {
  it('добавленная и удалённая строки подписаны для скринридера', async () => {
    const wrapper = mount(GrDiff, { props: { before: 'a\nb', after: 'a\nc' } })
    await flushPromises()

    const labels = wrapper.findAll('.sr-only').map(node => node.text())

    expect(labels).toContain('removed')
    expect(labels).toContain('added')
  })

  it('неизменённые строки молчат — иначе подпись была бы у каждой строки', async () => {
    const wrapper = mount(GrDiff, { props: { before: 'a\nb', after: 'a\nb' } })
    await flushPromises()

    expect(wrapper.findAll('.sr-only')).toHaveLength(0)
  })

  it('в split-раскладке подписана каждая сторона', async () => {
    const wrapper = mount(GrDiff, { props: { before: 'a', after: 'b', mode: 'split' } })
    await flushPromises()

    const labels = wrapper.findAll('.sr-only').map(node => node.text())

    expect(labels).toContain('removed')
    expect(labels).toContain('added')
  })

  it('визуальный знак остаётся скрытым от доступного дерева', async () => {
    const wrapper = mount(GrDiff, { props: { before: 'a', after: 'b' } })
    await flushPromises()

    const signs = wrapper.findAll('[aria-hidden="true"]').map(node => node.text())

    expect(signs.some(text => text === '+' || text === '−')).toBe(true)
  })
})
