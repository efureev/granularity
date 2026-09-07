import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { resetGranularityDom } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(resetGranularityDom)

async function mountCarousel(props: Record<string, unknown> = {}, slides = 3) {
  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', autoplay: false, ...props },
    slots: {
      default: () => Array.from({ length: slides }, (_, index) =>
        h(GrCarouselSlide, { key: index }, { default: () => `кадр ${index + 1}` })),
    },
  })

  await nextTick()
  await nextTick()
  return wrapper
}

function track(wrapper: Awaited<ReturnType<typeof mountCarousel>>) {
  return wrapper.get('[data-gr-carousel-track]')
}

/** Позиция ленты в кадрах: она же `--gr-carousel-index`. */
function trackIndex(wrapper: Awaited<ReturnType<typeof mountCarousel>>): string | undefined {
  return track(wrapper).attributes('style')?.match(/--gr-carousel-index:\s*(-?\d+)/)?.[1]
}

function slideTransforms(wrapper: Awaited<ReturnType<typeof mountCarousel>>): (string | undefined)[] {
  return wrapper.findAll('[data-gr-carousel-slide]')
    .map(slide => slide.attributes('style')?.match(/translateX\((-?\d+)%\)/)?.[1])
}

/**
 * Доехать до последнего кадра своим ходом: в управляемом режиме родитель пропа
 * не обновляет, и лента честно осталась бы на месте.
 */
async function goToLast(wrapper: Awaited<ReturnType<typeof mountCarousel>>, count = 3) {
  for (let step = 0; step < count - 1; step += 1) {
    await wrapper.get('[data-gr-carousel-next]').trigger('click')
    await nextTick()
  }
}

async function next(wrapper: Awaited<ReturnType<typeof mountCarousel>>) {
  await wrapper.get('[data-gr-carousel-next]').trigger('click')
  await nextTick()
}

async function prev(wrapper: Awaited<ReturnType<typeof mountCarousel>>) {
  await wrapper.get('[data-gr-carousel-prev]').trigger('click')
  await nextTick()
}

describe('GrCarousel — замыкание кольца без клонов', () => {
  it('с последнего кадра лента едет вперёд, а не откатывается через все', async () => {
    const wrapper = await mountCarousel({ modelValue: 2 })

    await next(wrapper)

    // Раньше индекс просто сбрасывался в 0, и лента прокручивалась назад через
    // все кадры. Теперь она доезжает до позиции «за краем».
    expect(trackIndex(wrapper)).toBe('3')
    // Модель при этом уже на новом кадре: она про показанное, а не про доехавшее.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('первый кадр на время замыкания переезжает за последний', async () => {
    const wrapper = await mountCarousel({ modelValue: 2 })

    await next(wrapper)

    // Клона нет: кадры приходят слотом, и копия унесла бы состояние и ссылки.
    expect(slideTransforms(wrapper)).toEqual(['300', undefined, undefined])
  })

  it('назад с первого кадра последний встаёт перед ним', async () => {
    const wrapper = await mountCarousel({ modelValue: 0 })

    await prev(wrapper)

    expect(trackIndex(wrapper)).toBe('-1')
    expect(slideTransforms(wrapper)).toEqual([undefined, undefined, '-300'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('после перехода лента возвращается на настоящий индекс без анимации', async () => {
    const wrapper = await mountCarousel()
    await goToLast(wrapper)
    await next(wrapper)

    track(wrapper).element.dispatchEvent(
      new TransitionEvent('transitionend', { propertyName: 'transform' }),
    )
    await nextTick()

    expect(trackIndex(wrapper)).toBe('0')
    expect(slideTransforms(wrapper)).toEqual([undefined, undefined, undefined])
    // Возврат обязан пройти без перехода, иначе поедет тот самый обратный ход.
    expect(track(wrapper).attributes('data-gr-carousel-wrapping')).toBeDefined()
  })

  it('чужой переход кольцо не снимает', async () => {
    const wrapper = await mountCarousel({ modelValue: 2 })
    await next(wrapper)

    track(wrapper).element.dispatchEvent(
      new TransitionEvent('transitionend', { propertyName: 'opacity' }),
    )
    await nextTick()

    expect(trackIndex(wrapper)).toBe('3')
  })

  it('без loop край остаётся краем', async () => {
    const wrapper = await mountCarousel({ modelValue: 2, loop: false })

    await next(wrapper)

    expect(trackIndex(wrapper)).toBe('2')
    expect(slideTransforms(wrapper)).toEqual([undefined, undefined, undefined])
  })

  it('на единственном кадре замыкать нечего', async () => {
    const wrapper = await mountCarousel({ modelValue: 0 }, 1)

    expect(trackIndex(wrapper)).toBe('0')
    expect(slideTransforms(wrapper)).toEqual([undefined])
  })

  it('шаг во время замыкания не оставляет ленту за краем', async () => {
    const wrapper = await mountCarousel()
    await goToLast(wrapper)
    await next(wrapper)
    expect(trackIndex(wrapper)).toBe('3')

    // Не дождались перехода и нажали ещё раз: кольцо снимается, шаг обычный.
    await next(wrapper)

    expect(trackIndex(wrapper)).toBe('1')
    expect(slideTransforms(wrapper)).toEqual([undefined, undefined, undefined])
  })
})
