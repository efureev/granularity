import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../GrConfigProvider.vue'
import { resetUnsupportedSizeWarnings, useGrComponentSize, useGrConfig } from '../context'

// Тестовый потребитель конфига: рендерит разрешённый размер и zIndexBase.
const Consumer = defineComponent({
  setup() {
    const config = useGrConfig()
    const size = useGrComponentSize(() => undefined)
    return () =>
      h('div', [
        h('span', { class: 'size' }, size.value),
        h('span', { class: 'z' }, String(config.zIndexBase.value)),
        h('span', { class: 'variant' }, String(config.componentDefaults.value.GrButton?.variant)),
      ])
  },
})

describe('GrConfigProvider', () => {
  it('без провайдера размер падает на дефолт md', () => {
    const wrapper = mount(Consumer)
    expect(wrapper.find('.size').text()).toBe('md')
  })

  it('пробрасывает size/zIndexBase/componentDefaults вложенным компонентам', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg', zIndexBase: 2000, componentDefaults: { GrButton: { variant: 'secondary' } } },
      slots: { default: () => h(Consumer) },
    })
    expect(wrapper.find('.size').text()).toBe('lg')
    expect(wrapper.find('.z').text()).toBe('2000')
    expect(wrapper.find('.variant').text()).toBe('secondary')
  })

  it('вложенный провайдер мержится поверх родительского', () => {
    const wrapper = mount(GrConfigProvider, {
      props: { size: 'lg', zIndexBase: 2000 },
      slots: {
        default: () =>
          h(GrConfigProvider, { size: 'sm' }, { default: () => h(Consumer) }),
      },
    })
    // size переопределён дочерним, zIndexBase унаследован от родителя.
    expect(wrapper.find('.size').text()).toBe('sm')
    expect(wrapper.find('.z').text()).toBe('2000')
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
