import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import GrTable from '../GrTable.vue'

type ScrollApi = { scrollToRow: (index: number, options?: ScrollIntoViewOptions) => boolean }

describe('GrTable', () => {
  it('рендерит header и body slots внутри таблицы', () => {
    const wrapper = mount(GrTable, {
      slots: {
        header: '<tr><th>Title</th></tr>',
        default: '<tr><td>Value</td></tr>',
      },
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').text()).toContain('Title')
    expect(wrapper.find('tbody').text()).toContain('Value')
  })

  it('рендерит tfoot только при наличии слота #footer', () => {
    const without = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(without.find('tfoot').exists()).toBe(false)

    const withFoot = mount(GrTable, {
      slots: {
        default: '<tr><td>x</td></tr>',
        footer: '<tr><td>total</td></tr>',
      },
    })
    expect(withFoot.find('tfoot').exists()).toBe(true)
    expect(withFoot.find('tfoot').text()).toContain('total')
  })

  it('рендерит caption из пропа как sr-only', () => {
    const wrapper = mount(GrTable, {
      props: { caption: 'Users list' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    const caption = wrapper.find('caption')
    expect(caption.exists()).toBe(true)
    expect(caption.text()).toBe('Users list')
    expect(caption.classes()).toContain('sr-only')
  })

  it('слот #caption имеет приоритет над пропом', () => {
    const wrapper = mount(GrTable, {
      props: { caption: 'from prop' },
      slots: {
        caption: 'from slot',
        default: '<tr><td>x</td></tr>',
      },
    })
    expect(wrapper.find('caption').text()).toBe('from slot')
  })

  it('не рендерит caption, если не задан ни проп, ни слот', () => {
    const wrapper = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(wrapper.find('caption').exists()).toBe(false)
  })

  // Скролл обязан быть достижим с клавиатуры всегда (WCAG 2.1.1): раньше
  // `tabindex` появлялся только вместе с `regionLabel`, и широкую таблицу без
  // метки нельзя было проскроллить вообще.
  it('скролл-контейнер в таб-порядке всегда, region — по наличию метки', () => {
    const withRegion = mount(GrTable, {
      props: { regionLabel: 'Scrollable users table' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    const scroll = withRegion.find('[data-gr-table-scroll]')
    expect(scroll.attributes('role')).toBe('region')
    expect(scroll.attributes('tabindex')).toBe('0')
    expect(scroll.attributes('aria-label')).toBe('Scrollable users table')

    const without = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    const scrollNo = without.find('[data-gr-table-scroll]')
    expect(scrollNo.attributes('role')).toBeUndefined()
    expect(scrollNo.attributes('tabindex')).toBe('0')
  })

  it('пробрасывает aria-label / aria-labelledby на <table>', () => {
    const wrapperLabel = mount(GrTable, {
      props: { ariaLabel: 'Users' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    expect(wrapperLabel.find('table').attributes('aria-label')).toBe('Users')

    const wrapperBy = mount(GrTable, {
      props: { ariaLabel: 'ignored', ariaLabelledby: 'caption-id' },
      slots: { default: '<tr><td>x</td></tr>' },
    })
    expect(wrapperBy.find('table').attributes('aria-labelledby')).toBe('caption-id')
    expect(wrapperBy.find('table').attributes('aria-label')).toBeUndefined()
  })

  it('меняет размер текста по size', () => {
    const defaultSize = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })
    expect(defaultSize.find('table').classes()).toContain('text-[length:var(--gr-control-text-md)]')

    const expected: Record<string, string> = {
      xs: 'text-[length:var(--gr-control-text-xs)]',
      sm: 'text-[length:var(--gr-control-text-sm)]',
      md: 'text-[length:var(--gr-control-text-md)]',
      lg: 'text-[length:var(--gr-control-text-lg)]',
    }

    for (const [size, className] of Object.entries(expected)) {
      const wrapper = mount(GrTable, {
        props: { size: size as 'xs' | 'sm' | 'md' | 'lg' },
        slots: { default: '<tr><td>x</td></tr>' },
      })
      expect(wrapper.find('table').classes(), size).toContain(className)
    }
  })
})

describe('GrTable — состояния', () => {
  it('пустоту определяет по содержимому слота', () => {
    const wrapper = mount(GrTable, { props: { columnCount: 3 } })

    const cell = wrapper.get('[data-gr-table-empty] td')
    expect(cell.attributes('colspan')).toBe('3')
    expect(cell.text()).toBe('Nothing here yet')
  })

  it('слот #empty и emptyText перекрывают текст', () => {
    const withText = mount(GrTable, { props: { emptyText: 'Нет заявок' } })
    expect(withText.get('[data-gr-table-empty]').text()).toBe('Нет заявок')

    const withSlot = mount(GrTable, { slots: { empty: '<button data-testid="cta">Создать</button>' } })
    expect(withSlot.find('[data-testid="cta"]').exists()).toBe(true)
  })

  it('со строками пустое состояние не показывается', () => {
    const wrapper = mount(GrTable, { slots: { default: '<tr><td>x</td></tr>' } })

    expect(wrapper.find('[data-gr-table-empty]').exists()).toBe(false)
  })

  it('loading рисует скелетоны и помечает контейнер aria-busy', () => {
    const wrapper = mount(GrTable, {
      props: { loading: true, loadingRows: 4 },
      slots: { default: '<tr><td>x</td></tr>' },
    })

    expect(wrapper.get('[data-gr-table-scroll]').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('[data-gr-table-loading-row]')).toHaveLength(4)
    expect(wrapper.find('[data-gr-table-empty]').exists()).toBe(false)
  })

  it('striped и hoverable вешаются на tbody', () => {
    const wrapper = mount(GrTable, {
      props: { striped: true, hoverable: true },
      slots: { default: '<tr><td>x</td></tr>' },
    })

    const tbody = wrapper.get('tbody')
    expect(tbody.attributes('class')).toContain('nth-child(even)')
    expect(tbody.attributes('class')).toContain('tr:hover')
  })
})

describe('GrTable — императивный API', () => {
  const threeRows = `
    <tr data-testid="r0"><td>a</td></tr>
    <tr data-testid="r1"><td>b</td></tr>
    <tr data-testid="r2"><td>c</td></tr>
  `

  it('scrollToRow доводит до строки по индексу с дефолтом block: nearest', () => {
    const wrapper = mount(GrTable, { slots: { default: threeRows }, attachTo: document.body })
    const row = wrapper.get('[data-testid="r1"]').element as HTMLElement
    const scrollIntoView = vi.fn()
    row.scrollIntoView = scrollIntoView

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(1)).toBe(true)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    wrapper.unmount()
  })

  it('scrollToRow пробрасывает свои ScrollIntoViewOptions', () => {
    const wrapper = mount(GrTable, { slots: { default: threeRows }, attachTo: document.body })
    const row = wrapper.get('[data-testid="r0"]').element as HTMLElement
    const scrollIntoView = vi.fn()
    row.scrollIntoView = scrollIntoView

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(0, { block: 'center' })).toBe(true)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
    wrapper.unmount()
  })

  it('индекс вне диапазона — false', () => {
    const wrapper = mount(GrTable, { slots: { default: threeRows }, attachTo: document.body })

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(3)).toBe(false)
    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(-1)).toBe(false)
    wrapper.unmount()
  })

  it('в loading строки-скелетоны не адресуются', () => {
    const wrapper = mount(GrTable, {
      props: { loading: true, loadingRows: 3 },
      slots: { default: threeRows },
      attachTo: document.body,
    })

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(0)).toBe(false)
    wrapper.unmount()
  })

  it('в пустом состоянии служебная строка не адресуется', () => {
    const wrapper = mount(GrTable, { attachTo: document.body })

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(0)).toBe(false)
    wrapper.unmount()
  })

  it('вложенная таблица в ячейке не сдвигает индексацию строк', () => {
    const wrapper = mount(GrTable, {
      slots: {
        default: `
          <tr data-testid="outer0"><td><table><tbody><tr><td>inner</td></tr></tbody></table></td></tr>
          <tr data-testid="outer1"><td>b</td></tr>
        `,
      },
      attachTo: document.body,
    })
    const outer = wrapper.get('[data-testid="outer1"]').element as HTMLElement
    const scrollIntoView = vi.fn()
    outer.scrollIntoView = scrollIntoView

    expect((wrapper.vm as unknown as ScrollApi).scrollToRow(1)).toBe(true)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    wrapper.unmount()
  })
})
