import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrBadge from '../../GrBadge/GrBadge.vue'
import GrButton from '../../GrButton/GrButton.vue'
import GrConfigProvider from '../GrConfigProvider.vue'
import GrInput from '../../GrInput/GrInput.vue'
import GrAutocomplete from '../../GrAutocomplete/GrAutocomplete.vue'
import GrNumberInput from '../../GrNumberInput/GrNumberInput.vue'
import GrRadioGroup from '../../GrRadioGroup/GrRadioGroup.vue'
import GrSegmented from '../../GrSegmented/GrSegmented.vue'
import GrSelect from '../../GrSelect/GrSelect.vue'
import GrSwitch from '../../GrSwitch/GrSwitch.vue'
import GrRating from '../../GrRating/GrRating.vue'
import GrSlider from '../../GrSlider/GrSlider.vue'
import { resetUnsupportedSizeWarnings, useGrComponentSize, useGrConfig } from '../context'

// Тестовый потребитель конфига: рендерит разрешённый размер и дефолтные пропсы.
const Consumer = defineComponent({
  setup() {
    const config = useGrConfig()
    const size = useGrComponentSize(() => undefined)
    return () =>
      h('div', [
        h('span', { class: 'size' }, size.value),
        h('span', { class: 'variant' }, String(config.componentDefaults.value.GrButton?.variant)),
      ])
  },
})

describe('GrConfigProvider', () => {
  it('без провайдера размер падает на дефолт md', () => {
    const wrapper = mount(Consumer)
    expect(wrapper.find('.size').text()).toBe('md')
  })

  it('пробрасывает size/componentDefaults вложенным компонентам', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg', componentDefaults: { GrButton: { variant: 'secondary' } } },
      slots: { default: () => h(Consumer) },
    })
    expect(wrapper.find('.size').text()).toBe('lg')
    expect(wrapper.find('.variant').text()).toBe('secondary')
  })

  it('вложенный провайдер мержится поверх родительского', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg', componentDefaults: { GrButton: { variant: 'secondary' } } },
      slots: {
        default: () =>
          h(GrConfigProvider, { size: 'sm' }, { default: () => h(Consumer) }),
      },
    })
    // size переопределён дочерним, componentDefaults унаследован от родителя.
    expect(wrapper.find('.size').text()).toBe('sm')
    expect(wrapper.find('.variant').text()).toBe('secondary')
  })

  it('рендерится прозрачно (display: contents) и показывает слот', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'md' },
      slots: { default: () => 'content' },
    })
    const root = wrapper.get('[data-gr-config-provider]')
    expect(root.attributes('style')).toContain('display: contents')
    expect(wrapper.text()).toContain('content')
  })
})

// Компоненты с усечённой size-шкалой (`GrSlider`, `GrRating`, `GrSwitch`,
// `GrLink`, `GrStatistic` не знают про `xs`) объявляют её через `supported`.
const NarrowConsumer = defineComponent({
  props: { size: { type: String as () => 'sm' | 'md' | 'lg' | undefined, default: undefined } },
  setup(props) {
    const size = useGrComponentSize(() => props.size, { supported: ['sm', 'md', 'lg'] })
    return () => h('span', { class: 'size' }, size.value)
  },
})

describe('useGrComponentSize: усечённая size-шкала', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    resetUnsupportedSizeWarnings()
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('игнорирует неподдерживаемый размер из конфига и предупреждает', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'xs' },
      slots: { default: () => h(NarrowConsumer) },
    })

    expect(wrapper.find('.size').text()).toBe('md')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('size="xs"')
  })

  it('предупреждает один раз, сколько бы потребителей ни было', () => {
    mount(GrConfigProvider, {
      props: { size: 'xs' },
      slots: { default: () => [h(NarrowConsumer), h(NarrowConsumer), h(NarrowConsumer)] },
    })

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('поддерживаемый размер из конфига проходит как есть', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg' },
      slots: { default: () => h(NarrowConsumer) },
    })

    expect(wrapper.find('.size').text()).toBe('lg')
    expect(warn).not.toHaveBeenCalled()
  })

  it('локальный проп побеждает конфиг и не проверяется по `supported`', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'xs' },
      slots: { default: () => h(NarrowConsumer, { size: 'sm' }) },
    })

    expect(wrapper.find('.size').text()).toBe('sm')
    expect(warn).not.toHaveBeenCalled()
  })

  it('уважает собственный `fallback` компонента', () => {
    const Consumer = defineComponent({
      setup() {
        const size = useGrComponentSize(() => undefined, { fallback: 'lg', supported: ['sm', 'md', 'lg'] })
        return () => h('span', { class: 'size' }, size.value)
      },
    })

    const wrapper = mount(GrConfigProvider, {
      props: { size: 'xs' },
      slots: { default: () => h(Consumer) },
    })

    expect(wrapper.find('.size').text()).toBe('lg')
  })
})

describe('componentDefaults: дефолтные пропсы по компонентам', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    resetUnsupportedSizeWarnings()
  })

  afterEach(() => {
    warn.mockRestore()
  })

  function mountWithDefaults(componentDefaults: Record<string, unknown>, inner: () => unknown, extraProps = {}) {
    return mount(GrConfigProvider, {
      props: { componentDefaults, ...extraProps },
      slots: { default: inner as () => never },
    })
  }

  it('подменяет встроенный дефолт компонента (GrButton)', () => {
    const wrapper = mountWithDefaults(
      { GrButton: { variant: 'outline', tone: 'danger' } },
      () => h(GrButton, null, { default: () => 'Ok' }),
    )
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-variant')).toBe('outline')
    expect(button.attributes('data-gr-tone')).toBe('danger')
  })

  it('локальный проп побеждает конфиг', () => {
    const wrapper = mountWithDefaults(
      { GrButton: { variant: 'outline' } },
      () => h(GrButton, { variant: 'ghost' }, { default: () => 'Ok' }),
    )

    expect(wrapper.get('[data-gr-button]').attributes('data-gr-variant')).toBe('ghost')
  })

  it('без провайдера компонент использует собственный дефолт', () => {
    const wrapper = mount(GrButton, { slots: { default: () => 'Ok' } })

    expect(wrapper.get('[data-gr-button]').attributes('data-gr-variant')).toBe('primary')
    expect(wrapper.get('[data-gr-button]').attributes('data-gr-tone')).toBe('primary')
  })

  it('точечный componentDefaults[Component].size побеждает глобальный size', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg', componentDefaults: { GrButton: { size: 'xs' } } },
      slots: { default: () => [h(GrButton, null, { default: () => 'Ok' }), h(GrInput, { modelValue: '' })] },
    })

    // Кнопке достался точечный xs, инпуту — глобальный lg.
    expect(wrapper.get('[data-gr-button]').classes().join(' ')).toContain('h-7')
    expect(wrapper.get('input').classes().join(' ')).toContain('h-11')
  })

  it('работает для GrBadge и GrInput', () => {
    const badge = mountWithDefaults(
      { GrBadge: { tone: 'success', radius: 'square' } },
      () => h(GrBadge, null, { default: () => 'New' }),
    )
    expect(badge.get('.gr-badge').classes().join(' ')).toContain('var(--gr-success-light)')

    const input = mountWithDefaults(
      { GrInput: { clearable: true } },
      () => h(GrInput, { modelValue: 'text' }),
    )
    expect(input.find('[data-gr-input-clear]').exists()).toBe(true)
  })

  it('вложенный провайдер мержит на уровне пропов, а не стирает блок компонента', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { componentDefaults: { GrButton: { variant: 'outline', tone: 'danger' } } },
      slots: {
        default: () => h(
          GrConfigProvider,
          { componentDefaults: { GrButton: { variant: 'ghost' } } },
          { default: () => h(GrButton, null, { default: () => 'Ok' }) },
        ),
      },
    })
    const button = wrapper.get('[data-gr-button]')

    expect(button.attributes('data-gr-variant')).toBe('ghost')
    // tone унаследован от родителя, хотя дочерний блок GrButton его не упоминает.
    expect(button.attributes('data-gr-tone')).toBe('danger')
  })

})

// Контролы, подключённые к провайдеру. Проверяем не конкретные utility-классы
// (они меняются от вёрстки), а поведенческое равенство: «размер из провайдера»
// обязан давать ровно тот же рендер, что и тот же размер, переданный пропом.
const wiredControls = [
  ['GrSelect', GrSelect, { modelValue: '' }],
  ['GrNumberInput', GrNumberInput, { modelValue: '1' }],
  ['GrAutocomplete', GrAutocomplete, { modelValue: '' }],
  ['GrSegmented', GrSegmented, { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }],
  ['GrSlider', GrSlider, { modelValue: 10 }],
  ['GrRating', GrRating, { modelValue: 3 }],
  ['GrSwitch', GrSwitch, { modelValue: false }],
  // `variant: 'button'` не для красоты: в дефолтном `radiobox` точка имеет
  // фиксированный размер, и `size` на неё не влияет — сравнивать было бы нечего.
  ['GrRadioGroup', GrRadioGroup, { modelValue: 'a', variant: 'button', options: [{ value: 'a', label: 'A' }] }],
] as const

// Автогенерируемые id/name (`useId`) различаются от монтирования к монтированию
// и к размеру отношения не имеют — обнуляем, иначе сравнивать разметку нельзя.
const GENERATED_ID_ATTRS = /(id|for|name|aria-labelledby|aria-describedby|aria-controls|aria-activedescendant)="[^"]*"/g

function normalizeIds(html: string): string {
  return html.replace(GENERATED_ID_ATTRS, (match, attr: string) => `${attr}="__id__"`)
}

function renderWithProvider(component: unknown, componentProps: object, providerProps: object) {
  const wrapper = mount(GrConfigProvider, {
    props: providerProps,
    slots: { default: () => h(component as never, componentProps) },
  })

  // Именно разметка самого контрола, без обёртки провайдера — иначе сравнивать
  // с отдельно смонтированным компонентом было бы нечего.
  return normalizeIds(wrapper.findComponent(component as never).html())
}

function renderStandalone(component: unknown, componentProps: object) {
  return normalizeIds(mount(component as never, { props: componentProps as never }).html())
}

describe('глобальный size доезжает до контролов', () => {
  it.each(wiredControls)('%s: size из провайдера === size пропом', (_name, component, componentProps: object) => {
    const fromProvider = renderWithProvider(component, componentProps, { size: 'lg' })
    const fromProp = renderStandalone(component, { ...componentProps, size: 'lg' })
    const untouched = renderStandalone(component, componentProps)

    expect(fromProvider).toBe(fromProp)
    // И это действительно что-то поменяло, а не совпало с дефолтом.
    expect(fromProvider).not.toBe(untouched)
  })

  it.each(wiredControls)('%s: локальный проп сильнее провайдера', (_name, component, componentProps: object) => {
    const conflicting = renderWithProvider(component, { ...componentProps, size: 'sm' }, { size: 'lg' })

    expect(conflicting).toBe(renderStandalone(component, { ...componentProps, size: 'sm' }))
  })

  it('componentDefaults точечно перебивает глобальный size', () => {
    const targeted = renderWithProvider(GrSelect, { modelValue: '' }, {
      size: 'lg',
      componentDefaults: { GrSelect: { size: 'xs' } },
    })

    expect(targeted).toBe(renderStandalone(GrSelect, { modelValue: '', size: 'xs' }))
  })

  it('усечённая шкала: `xs` из конфига игнорируется в пользу дефолта компонента', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    resetUnsupportedSizeWarnings()

    // У `GrSwitch` нет `xs`: без guard\'а получили бы элемент без размерных классов.
    const fromProvider = renderWithProvider(GrSwitch, { modelValue: false }, { size: 'xs' })

    expect(fromProvider).toBe(renderStandalone(GrSwitch, { modelValue: false }))
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('GrRadio внутри группы берёт размер, разрешённый группой', () => {
    const fromProvider = renderWithProvider(
      GrRadioGroup,
      { modelValue: 'a', variant: 'button', options: [{ value: 'a', label: 'A' }] },
      { size: 'lg' },
    )

    expect(fromProvider).toBe(renderStandalone(GrRadioGroup, {
      modelValue: 'a',
      variant: 'button',
      options: [{ value: 'a', label: 'A' }],
      size: 'lg',
    }))
  })
})

// Не только `size`: у части контролов через конфиг настраивается и оформление.
// Проверяем тем же способом — «из конфига» обязано совпасть с «пропом».
describe('componentDefaults: оформительские пропы контролов', () => {
  it.each([
    // `view: 'link'` обязателен: в обычном виде `variant`/`underline` на разметку
    // не влияют, и сравнивать было бы нечего.
    ['GrSelect.variant', GrSelect, { modelValue: '', view: 'link' }, { GrSelect: { variant: 'muted' } }, { variant: 'muted' }],
    ['GrSelect.underline', GrSelect, { modelValue: '', view: 'link' }, { GrSelect: { underline: 'always' } }, { underline: 'always' }],
    ['GrSelect.clearable', GrSelect, { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, { GrSelect: { clearable: true } }, { clearable: true }],
    ['GrAutocomplete.clearable', GrAutocomplete, { modelValue: 'a' }, { GrAutocomplete: { clearable: true } }, { clearable: true }],
    ['GrSegmented.variant', GrSegmented, { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, { GrSegmented: { variant: 'button' } }, { variant: 'button' }],
  ])('%s: из конфига === пропом', (_name, component, componentProps: object, componentDefaults, propOverride) => {
    const fromConfig = renderWithProvider(component, componentProps, { componentDefaults })
    const fromProp = renderStandalone(component, { ...componentProps, ...propOverride })

    expect(fromConfig).toBe(fromProp)
    expect(fromConfig).not.toBe(renderStandalone(component, componentProps))
  })

  it('локальный проп сильнее componentDefaults', () => {
    const conflicting = renderWithProvider(
      GrSegmented,
      { modelValue: 'a', variant: 'pills', options: [{ value: 'a', label: 'A' }] },
      { componentDefaults: { GrSegmented: { variant: 'button' } } },
    )

    expect(conflicting).toBe(renderStandalone(GrSegmented, {
      modelValue: 'a',
      variant: 'pills',
      options: [{ value: 'a', label: 'A' }],
    }))
  })
})
