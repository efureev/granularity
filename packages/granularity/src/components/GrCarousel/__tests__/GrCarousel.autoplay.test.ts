import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import { announced, resetGranularityDom, stubMatchMedia } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(() => {
  vi.useRealTimers()
  resetGranularityDom()
})

async function mountCarousel(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', autoplay: true, autoplayInterval: 1000, ...props },
    slots: {
      default: () => Array.from({ length: 3 }, (_, index) =>
        h(GrCarouselSlide, { key: index }, { default: () => h('button', `кнопка ${index}`) })),
    },
  })

  await nextTick()
  await nextTick()
  return wrapper
}

function lastIndex(wrapper: { emitted: (name: string) => unknown[] | undefined }): unknown {
  return wrapper.emitted('update:modelValue')?.at(-1)
}

describe('GrCarousel: автопрокрутка', () => {
  it('шагает по интервалу', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel()

    await vi.advanceTimersByTimeAsync(1000)
    expect(lastIndex(wrapper)).toEqual([1])

    await vi.advanceTimersByTimeAsync(1000)
    expect(lastIndex(wrapper)).toEqual([2])
  })

  it('курсор ставит отсчёт на паузу и сохраняет остаток', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel()
    const root = wrapper.get('[data-gr-carousel]')

    await vi.advanceTimersByTimeAsync(800)
    await root.trigger('mouseenter')
    await nextTick()

    // Под курсором лента стоит сколько угодно долго.
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await root.trigger('mouseleave')
    await nextTick()

    // Досчитывается остаток, а не полный интервал заново.
    await vi.advanceTimersByTimeAsync(199)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(2)
    expect(lastIndex(wrapper)).toEqual([1])
  })

  it('фокус внутри останавливает показ и объявляет это', async () => {
    const wrapper = await mountCarousel()

    await wrapper.get('[data-gr-carousel]').trigger('focusin')
    await nextTick()

    expect(wrapper.get('[data-gr-carousel-viewport]').attributes('aria-live')).toBe('polite')
    expect(await announced()).toBe('Automatic slide show stopped')
  })

  it('остановленный фокусом показ сам не возобновляется', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel()

    await wrapper.get('[data-gr-carousel]').trigger('focusin')
    await nextTick()
    await wrapper.get('[data-gr-carousel]').trigger('focusout')
    await nextTick()

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('тумблер останавливает и запускает показ', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel()
    const toggle = wrapper.get('[data-gr-carousel-toggle]')

    expect(toggle.attributes('aria-label')).toBe('Stop automatic slide show')

    await toggle.trigger('click')
    await nextTick()
    expect(toggle.attributes('aria-label')).toBe('Start automatic slide show')

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await toggle.trigger('click')
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    expect(lastIndex(wrapper)).toEqual([1])
  })

  it('под prefers-reduced-motion показ не стартует, но тумблер остаётся рабочим', async () => {
    const restore = stubMatchMedia({ reducedMotion: true })
    try {
      vi.useFakeTimers()
      const wrapper = await mountCarousel()

      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()

      const toggle = wrapper.get('[data-gr-carousel-toggle]')
      expect(toggle.attributes('aria-label')).toBe('Start automatic slide show')

      // «Уменьшить движение» не значит «отнять возможность».
      await toggle.trigger('click')
      await nextTick()
      await vi.advanceTimersByTimeAsync(1000)
      expect(lastIndex(wrapper)).toEqual([1])
    }
    finally {
      restore()
    }
  })

  it('без loop показ заканчивается на последнем кадре, а не зацикливается', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel({ loop: false })

    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)
    expect(lastIndex(wrapper)).toEqual([2])

    await vi.advanceTimersByTimeAsync(5000)
    expect(lastIndex(wrapper)).toEqual([2])
    expect(wrapper.get('[data-gr-carousel-viewport]').attributes('aria-live')).toBe('polite')
  })

  it('на одном кадре показ не заводится вовсе', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GrCarousel, {
      attachTo: document.body,
      props: { ariaLabel: 'Галерея', autoplay: true, autoplayInterval: 1000 },
      slots: { default: () => [h(GrCarouselSlide, { key: 0 }, { default: () => 'один' })] },
    })
    await nextTick()
    await nextTick()

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('размонтирование не оставляет висящего таймера', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCarousel()

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('без autoplay тумблера нет', async () => {
    const wrapper = await mountCarousel({ autoplay: false })
    expect(wrapper.find('[data-gr-carousel-toggle]').exists()).toBe(false)
  })
})
