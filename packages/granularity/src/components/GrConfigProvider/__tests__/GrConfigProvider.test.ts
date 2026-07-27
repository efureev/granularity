import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../GrConfigProvider.vue'
import { useGrComponentSize, useGrConfig } from '../context'

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
