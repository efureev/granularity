import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import { componentSheet } from '../../../__tests__/componentSheet'
import GrBadge from '../GrBadge.vue'

const { look } = componentSheet('GrBadge/GrBadge.vue')
const label = (wrapper: { element: Element }) => wrapper.element.firstElementChild!
const text = (wrapper: { element: Element }) => label(wrapper).lastElementChild!

describe('GrBadge', () => {
  it('рендерит light-tone по указанному tone', () => {
    const wrapper = mount(GrBadge, { props: { tone: 'success' }, slots: { default: 'Success' } })
    const style = look(wrapper.element)

    expect(wrapper.text()).toContain('Success')
    expect(style['background-color']).toBe('var(--gr-success-light)')
    // Именно `-text`, а не `--gr-success`: насыщенный тон на своей же светлой
    // подложке даёт 2.24:1.
    expect(style.color).toBe('var(--gr-success-text)')
    // Вид — атрибуты и лист компонента: разметка метки не несёт строки утилит.
    expect(wrapper.attributes('class')).toBeUndefined()
  })

  it('поддерживает size: sm / md / lg', () => {
    const styleOf = (size: 'sm' | 'md' | 'lg') => look(mount(GrBadge, { props: { size }, slots: { default: size } }).element)

    expect(styleOf('sm')).toMatchObject({ 'font-size': 'var(--gr-control-text-xs)', 'padding': '0.125rem 0.625rem' })
    expect(styleOf('md')).toMatchObject({ 'font-size': 'var(--gr-control-text-sm)', 'padding': '0.25rem 0.75rem' })
    expect(styleOf('lg')).toMatchObject({ 'font-size': 'var(--gr-control-text-md)', 'padding': '0.375rem 0.875rem' })
  })

  it('поддерживает радиусы square / semi / round', () => {
    const radiusOf = (props: Record<string, unknown>) => look(mount(GrBadge, { props, slots: { default: 'R' } }).element)['border-radius']

    expect(radiusOf({ radius: 'square' })).toBe('var(--gr-radius-none)')
    expect(radiusOf({ radius: 'semi', size: 'lg' })).toBe('var(--gr-badge-semi-radius-lg)')
    expect(radiusOf({ radius: 'round' })).toBe('var(--gr-radius-full)')
  })

  it('рендерит dark filled tone при dark=true', () => {
    const style = look(mount(GrBadge, { props: { tone: 'success', dark: true, size: 'lg', radius: 'semi' }, slots: { default: 'Success' } }).element)

    // Заливка filled идёт через покомпонентный слой: вес у тем разный (в светлой
    // это `-solid` под светлый текст, в тёмной — роль тона под тёмный).
    expect(style['background-color']).toBe('var(--gr-badge-success-bg)')
    // Полярность текста задаёт тема, а не захардкоженный `text-white`: тот давал
    // 2.54:1 в light и 1.92:1 в dark.
    expect(style.color).toBe('var(--gr-badge-success-fg)')
    expect(style['border-radius']).toBe('var(--gr-badge-semi-radius-lg)')
  })

  it('поддерживает новые tones slate и azure', () => {
    const slate = look(mount(GrBadge, { props: { tone: 'slate' }, slots: { default: 'Slate' } }).element)
    const azure = look(mount(GrBadge, { props: { tone: 'azure', dark: true }, slots: { default: 'Azure' } }).element)

    expect(slate['background-color']).toBe('var(--gr-slate-light)')
    expect(slate.color).toBe('var(--gr-slate-text)')
    expect(azure['background-color']).toBe('var(--gr-badge-azure-bg)')
    expect(azure.color).toBe('var(--gr-badge-azure-fg)')
  })

  /**
   * Ролей у бейджа нет намеренно, и это тоже контракт.
   *
   * Метка статуса — оформление вокруг текста: роль вроде `status` заставила бы
   * скринридер объявлять её при каждом появлении, а `img` — требовать
   * доступного имени, которого у бейджа не бывает. Тест утверждает отсутствие,
   * потому что лишняя роль приезжает тихо и axe считает её валидной.
   */
  it('не навешивает ни роли, ни aria-атрибутов', () => {
    const wrapper = mount(GrBadge, { props: { tone: 'danger' }, slots: { default: '3' } })

    for (const el of [wrapper.element, ...wrapper.element.querySelectorAll('*')]) {
      expect(el.getAttribute('role'), el.outerHTML).toBeNull()
      expect(
        [...el.attributes].map(a => a.name).filter(name => name.startsWith('aria-')),
        el.outerHTML,
      ).toEqual([])
    }
  })

  it('текст лежит в собственном узле и достаётся скринридеру', () => {
    // `text-box-trim` живёт на узле текста, а не на корне: если содержимое
    // переедет, обрезка перестанет попадать в текст и вернётся косой базлайн.
    const wrapper = mount(GrBadge, { slots: { default: 'Черновик' } })

    expect(text(wrapper).textContent).toBe('Черновик')
    expect(look(text(wrapper))['text-box-trim']).toBe('trim-both')
    expect(text(wrapper).getAttribute('aria-hidden')).toBeNull()
  })
})

/**
 * Переименование пропа проходит у потребителя молча: незнакомый атрибут Vue
 * сажает на корневой узел, поэтому не падают ни типы, ни рантайм — компонент
 * рисуется дефолтом. Так тихо разъехались десять мест в стороннем пакете.
 */
describe('GrBadge — снятое имя пропа', () => {
  it('предупреждает про `variant` и не меняет вид', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrBadge, { attrs: { variant: 'danger' } })

      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain('`variant` переименован в `tone`')
      // Предупреждение ничего не чинит за потребителя: алиас после 1.0 остался
      // бы навсегда.
      expect(wrapper.attributes('data-gr-tone')).toBe('neutral')
      wrapper.unmount()
    }
    finally {
      warn.mockRestore()
    }
  })

  describe('слот `icon`', () => {
    it('без слота узла иконки нет', () => {
      const wrapper = mount(GrBadge, { slots: { default: 'Готово' } })

      expect(wrapper.find('[data-gr-badge-icon]').exists()).toBe(false)
    })

    it('рендерит иконку перед подписью', () => {
      const wrapper = mount(GrBadge, {
        slots: {
          icon: '<svg data-testid="spinner" />',
          default: 'На распознании',
        },
      })

      const icon = wrapper.find('[data-gr-badge-icon]')

      expect(icon.exists()).toBe(true)
      expect(icon.find('[data-testid="spinner"]').exists()).toBe(true)
      // Порядок узлов, а не только факт наличия: иконка стоит перед подписью.
      expect(label(wrapper).firstElementChild).toBe(icon.element)
    })

    it.each([
      ['xs', '0.75rem'],
      ['sm', '0.875rem'],
      ['md', '1rem'],
      ['lg', '1rem'],
    ] as const)('size `%s` → размер иконки `%s`', (size, expected) => {
      const wrapper = mount(GrBadge, {
        props: { size },
        slots: { icon: '<svg />', default: 'Метка' },
      })

      expect(look(wrapper.get('[data-gr-badge-icon]').element)).toMatchObject({ 'width': expected, 'height': expected, 'flex-shrink': '0' })
    })
  })

  it('на `tone` не жалуется', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrBadge, { props: { tone: 'danger' } })

      expect(warn).not.toHaveBeenCalled()
      wrapper.unmount()
    }
    finally {
      warn.mockRestore()
    }
  })
})

describe('GrBadge · точка-маркер', () => {
  it('по умолчанию маркера нет', () => {
    const wrapper = mount(GrBadge, { slots: { default: 'Черновик' } })

    expect(wrapper.find('[data-gr-badge-dot]').exists()).toBe(false)
  })

  it('булев `dot` берёт тон самого бейджа', () => {
    const wrapper = mount(GrBadge, {
      props: { tone: 'success', dot: true },
      slots: { default: 'Оплачено' },
    })

    expect(look(wrapper.get('[data-gr-badge-dot]').element)['background-color']).toBe('var(--gr-badge-success-bg)')
  })

  it('названный тон красит маркер отдельно от плашки', () => {
    const wrapper = mount(GrBadge, {
      props: { tone: 'neutral', dot: 'warning' },
      slots: { default: 'Ждёт оплаты' },
    })

    // Ради этой пары паттерн и существует: тихая плашка, цветной маркер.
    expect(look(wrapper.get('[data-gr-badge-dot]').element)['background-color']).toBe('var(--gr-badge-warning-bg)')
    expect(look(wrapper.element)['background-color']).toBe('var(--gr-muted)')
  })

  it('на заливке маркер всегда цвета текста, и названный тон предупреждает', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrBadge, {
        props: { tone: 'neutral', dark: true, dot: 'success' },
        slots: { default: 'Активен' },
      })

      // Подложка filled-бейджа берётся из того же слоя — тон слился бы с ней.
      expect(look(wrapper.get('[data-gr-badge-dot]').element)['background-color']).toBe('currentColor')
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain('success')
    }
    finally {
      warn.mockRestore()
    }
  })

  it('иконка вытесняет маркер и объясняет это', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrBadge, {
        props: { dot: 'danger' },
        slots: { default: 'Ошибка', icon: '<svg />' },
      })

      expect(wrapper.find('[data-gr-badge-dot]').exists()).toBe(false)
      expect(wrapper.find('[data-gr-badge-icon]').exists()).toBe(true)
      expect(warn).toHaveBeenCalledTimes(1)
    }
    finally {
      warn.mockRestore()
    }
  })

  it('маркер декоративен и не лезет в обрезанный текст', () => {
    const wrapper = mount(GrBadge, {
      props: { dot: 'info' },
      slots: { default: 'Активен' },
    })
    const dot = wrapper.get('[data-gr-badge-dot]')

    expect(dot.attributes('aria-hidden')).toBe('true')
    // `text-box-trim` живёт на подписи; попади маркер внутрь — потянул бы высоту.
    expect(dot.element.parentElement).toBe(label(wrapper))
    expect(text(wrapper).querySelector('[data-gr-badge-dot]')).toBeNull()
  })

  it('размер маркера идёт за ступенью бейджа', () => {
    const expected = { xs: '0.375rem', sm: '0.375rem', md: '0.5rem', lg: '0.5rem' } as const
    for (const size of (['xs', 'sm', 'md', 'lg'] as const)) {
      const wrapper = mount(GrBadge, { props: { size, dot: true }, slots: { default: 'X' } })

      expect(look(wrapper.get('[data-gr-badge-dot]').element), size).toMatchObject({ width: expected[size], height: expected[size] })
    }
  })
})

describe('GrBadge — голый атрибут `dot`', () => {
  // Документация пишет `<GrBadge tone="success" dot>`. В шаблоне это пустая
  // строка, и флагом она становится, только если `Boolean` в рантайм-типе пропа
  // стоит раньше `String` — иначе Vue оставляет `''`, и точка молча пропадает.
  it('рисует точку, как и `:dot="true"`', () => {
    // Так шаблон и передаёт голый атрибут: пустой строкой.
    const wrapper = mount(() => h(GrBadge, { tone: 'success', dot: '' } as never, () => 'Paid'))

    expect(wrapper.find('[data-gr-badge-dot]').exists()).toBe(true)
  })
})
