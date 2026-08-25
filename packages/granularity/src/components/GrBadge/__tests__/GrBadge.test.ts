import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GrBadge from '../GrBadge.vue'

describe('GrBadge', () => {
  it('рендерит light-tone по указанному tone', () => {
    const wrapper = mount(GrBadge, {
      props: {
        tone: 'success',
      },
      slots: {
        default: 'Success',
      },
    })

    expect(wrapper.text()).toContain('Success')
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-success-light)]')
    // Именно `-text`, а не `--gr-success`: насыщенный тон на своей же светлой
    // подложке даёт 2.24:1.
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-success-text)]')
  })

  it('поддерживает size: sm / md / lg', () => {
    const sm = mount(GrBadge, { props: { size: 'sm' }, slots: { default: 'SM' } })
    expect(sm.attributes('class')).toContain('text-[length:var(--gr-control-text-xs)]')
    expect(sm.attributes('class')).toContain('px-2')

    const md = mount(GrBadge, { props: { size: 'md' }, slots: { default: 'MD' } })
    expect(md.attributes('class')).toContain('text-[length:var(--gr-control-text-sm)]')
    expect(md.attributes('class')).toContain('px-3')

    const lg = mount(GrBadge, { props: { size: 'lg' }, slots: { default: 'LG' } })
    expect(lg.attributes('class')).toContain('text-[length:var(--gr-control-text-md)]')
    expect(lg.attributes('class')).toContain('px-3')
    expect(lg.attributes('class')).toContain('py-1')
  })

  it('поддерживает радиусы square / semi / round', () => {
    const square = mount(GrBadge, { props: { radius: 'square' }, slots: { default: 'Square' } })
    expect(square.attributes('class')).toContain('rounded-[var(--gr-radius-none)]')

    const semi = mount(GrBadge, {
      props: { radius: 'semi', size: 'lg' },
      slots: { default: 'Semi' },
    })
    expect(semi.attributes('class')).toContain('rounded-[var(--gr-badge-semi-radius-lg,7px)]')

    const round = mount(GrBadge, { props: { radius: 'round' }, slots: { default: 'Round' } })
    expect(round.attributes('class')).toContain('rounded-[var(--gr-radius-full)]')
  })

  it('рендерит dark filled tone при dark=true', () => {
    const wrapper = mount(GrBadge, {
      props: {
        tone: 'success',
        dark: true,
        size: 'lg',
        radius: 'semi',
      },
      slots: {
        default: 'Success',
      },
    })

    // Заливка filled идёт через покомпонентный слой: вес у тем разный (в светлой
    // это `-solid` под светлый текст, в тёмной — роль тона под тёмный).
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-badge-success-bg,var(--gr-success-solid))]')
    // Полярность текста задаёт тема, а не захардкоженный `text-white`: тот давал
    // 2.54:1 в light и 1.92:1 в dark.
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-badge-success-fg,var(--gr-success-solid-fg))]')
    expect(wrapper.attributes('class')).toContain('rounded-[var(--gr-badge-semi-radius-lg,7px)]')
  })

  it('поддерживает новые tones slate и azure', () => {
    const slate = mount(GrBadge, {
      props: { tone: 'slate' },
      slots: { default: 'Slate' },
    })

    const azure = mount(GrBadge, {
      props: { tone: 'azure', dark: true },
      slots: { default: 'Azure' },
    })

    expect(slate.attributes('class')).toContain('bg-[var(--gr-slate-light)]')
    expect(slate.attributes('class')).toContain('text-[var(--gr-slate-text)]')
    expect(azure.attributes('class')).toContain('bg-[var(--gr-badge-azure-bg,var(--gr-azure-solid))]')
    expect(azure.attributes('class')).toContain('text-[var(--gr-badge-azure-fg,var(--gr-azure-solid-fg))]')
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
      expect(el.getAttribute('role'), el.className).toBeNull()
      expect(
        [...el.attributes].map(a => a.name).filter(name => name.startsWith('aria-')),
        el.className,
      ).toEqual([])
    }
  })

  it('текст лежит в собственном узле и достаётся скринридеру', () => {
    // `text-box-trim` живёт на `.gr-badge__text`, а не на корне: если содержимое
    // переедет, обрезка перестанет попадать в текст и вернётся косой базлайн.
    const wrapper = mount(GrBadge, { slots: { default: 'Черновик' } })

    expect(wrapper.get('.gr-badge__text').text()).toBe('Черновик')
    expect(wrapper.get('.gr-badge__text').attributes('aria-hidden')).toBeUndefined()
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
      expect(wrapper.classes().join(' ')).not.toContain('danger')
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
      expect(wrapper.find('.gr-badge__label').element.firstElementChild)
        .toBe(icon.element)
    })

    it.each([
      ['xs', 'h-3'],
      ['sm', 'h-3.5'],
      ['md', 'h-4'],
      ['lg', 'h-4'],
    ] as const)('size `%s` → размер иконки `%s`', (size, expected) => {
      const wrapper = mount(GrBadge, {
        props: { size },
        slots: { icon: '<svg />', default: 'Метка' },
      })

      expect(wrapper.find('[data-gr-badge-icon]').classes()).toContain(expected)
      expect(wrapper.find('[data-gr-badge-icon]').classes()).toContain('shrink-0')
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
