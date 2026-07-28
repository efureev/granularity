import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrBadge from '../../GrBadge/GrBadge.vue'
import GrButton from '../../GrButton/GrButton.vue'
import GrConfigProvider from '../GrConfigProvider.vue'
import GrInput from '../../GrInput/GrInput.vue'
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
