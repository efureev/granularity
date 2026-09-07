import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import { resetGranularityDom } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(() => {
  resetGranularityDom()
  vi.restoreAllMocks()
})

async function mountCarousel(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', autoplay: false, ...props },
    slots: {
      default: () => Array.from({ length: 3 }, (_, index) =>
        h(GrCarouselSlide, { key: index }, { default: () => `кадр ${index + 1}` })),
    },
  })

  await nextTick()
  await nextTick()
  return wrapper
}

describe('GrCarousel — ориентация ленты', () => {
  it('по умолчанию лента горизонтальная', async () => {
    const wrapper = await mountCarousel()
    const track = wrapper.get('[data-gr-carousel-track]')

    expect(track.attributes('data-gr-carousel-vertical')).toBeUndefined()
    expect(track.classes()).toContain('w-full')
    expect(track.classes()).not.toContain('flex-col')
    expect(wrapper.get('[data-gr-carousel-slide]').classes()).toContain('w-full')
  })

  it('вертикальная лента становится колонкой, а кадр занимает высоту', async () => {
    const wrapper = await mountCarousel({ orientation: 'vertical' })
    const track = wrapper.get('[data-gr-carousel-track]')

    // Признак нужен разметке: по нему CSS переключает ось трансформа.
    expect(track.attributes('data-gr-carousel-vertical')).toBeDefined()
    expect(track.classes()).toContain('flex-col')
    expect(track.classes()).toContain('h-full')
    expect(wrapper.get('[data-gr-carousel-slide]').classes()).toContain('h-full')
  })

  it('стрелки переезжают на ось движения', async () => {
    const horizontal = await mountCarousel()
    expect(horizontal.get('[data-gr-carousel-prev]').classes()).toContain('start-2')

    const vertical = await mountCarousel({ orientation: 'vertical' })
    const prev = vertical.get('[data-gr-carousel-prev]')
    // Направление письма вертикали не касается — позиции физические.
    expect(prev.classes()).toContain('top-2')
    expect(prev.classes()).toContain('left-1/2')
    expect(vertical.get('[data-gr-carousel-next]').classes()).toContain('bottom-2')
  })

  it('поперечная прокрутка страницы отдаётся ей же', async () => {
    const horizontal = await mountCarousel({ swipe: true })
    expect(horizontal.get('[data-gr-carousel-viewport]').classes()).toContain('[touch-action:pan-y]')

    const vertical = await mountCarousel({ swipe: true, orientation: 'vertical' })
    expect(vertical.get('[data-gr-carousel-viewport]').classes()).toContain('[touch-action:pan-x]')
  })

  it('нулевая высота вертикального вьюпорта — предупреждение, а не тихий столбец', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await mountCarousel({ orientation: 'vertical' })

    // В jsdom раскладки нет, высота всегда нулевая — это и есть проверяемый случай.
    expect(warn.mock.calls.some(call => String(call[0]).includes('нулевая высота'))).toBe(true)
  })

  it('горизонтальная лента о высоте не предупреждает', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await mountCarousel()

    expect(warn.mock.calls.some(call => String(call[0]).includes('нулевая высота'))).toBe(false)
  })
})
