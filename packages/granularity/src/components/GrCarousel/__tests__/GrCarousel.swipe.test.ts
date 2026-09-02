import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { cancelPointer, move, press, release, resetGranularityDom } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(resetGranularityDom)

async function mountCarousel(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', modelValue: 1, ...props },
    slots: {
      default: () => Array.from({ length: 3 }, (_, index) =>
        h(GrCarouselSlide, { key: index }, {
          default: () => h('a', { href: '#target' }, `ссылка ${index}`),
        })),
    },
  })

  await nextTick()
  await nextTick()
  return wrapper
}

function viewportOf(wrapper: { get: (s: string) => { element: Element } }): Element {
  return wrapper.get('[data-gr-carousel-viewport]').element
}

function trackStyle(wrapper: { get: (s: string) => { attributes: (n: string) => string | undefined } }): string {
  return wrapper.get('[data-gr-carousel-track]').attributes('style') ?? ''
}

describe('GrCarousel: свайп', () => {
  it('протяжка влево листает вперёд', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 180, clientY: 100 })
    release({ clientX: 180, clientY: 100 })
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('протяжка вправо листает назад', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 100, clientY: 100 })
    move({ clientX: 220, clientY: 100 })
    release({ clientX: 220, clientY: 100 })
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('протяжка короче порога кадр не листает', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 260, clientY: 100 })
    release({ clientX: 260, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('вертикальная протяжка остаётся прокруткой страницы', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 220, clientY: 400 })
    release({ clientX: 220, clientY: 400 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('обрыв жеста возвращает кадр и не листает', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 150, clientY: 100 })
    cancelPointer({ clientX: 150, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(trackStyle(wrapper)).toContain('--gr-carousel-drag: 0px')
  })

  it('нажатие на ссылку внутри кадра жестом не становится', async () => {
    const wrapper = await mountCarousel()
    const link = wrapper.get('[data-gr-carousel-slide] a').element

    press(link, { clientX: 300, clientY: 100 })
    move({ clientX: 150, clientY: 100 })
    release({ clientX: 150, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('на время жеста лента идёт за пальцем без перехода', async () => {
    const wrapper = await mountCarousel()

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 200, clientY: 100 })
    await nextTick()

    const style = trackStyle(wrapper)
    expect(style).toContain('--gr-carousel-drag: -100px')
    // Переход догонял бы курсор — на время жеста он снят.
    expect(style).toContain('transition: none')

    release({ clientX: 200, clientY: 100 })
  })

  it('swipe=false выключает жест целиком', async () => {
    const wrapper = await mountCarousel({ swipe: false })

    press(viewportOf(wrapper), { clientX: 300, clientY: 100 })
    move({ clientX: 150, clientY: 100 })
    release({ clientX: 150, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('на одном кадре жест не заводится', async () => {
    const wrapper = mount(GrCarousel, {
      attachTo: document.body,
      props: { ariaLabel: 'Галерея' },
      slots: { default: () => [h(GrCarouselSlide, { key: 0 }, { default: () => 'один' })] },
    })
    await nextTick()
    await nextTick()

    press(wrapper.get('[data-gr-carousel-viewport]').element, { clientX: 300, clientY: 100 })
    move({ clientX: 150, clientY: 100 })
    release({ clientX: 150, clientY: 100 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
