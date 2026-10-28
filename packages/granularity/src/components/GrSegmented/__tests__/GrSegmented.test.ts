import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { granularityGlobal } from '../../../testing'

import GrFormField from '../../GrFormField/GrFormField.vue'
import GrSegmented from '../GrSegmented.vue'
import { componentSheet } from '../../../__tests__/componentSheet'

const { cascade, look } = componentSheet('GrSegmented/GrSegmented.vue')
/** Объявления листа на корне — формулы как написаны, без подстановки. */
const declared = (wrapper: { get: (selector: string) => { element: Element } }) => cascade(wrapper.get('[data-gr-segmented]').element)

const options = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
] as const

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = []

  readonly callback: ResizeObserverCallback
  observe = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    ResizeObserverMock.instances.push(this)
  }

  trigger(entries: ResizeObserverEntry[] = []) {
    this.callback(entries, this as unknown as ResizeObserver)
  }
}

function createRect({ left, top = 0, width, height }: { left: number, top?: number, width: number, height: number }) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {
      return this
    },
  }
}

describe('GrSegmented', () => {
  const originalResizeObserver = globalThis.ResizeObserver
  let rectSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ResizeObserverMock.instances = []
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLElement) {
      if (this.hasAttribute('data-gr-segmented')) {
        return createRect({ left: 0, width: 260, height: 48 })
      }

      if (this.hasAttribute('data-gr-segmented-item')) {
        const value = this.getAttribute('data-value')

        if (value === 'list') {
          return createRect({ left: 4, top: 4, width: 72, height: 40 })
        }

        if (value === 'board') {
          return createRect({ left: 80, top: 4, width: 84, height: 40 })
        }

        if (value === 'calendar') {
          return createRect({ left: 168, top: 4, width: 92, height: 40 })
        }
      }

      return createRect({ left: 0, width: 0, height: 0 })
    })
  })

  afterEach(() => {
    rectSpy.mockRestore()
    globalThis.ResizeObserver = originalResizeObserver
  })

  it('рендерит radiogroup, selected-state и индикатор для pills-варианта', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [...options],
        ariaLabel: 'View mode',
      },
    })

    await nextTick()
    await nextTick()

    const group = wrapper.get('[role="radiogroup"]')
    expect(group.attributes('aria-label')).toBe('View mode')
    expect(group.attributes('data-gr-variant')).toBe('pills')

    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios[1].attributes('aria-checked')).toBe('true')
    expect(radios[1].attributes('tabindex')).toBe('0')

    const indicator = wrapper.get('[data-gr-segmented-indicator]')
    expect(indicator.attributes('style')).toContain('width: 84px')
    expect(indicator.attributes('style')).toContain('height: 40px')
    expect(indicator.attributes('style')).toContain('translate3d(80px, 3px, 0)')
  })

  // Icon-only сегмент иначе остаётся безымянной кнопкой: иконка `aria-hidden`,
  // текста нет, имя брать неоткуда (axe: `button-name`).
  it('отдаёт сегменту доступное имя из option.ariaLabel', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [
          { value: 'board', ariaLabel: 'Board' },
          { value: 'timeline', label: 'Timeline' },
        ],
        ariaLabel: 'View mode',
      },
    })

    await nextTick()

    const radios = wrapper.findAll('[role="radio"]')
    expect(radios[0].attributes('aria-label')).toBe('Board')
    // У сегмента с текстом имя берётся из содержимого — своё `aria-label` его бы перебило.
    expect(radios[1].attributes('aria-label')).toBeUndefined()
  })

  it('применяет indicatorDuration через inline transitionDuration', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [...options],
        indicatorDuration: 420,
      },
    })

    await nextTick()
    await nextTick()

    const indicator = wrapper.get('[data-gr-segmented-indicator]')
    expect(indicator.attributes('style')).toContain('transition-duration: 420ms')
  })

  it('эмитит update:modelValue и change при клике по новой опции', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'list',
        options: [...options],
      },
    })

    await wrapper.findAll('[role="radio"]')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['board']])
    expect(wrapper.emitted('change')).toEqual([['board', { value: 'board', label: 'Board' }]])
  })

  it('игнорирует disabled group и disabled option', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'list',
        disabled: true,
        options: [
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board', disabled: true },
        ],
      },
    })

    const radios = wrapper.findAll('[role="radio"]')
    await radios[0].trigger('click')
    await radios[1].trigger('click')

    expect(radios[0].attributes('disabled')).toBeDefined()
    expect(radios[1].attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('поддерживает keyboard navigation с пропуском disabled option', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'list',
        options: [
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board', disabled: true },
          { value: 'calendar', label: 'Calendar' },
        ],
      },
      attachTo: document.body,
    })

    const radios = wrapper.findAll('[role="radio"]')
    await radios[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['calendar']])
    expect(document.activeElement).toBe(radios[2].element)
  })

  it('применяет block-layout и button-variant', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'calendar',
        variant: 'button',
        block: true,
        options: [...options],
      },
    })

    await nextTick()

    const group = wrapper.get('[data-gr-segmented]')
    expect(group.attributes('data-gr-variant')).toBe('button')
    expect(cascade(group.element)).toMatchObject({ 'width': '100%', 'grid-auto-columns': 'minmax(0, 1fr)' })
  })

  it('itemWidth="content" делит ширину по содержимому, а не поровну', async () => {
    // Равные треки дают шторке на 400px три ячейки по 121px: короткому слову
    // ширина не нужна, длинная подпись режется многоточием — при том, что места
    // суммарно хватает.
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'calendar',
        block: true,
        itemWidth: 'content',
        options: [...options],
      },
    })
    await nextTick()

    // Минимум трека — ноль: у однострочной подписи `min-content` равен
    // `max-content`, и трек с таким минимумом не сжимался — ряд вылезал за
    // контейнер. Само сжатие меряет `apps/showcase/e2e/interaction.spec.ts`.
    expect(declared(wrapper)['grid-auto-columns']).toBe('minmax(0, auto)')

    wrapper.unmount()
  })

  it('без block режим ширины ничего не меняет', async () => {
    // Там ширина и так по содержимому — второго правила для того же случая быть
    // не должно.
    const plain = mount(GrSegmented, {
      props: { modelValue: 'calendar', options: [...options] },
    })
    const withMode = mount(GrSegmented, {
      props: { modelValue: 'calendar', itemWidth: 'content', options: [...options] },
    })
    await nextTick()

    expect(declared(withMode)).toEqual(declared(plain))

    plain.unmount()
    withMode.unmount()
  })

  it('в вертикали режим ширины не значит ничего', async () => {
    // Колонка одна, сегменты равны по построению.
    const plain = mount(GrSegmented, {
      props: { modelValue: 'calendar', block: true, orientation: 'vertical', options: [...options] },
    })
    const withMode = mount(GrSegmented, {
      props: {
        modelValue: 'calendar',
        block: true,
        orientation: 'vertical',
        itemWidth: 'content',
        options: [...options],
      },
    })
    await nextTick()

    expect(declared(withMode)).toEqual(declared(plain))

    plain.unmount()
    withMode.unmount()
  })

  it('режим ширины приходит из componentDefaults', async () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'calendar', block: true, options: [...options] },
      global: granularityGlobal({ componentDefaults: { GrSegmented: { itemWidth: 'content' } } }),
    })
    await nextTick()

    expect(declared(wrapper)['grid-auto-columns']).toBe('minmax(0, auto)')

    wrapper.unmount()
  })

  it('использует дополнительную highlight-тень для pills-индикатора', () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [...options],
      },
    })

    expect(declared(wrapper)['--gr-segmented-indicator-shadow']).toBe('var(--gr-shadow-1), var(--gr-segmented-indicator-highlight-shadow)')
  })

  it('использует одинаковый inset трека и компактные size-токены для sm и xs', () => {
    const smWrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        size: 'sm',
        options: [...options],
      },
    })

    const xsWrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        size: 'xs',
        options: [...options],
      },
    })

    const smStyle = declared(smWrapper)
    const xsStyle = declared(xsWrapper)
    const mdStyle = declared(mount(GrSegmented, { props: { modelValue: 'board', size: 'md', options: [...options] } }))
    const lgStyle = declared(mount(GrSegmented, { props: { modelValue: 'board', size: 'lg', options: [...options] } }))

    expect(smStyle).toMatchObject({ '--gr-segmented-padding': '4px', '--gr-segmented-font-size': '0.75rem', '--gr-segmented-min-height': '22px' })
    expect(xsStyle).toMatchObject({ '--gr-segmented-padding': '4px', '--gr-segmented-item-px': '10px', '--gr-segmented-min-height': '18px' })
    expect(mdStyle['--gr-segmented-padding']).toBe('4px')
    expect(lgStyle['--gr-segmented-padding']).toBe('4px')
  })

  it('обновляет индикатор при controlled update без сброса в ноль', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'list',
        options: [...options],
      },
    })

    await nextTick()
    await nextTick()
    await wrapper.setProps({ modelValue: 'calendar' })
    await nextTick()
    await nextTick()

    const indicator = wrapper.get('[data-gr-segmented-indicator]')
    const style = indicator.attributes('style')
    expect(style).toContain('translate3d(168px, 3px, 0)')
    expect(style).not.toContain('translate3d(0px, 0px, 0px)')
  })

  it('не переинициализирует ResizeObserver из resize-callback', async () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [...options],
      },
    })

    await nextTick()
    await nextTick()

    const observer = ResizeObserverMock.instances[0]
    expect(observer).toBeDefined()

    observer.observe.mockClear()
    observer.disconnect.mockClear()

    observer.trigger()
    await nextTick()
    await nextTick()

    expect(observer.disconnect).not.toHaveBeenCalled()
    expect(observer.observe).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('поддерживает scoped slot для кастомного контента', () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'board',
        options: [...options],
      },
      slots: {
        default: ({ option, selected, disabled }) => {
          return h('span', { class: 'custom-option' }, `${option.label} / ${selected ? 'selected' : 'idle'} / ${disabled ? 'disabled' : 'enabled'}`)
        },
      },
    })

    expect(wrapper.findAll('.custom-option')).toHaveLength(3)
    expect(wrapper.text()).toContain('Board / selected / enabled')
  })
})
describe('GrSegmented — readonly и недоступность', () => {
  it('readonly не даёт выбрать ни кликом, ни клавиатурой', async () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], readonly: true },
    })
    const items = wrapper.findAll('[data-gr-segmented-item]')

    // Клик раньше проходил мимо guard'а: `readonly` проверяла только клавиатура.
    await items[1].trigger('click')
    await items[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('change')).toBeFalsy()
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-readonly')).toBe('true')
  })

  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrSegmented, {
      props: {
        modelValue: 'list',
        options: [{ value: 'list', label: 'List' }, { value: 'board', label: 'Board', disabled: true }],
        disabled: true,
      },
    })

    expect(wrapper.html()).not.toMatch(/opacity-\d/)
    expect(look(wrapper.get('[role="radiogroup"]').element).color).toBe('var(--gr-disabled-fg)')
    expect(look(wrapper.findAll('[data-gr-segmented-item]')[1].element).color).toBe('var(--gr-disabled-fg)')
  })
})

describe('GrSegmented — загружающийся сегмент', () => {
  const busyOptions = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board', loading: true },
    { value: 'calendar', label: 'Calendar' },
  ]

  it('показывает спиннер и объявляется занятым, но не недоступным', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: busyOptions } })
    const busy = wrapper.findAll('[data-gr-segmented-item]')[1]

    expect(busy.find('[data-gr-segmented-spinner]').exists()).toBe(true)
    expect(busy.attributes('aria-busy')).toBe('true')
    // Занят — не значит недоступен: `aria-disabled` и нативный `disabled` не ставим.
    expect(busy.attributes('aria-disabled')).toBeUndefined()
    expect(busy.attributes('disabled')).toBeUndefined()
  })

  it('выбор занятого сегмента не проходит', async () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: busyOptions } })

    await wrapper.findAll('[data-gr-segmented-item]')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('стрелки перешагивают занятый сегмент', async () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: busyOptions } })

    await wrapper.findAll('[data-gr-segmented-item]')[0].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['calendar'])
  })

  it('выбранный занятый сегмент остаётся остановкой Tab', () => {
    // Занят — не недоступен: нативного `disabled` на нём нет, фокус встаёт.
    const wrapper = mount(GrSegmented, { props: { modelValue: 'board', options: busyOptions } })
    const items = wrapper.findAll('[data-gr-segmented-item]')

    expect(items.map(item => item.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
  })

  it('слот получает состояние загрузки', () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: busyOptions },
      slots: {
        default: `<template #default="{ option, loading }">
          <span class="custom">{{ option.label }}:{{ loading }}</span>
        </template>`,
      },
    })

    expect(wrapper.findAll('.custom').map(node => node.text()))
      .toEqual(['List:false', 'Board:true', 'Calendar:false'])
  })
})

describe('GrSegmented — ориентация', () => {
  it('по умолчанию ряд горизонтальный: поток по колонкам, строки не задаются', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: [...options] } })
    const root = wrapper.get('[data-gr-segmented]')

    expect(root.attributes('aria-orientation')).toBe('horizontal')
    expect(cascade(root.element)).toMatchObject({ 'grid-auto-flow': 'column', 'grid-auto-columns': 'minmax(0, max-content)' })
    expect(cascade(root.element)['grid-auto-rows']).toBeUndefined()
  })

  it('vertical разворачивает ряд в колонку и объявляет ориентацию', () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical' },
    })
    const root = wrapper.get('[data-gr-segmented]')

    expect(root.attributes('aria-orientation')).toBe('vertical')
    // Колонка одна: сегменты одинаковой ширины по построению, а не по `block`.
    expect(cascade(root.element)).toMatchObject({
      'grid-auto-flow': 'row',
      'grid-template-columns': 'minmax(0, 1fr)',
      'grid-auto-rows': 'minmax(0, max-content)',
    })
  })

  it('block в вертикали занимает ширину контейнера, но колонку не множит', () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical', block: true },
    })
    const root = wrapper.get('[data-gr-segmented]')

    expect(cascade(root.element)).toMatchObject({ 'width': '100%', 'grid-template-columns': 'minmax(0, 1fr)' })
  })

  it('без пропа дорожка остаётся пилюлей — это дефолт сегментов, а не пакета', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: [...options] } })

    expect(declared(wrapper)['--gr-segmented-radius']).toBe('9999px')
  })

  it('shape="box" даёт то же скругление, что у полей ввода', () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], shape: 'box' },
    })

    expect(declared(wrapper)['--gr-segmented-radius']).toBe('var(--gr-radius-control)')
  })

  it('в вертикали пилюля считается формулой, а `box` — нет', () => {
    // `9999px` на высокой колонке превращает дорожку в эллипс, поэтому у пилюли
    // радиус равен высоте одного сегмента. Шести пикселям такая поправка не
    // нужна ни при какой высоте.
    const pill = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical' },
    })
    expect(declared(pill)['--gr-segmented-radius']).toBe('calc(var(--gr-segmented-min-height) / 2 + var(--gr-segmented-padding))')

    const box = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical', shape: 'box' },
    })
    expect(declared(box)['--gr-segmented-radius']).toBe('var(--gr-radius-control)')
  })

  it('форма приходит и из componentDefaults, а локальный проп её перебивает', () => {
    const withDefault = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options] },
      global: granularityGlobal({ componentDefaults: { GrSegmented: { shape: 'box' } } }),
    })
    expect(declared(withDefault)['--gr-segmented-radius']).toBe('var(--gr-radius-control)')

    const overridden = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], shape: 'pill' },
      global: granularityGlobal({ componentDefaults: { GrSegmented: { shape: 'box' } } }),
    })
    expect(declared(overridden)['--gr-segmented-radius']).toBe('9999px')
  })

  it('сегмент внутри считает радиус от дорожки в обеих формах', () => {
    // Радиус сегмента производный (`calc(radius - padding)`), поэтому вторая
    // форма получается сама — и обязана получаться, а не задаваться отдельно.
    for (const shape of ['pill', 'box'] as const) {
      const wrapper = mount(GrSegmented, {
        props: { modelValue: 'list', options: [...options], shape },
      })
      expect(cascade(wrapper.findAll('[role="radio"]')[0].element)['border-radius'])
        .toBe('calc(var(--gr-segmented-radius) - var(--gr-segmented-padding))')
    }
  })

  it('пустой список опций не оставляет треков ни в одной ориентации', () => {
    // Треки неявные — по одному на сегмент: без сегментов их нет, явного шаблона под ряд тоже.
    const horizontal = mount(GrSegmented, { props: { modelValue: '', options: [] } })
    expect(horizontal.findAll('[data-gr-segmented-item]')).toHaveLength(0)
    expect(declared(horizontal)['grid-template-columns']).toBeUndefined()

    const vertical = mount(GrSegmented, { props: { modelValue: '', options: [], orientation: 'vertical' } })
    expect(declared(vertical)['grid-template-rows']).toBeUndefined()
  })

  it('в вертикали работают обе оси стрелок — так требует APG для radiogroup', async () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical' },
      attachTo: document.body,
    })

    const radios = wrapper.findAll('[role="radio"]')

    // Модель подтягивается вручную: без неё `emitValue` отбросил бы шаг назад к
    // уже «выбранному» значению, и тест проверял бы не то.
    const press = async (index: number, key: string, expected: string) => {
      await radios[index].trigger('keydown', { key })
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([expected])
      await wrapper.setProps({ modelValue: expected })
    }

    await press(0, 'ArrowDown', 'board')
    // Горизонтальные стрелки в вертикальном ряду не отключаются: у `radiogroup`
    // ими ходят так же, как вертикальными.
    await press(1, 'ArrowRight', 'calendar')
    await press(2, 'ArrowUp', 'board')
    await press(1, 'ArrowLeft', 'list')

    wrapper.unmount()
  })

  it('смена ориентации пересчитывает геометрию индикатора', async () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'board', options: [...options] } })
    await nextTick()

    const measured = ResizeObserverMock.instances.length
    await wrapper.setProps({ orientation: 'vertical' })
    await nextTick()
    await nextTick()

    // Индикатор, оставшийся в координатах прежней раскладки, съехал бы мимо сегмента.
    expect(ResizeObserverMock.instances.length).toBeGreaterThanOrEqual(measured)
    expect(wrapper.get('[data-gr-segmented]').attributes('aria-orientation')).toBe('vertical')
  })
})

describe('GrSegmented — радиус дорожки', () => {
  it('горизонталь остаётся пилюлей, вертикаль считает радиус от высоты сегмента', () => {
    const horizontal = mount(GrSegmented, { props: { modelValue: 'list', options: [...options] } })
    expect(declared(horizontal)['--gr-segmented-radius']).toBe('9999px')

    // `9999px` выверен под короткий ряд: на высокой колонке он превращает
    // дорожку в эллипс.
    const vertical = mount(GrSegmented, {
      props: { modelValue: 'list', options: [...options], orientation: 'vertical' },
    })
    expect(declared(vertical)['--gr-segmented-radius']).toBe('calc(var(--gr-segmented-min-height) / 2 + var(--gr-segmented-padding))')
  })
})

/**
 * Кольцо roving-фокуса собрано на общем `useRovingFocus`. Инвариант паттерна —
 * ровно одна остановка `Tab` на группу: ноль означает, что до сегментов не
 * добраться с клавиатуры вовсе, и увидеть это можно только счётом.
 */
describe('GrSegmented — остановка Tab', () => {
  const withDisabled = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board', disabled: true },
    { value: 'calendar', label: 'Calendar' },
  ]

  function tabindexes(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[data-gr-segmented-item]').map(item => item.attributes('tabindex'))
  }

  it('остановка стоит на выбранном сегменте', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'calendar', options: [...options] } })

    expect(tabindexes(wrapper)).toEqual(['-1', '-1', '0'])
  })

  it('без выбора остановка — первый доступный сегмент', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'none', options: withDisabled } })

    expect(tabindexes(wrapper)).toEqual(['0', '-1', '-1'])
  })

  it('выбранный выключенный сегмент не забирает группу из таб-порядка', () => {
    // На выключенном стоит нативный `disabled` — остановка на нём означала бы,
    // что `Tab` не приводит никуда. Раньше в этом случае остановки не было ни
    // на одном сегменте, и группа выпадала из обхода целиком.
    const wrapper = mount(GrSegmented, { props: { modelValue: 'board', options: withDisabled } })

    expect(tabindexes(wrapper)).toEqual(['0', '-1', '-1'])
  })

  it('пустой список остановок не создаёт', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'none', options: [] } })

    expect(tabindexes(wrapper)).toEqual([])
  })

  it('клик переносит остановку туда же, куда и выбор', async () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'list', options: [...options] } })

    await wrapper.findAll('[data-gr-segmented-item]')[0].trigger('keydown', { key: 'ArrowRight' })
    await wrapper.setProps({ modelValue: 'board' })
    expect(tabindexes(wrapper)).toEqual(['-1', '0', '-1'])

    await wrapper.findAll('[data-gr-segmented-item]')[2].trigger('click')
    await wrapper.setProps({ modelValue: 'calendar' })
    expect(tabindexes(wrapper)).toEqual(['-1', '-1', '0'])
  })

  it('исчезнувший из набора сегмент не оставляет группу без остановки', async () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: 'calendar', options: [...options] } })
    expect(tabindexes(wrapper)).toEqual(['-1', '-1', '0'])

    await wrapper.setProps({ options: options.slice(0, 2) })
    expect(tabindexes(wrapper)).toEqual(['0', '-1'])
  })
})

describe('GrSegmented — обрезанная подпись', () => {
  /** jsdom раскладки не считает: ширины задаются вручную. */
  function measure(node: Element, widths: { scroll: number, client: number }): void {
    Object.defineProperty(node, 'scrollWidth', { value: widths.scroll, configurable: true })
    Object.defineProperty(node, 'clientWidth', { value: widths.client, configurable: true })
  }

  // «Включе…» без подсказки прочитать нечем: текст в DOM остаётся целым, но
  // видит его только скринридер, а не тот, кто смотрит глазами.
  it('обрезанная подпись отдаёт полный текст по наведению', async () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'on', options: [{ value: 'on', label: 'Включено в подписку' }] },
    })

    const label = wrapper.get('[data-gr-segmented-item] span')
    measure(label.element, { scroll: 240, client: 80 })

    await label.trigger('pointerenter')

    expect(label.attributes('title')).toBe('Включено в подписку')
  })

  it('поместившаяся подпись подсказки не получает', async () => {
    const wrapper = mount(GrSegmented, {
      props: { modelValue: 'on', options: [{ value: 'on', label: 'Да' }] },
    })

    const label = wrapper.get('[data-gr-segmented-item] span')
    measure(label.element, { scroll: 40, client: 80 })

    await label.trigger('pointerenter')

    expect(label.attributes('title')).toBeUndefined()
  })
})

/**
 * `invalid` ставил только `aria-invalid`: дорожка оставалась серой. Цвет меряет
 * `apps/showcase/e2e/interaction.spec.ts` в обеих темах; здесь — роли.
 */
describe('GrSegmented — состояние ошибки', () => {
  const INVALID_TRACK = 'var(--gr-segmented-invalid-brd, var(--gr-invalid-brd))'
  const INVALID_RING = 'var(--gr-invalid-ring)'

  it('`invalid` красит рамку дорожки и кольцо фокуса ролями ошибки', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: '', invalid: true, options: [...options] } })
    const root = wrapper.get('[data-gr-segmented]')

    expect(root.attributes('aria-invalid')).toBe('true')
    expect(cascade(root.element)).toMatchObject({ '--gr-segmented-track-brd': INVALID_TRACK, '--gr-ring': INVALID_RING })
  })

  it('ошибка `GrFormField` доходит до дорожки так же', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Период', error: 'Выберите период' },
      slots: { default: () => h(GrSegmented, { modelValue: '', options: [...options] }) },
    })

    expect(declared(wrapper)['--gr-segmented-track-brd']).toBe(INVALID_TRACK)
  })

  it('без ошибки рамка обычная', () => {
    const wrapper = mount(GrSegmented, { props: { modelValue: '', options: [...options] } })
    expect(declared(wrapper)['--gr-segmented-track-brd']).toBe('var(--gr-brd)')
    expect(declared(wrapper)['--gr-ring']).toBeUndefined()
  })
})

describe('GrSegmented — выравнивание содержимого сегмента', () => {
  it('в ряду — по центру, в колонке — к началу', () => {
    const row = mount(GrSegmented, { props: { modelValue: 'list', options: [...options] } })
    const column = mount(GrSegmented, { props: { modelValue: 'list', orientation: 'vertical', options: [...options] } })

    for (const radio of row.findAll('[role="radio"]'))
      expect(cascade(radio.element)['justify-content']).toBe('center')
    for (const radio of column.findAll('[role="radio"]'))
      expect(cascade(radio.element)['justify-content']).toBe('flex-start')
  })
})
