import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { resetGranularityDom } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(resetGranularityDom)

async function mountCarousel(props: Record<string, unknown> = {}, slides = 6) {
  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', autoplay: false, ...props },
    slots: {
      default: () => Array.from({ length: slides }, (_, index) =>
        h(GrCarouselSlide, { key: index }, { default: () => h('i', { 'data-frame': index }) })),
    },
  })

  await nextTick()
  await nextTick()
  return wrapper
}

function renderedFrames(wrapper: Awaited<ReturnType<typeof mountCarousel>>): number[] {
  return wrapper.findAll('[data-frame]').map(node => Number(node.attributes('data-frame')))
}

describe('GrCarousel — виртуализация содержимого', () => {
  it('без virtual рисуются все кадры', async () => {
    const wrapper = await mountCarousel()

    expect(renderedFrames(wrapper)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('кадры остаются в ряду, из DOM уходит только их нутро', async () => {
    const wrapper = await mountCarousel({ virtual: true })

    // Обёртки на месте: не отрисовать чужой узел лента не может, да и место в
    // ряду держать нечем было бы.
    expect(wrapper.findAll('[data-gr-carousel-slide]')).toHaveLength(6)
    expect(renderedFrames(wrapper)).not.toHaveLength(6)
  })

  it('окно — текущий кадр и его соседи', async () => {
    const wrapper = await mountCarousel({ virtual: true, loop: false })

    // Сосед обязан быть готов до перехода, иначе лента поедет на пустоту.
    expect(renderedFrames(wrapper)).toEqual([0, 1])

    await wrapper.get('[data-gr-carousel-next]').trigger('click')
    await nextTick()
    expect(renderedFrames(wrapper)).toEqual([0, 1, 2])
  })

  it('overscan расширяет окно', async () => {
    const wrapper = await mountCarousel({ virtual: true, loop: false, virtualOverscan: 2 })

    expect(renderedFrames(wrapper)).toEqual([0, 1, 2])
  })

  it('меньше единицы окно не сужается', async () => {
    const wrapper = await mountCarousel({ virtual: true, loop: false, virtualOverscan: 0 })

    // Ноль оставил бы соседа пустым ровно в момент перехода к нему.
    expect(renderedFrames(wrapper)).toEqual([0, 1])
  })

  it('при loop окно замкнуто вместе с лентой', async () => {
    const wrapper = await mountCarousel({ virtual: true, loop: true })

    // Сосед первого кадра слева — последний: не нарисовать его значит показать
    // пустоту ровно в момент замыкания кольца.
    expect(renderedFrames(wrapper)).toEqual([0, 1, 5])
  })
})
