import { mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref, shallowRef } from 'vue'

import { useElementSize, type UseElementSizeReturn } from '../internal/useElementSize'

function setup(declaredWidth: number) {
  const api = shallowRef<UseElementSizeReturn>()
  const target = ref<HTMLElement | null>(null)

  const wrapper = mount(defineComponent({
    setup() {
      api.value = useElementSize(target, { initialWidth: () => declaredWidth, initialHeight: () => 200 })

      return () => h('div', { ref: target })
    },
  }))

  return { api: api.value!, wrapper }
}

describe('useElementSize', () => {
  it('без ResizeObserver остаётся на объявленных размерах — это рабочий режим', () => {
    // В jsdom `ResizeObserver` отсутствует, как и на сервере.
    expect(typeof ResizeObserver).toBe('undefined')

    const { api } = setup(640)

    expect(api.width.value).toBe(640)
    expect(api.height.value).toBe(200)
    expect(api.ready.value).toBe(false)
  })

  it('нулевой замер не затирает объявленный размер', async () => {
    const { api, wrapper } = setup(480)

    mockRect(wrapper.element as HTMLElement, { width: 0, height: 0 })
    await wrapper.vm.$nextTick()

    expect(api.width.value).toBe(480)
  })

  it('размонтирование не бросает без наблюдателя', () => {
    const { wrapper } = setup(320)

    expect(() => wrapper.unmount()).not.toThrow()
  })
})
