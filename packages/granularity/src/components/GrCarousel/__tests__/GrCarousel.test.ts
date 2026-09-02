import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick, ref } from 'vue'

import { resetGranularityDom } from '../../../testing'
import GrCarousel from '../GrCarousel.vue'
import GrCarouselSlide from '../GrCarouselSlide.vue'

afterEach(resetGranularityDom)

interface MountOptions {
  slides?: number
  props?: Record<string, unknown>
}

async function mountCarousel(options: MountOptions = {}) {
  const { slides = 3, props = {} } = options

  const wrapper = mount(GrCarousel, {
    attachTo: document.body,
    props: { ariaLabel: 'Галерея', ...props },
    slots: {
      default: () => Array.from({ length: slides }, (_, index) =>
        h(GrCarouselSlide, { key: index }, { default: () => `кадр ${index + 1}` })),
    },
  })

  // Кадры регистрируются в своём `setup`, а порядок сводится по DOM тактом позже.
  await nextTick()
  await nextTick()

  return wrapper
}

function trackIndex(wrapper: Awaited<ReturnType<typeof mountCarousel>>): string | undefined {
  const style = wrapper.get('[data-gr-carousel-track]').attributes('style')
  return style?.match(/--gr-carousel-index:\s*(\d+)/)?.[1]
}

describe('GrCarousel: роли и имя', () => {
  it('корень — группа с ролью карусели и именем', async () => {
    const wrapper = await mountCarousel()
    const root = wrapper.get('[data-gr-carousel]')

    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('aria-roledescription')).toBe('carousel')
    expect(root.attributes('aria-label')).toBe('Галерея')
  })

  it('landmark делает карусель ориентиром страницы', async () => {
    const wrapper = await mountCarousel({ props: { landmark: true } })
    expect(wrapper.get('[data-gr-carousel]').attributes('role')).toBe('region')
  })

  it('ariaLabelledby сильнее ariaLabel: имя берётся с заголовка страницы', async () => {
    const wrapper = await mountCarousel({ props: { ariaLabelledby: 'heading-1' } })
    const root = wrapper.get('[data-gr-carousel]')

    expect(root.attributes('aria-labelledby')).toBe('heading-1')
    expect(root.attributes('aria-label')).toBeUndefined()
  })

  it('с полосой кадр — tabpanel, без полосы — group', async () => {
    const withStrip = await mountCarousel()
    expect(withStrip.get('[data-gr-carousel-slide]').attributes('role')).toBe('tabpanel')

    const without = await mountCarousel({ props: { indicators: 'none' } })
    expect(without.get('[data-gr-carousel-slide]').attributes('role')).toBe('group')
  })

  it('кадр объявлен слайдом и назван позицией', async () => {
    const wrapper = await mountCarousel({ props: { indicators: 'none' } })
    const slide = wrapper.get('[data-gr-carousel-slide]')

    expect(slide.attributes('aria-roledescription')).toBe('slide')
    expect(slide.attributes('aria-label')).toBe('1 of 3')
  })

  it('нетекущий кадр inert — иначе Tab уезжает в невидимое', async () => {
    const wrapper = await mountCarousel()
    const slides = wrapper.findAll('[data-gr-carousel-slide]')

    expect(slides[0].attributes('inert')).toBeUndefined()
    expect(slides[1].attributes('inert')).toBeDefined()
    expect(slides[2].attributes('inert')).toBeDefined()
  })

  it('живой регион молчит на ходу и говорит на стоянке', async () => {
    const stopped = await mountCarousel()
    expect(stopped.get('[data-gr-carousel-viewport]').attributes('aria-live')).toBe('polite')

    const playing = await mountCarousel({ props: { autoplay: true } })
    expect(playing.get('[data-gr-carousel-viewport]').attributes('aria-live')).toBe('off')
  })
})

describe('GrCarousel: модель', () => {
  it('стрелка вперёд эмитит новый индекс', async () => {
    const wrapper = await mountCarousel()
    await wrapper.get('[data-gr-carousel-next]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  })

  it('внешняя запись двигает ленту', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 0 } })
    expect(trackIndex(wrapper)).toBe('0')

    await wrapper.setProps({ modelValue: 2 })
    expect(trackIndex(wrapper)).toBe('2')
  })

  it('индекс вне диапазона зажимается и правится у потребителя', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 99 } })

    expect(trackIndex(wrapper)).toBe('2')
    // Молча разойтись с моделью потребителя нельзя: он держит 99, лента — 2.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('loop замыкает ленту с последнего кадра на первый', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 2, loop: true } })
    await wrapper.get('[data-gr-carousel-next]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('без loop стрелка на краю выключена и молчит', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 2, loop: false } })
    const next = wrapper.get('[data-gr-carousel-next]')

    expect(next.attributes('aria-disabled')).toBe('true')

    await next.trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('выключенная стрелка остаётся фокусируемой — иначе фокус падает в body', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 0, loop: false } })
    const prev = wrapper.get('[data-gr-carousel-prev]')

    expect(prev.attributes('disabled')).toBeUndefined()
    expect(prev.attributes('aria-disabled')).toBe('true')
  })

  it('сокращение ленты доводит индекс до края и сообщает об этом', async () => {
    const count = ref(3)
    const changes: number[] = []

    mount({
      components: { GrCarousel, GrCarouselSlide },
      setup: () => ({ count, index: ref(2), onChange: (value: number) => changes.push(value) }),
      template: `
        <GrCarousel aria-label="Галерея" :model-value="index" @update:model-value="onChange">
          <GrCarouselSlide v-for="n in count" :key="n">{{ n }}</GrCarouselSlide>
        </GrCarousel>
      `,
    }, { attachTo: document.body })

    await nextTick()
    await nextTick()

    count.value = 2
    await nextTick()
    await nextTick()

    expect(changes.at(-1)).toBe(1)
  })
})

describe('GrCarousel: вырожденные состояния', () => {
  it('на одном кадре органов управления нет вовсе, а не выключены', async () => {
    const wrapper = await mountCarousel({ slides: 1 })

    expect(wrapper.find('[data-gr-carousel-next]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-carousel-prev]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-carousel-indicators]').exists()).toBe(false)
  })

  it('пустая лента рисует только корень с именем', async () => {
    const wrapper = await mountCarousel({ slides: 0 })

    expect(wrapper.get('[data-gr-carousel]').attributes('aria-label')).toBe('Галерея')
    expect(wrapper.find('[data-gr-carousel-indicators]').exists()).toBe(false)
    expect(wrapper.findAll('[data-gr-carousel-slide]')).toHaveLength(0)
  })

  it('indicators="none" убирает полосу, оставляя стрелки', async () => {
    const wrapper = await mountCarousel({ props: { indicators: 'none' } })

    expect(wrapper.find('[data-gr-carousel-indicators]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-carousel-next]').exists()).toBe(true)
  })
})

describe('GrCarousel: полоса переключателей', () => {
  it('это tablist, и текущий переключатель отмечен', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 1 } })
    const strip = wrapper.get('[data-gr-carousel-indicators]')
    const tabs = wrapper.findAll('[data-gr-carousel-indicator]')

    expect(strip.attributes('role')).toBe('tablist')
    expect(tabs).toHaveLength(3)
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
  })

  it('переключатель связан со своим кадром', async () => {
    const wrapper = await mountCarousel()
    const tab = wrapper.findAll('[data-gr-carousel-indicator]')[1]
    const slide = wrapper.findAll('[data-gr-carousel-slide]')[1]

    expect(tab.attributes('aria-controls')).toBe(slide.attributes('id'))
    expect(slide.attributes('aria-labelledby')).toBe(tab.attributes('id'))
  })

  it('полоса держит одну остановку Tab', async () => {
    const wrapper = await mountCarousel({ props: { modelValue: 1 } })
    const tabindexes = wrapper.findAll('[data-gr-carousel-indicator]')
      .map(tab => tab.attributes('tabindex'))

    expect(tabindexes.filter(value => value === '0')).toHaveLength(1)
    expect(tabindexes[1]).toBe('0')
  })

  it('клик по переключателю ведёт на его кадр', async () => {
    const wrapper = await mountCarousel()
    await wrapper.findAll('[data-gr-carousel-indicator]')[2].trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('слот #thumbnail сильнее URL: миниатюру рисует полоса, а не кадр', async () => {
    const wrapper = mount(GrCarousel, {
      attachTo: document.body,
      props: { ariaLabel: 'Галерея', indicators: 'thumbnails' },
      slots: {
        default: () => [
          h(GrCarouselSlide, { key: 0, thumbnail: '/a.jpg' }, {
            default: () => 'a',
            thumbnail: () => h('span', { 'data-own': '' }, 'своя'),
          }),
          h(GrCarouselSlide, { key: 1 }, { default: () => 'b' }),
        ],
      },
    })
    await nextTick()
    await nextTick()

    const tabs = wrapper.findAll('[data-gr-carousel-indicator]')
    expect(tabs[0].find('[data-own]').exists()).toBe(true)
    // URL проигрывает слоту: два изображения одного кадра были бы дублем.
    expect(tabs[0].find('img').exists()).toBe(false)
    // Разметка приехала из кадра, но живёт в полосе, а не внутри слайда.
    expect(wrapper.get('[data-gr-carousel-slide]').find('[data-own]').exists()).toBe(false)
  })

  it('миниатюры берут URL кадра, а без него держат ритм номером', async () => {
    const wrapper = mount(GrCarousel, {
      attachTo: document.body,
      props: { ariaLabel: 'Галерея', indicators: 'thumbnails' },
      slots: {
        default: () => [
          h(GrCarouselSlide, { key: 0, thumbnail: '/a.jpg' }, { default: () => 'a' }),
          h(GrCarouselSlide, { key: 1 }, { default: () => 'b' }),
        ],
      },
    })
    await nextTick()
    await nextTick()

    const tabs = wrapper.findAll('[data-gr-carousel-indicator]')
    expect(tabs[0].find('img').attributes('src')).toBe('/a.jpg')
    expect(tabs[0].find('img').attributes('alt')).toBe('')
    expect(tabs[1].text()).toBe('2')
  })
})

describe('GrCarousel: клавиатура', () => {
  it('стрелка листает ленту в автоматическом режиме', async () => {
    const wrapper = await mountCarousel()
    await wrapper.get('[data-gr-carousel-indicators]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  })

  it('в ручном режиме стрелка двигает только фокус, кадр подтверждает Enter', async () => {
    const wrapper = await mountCarousel({ props: { activationMode: 'manual' } })
    const strip = wrapper.get('[data-gr-carousel-indicators]')

    await strip.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await strip.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  })

  it('End ведёт к последнему кадру, Home — к первому', async () => {
    const wrapper = await mountCarousel()
    const strip = wrapper.get('[data-gr-carousel-indicators]')

    await strip.trigger('keydown', { key: 'End' })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])

    await strip.trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })
})

describe('GrCarousel: тон и свои иконки', () => {
  it('тон красит текущую точку по общей шкале', async () => {
    const wrapper = await mountCarousel({ props: { tone: 'success' } })
    const active = wrapper.findAll('[data-gr-carousel-indicator]')[0]

    expect(active.classes().some(name => name.includes('--gr-success'))).toBe(true)
  })

  it('по умолчанию тон primary', async () => {
    const wrapper = await mountCarousel()
    const active = wrapper.findAll('[data-gr-carousel-indicator]')[0]

    expect(active.classes().some(name => name.includes('--gr-primary'))).toBe(true)
  })

  it('слоты подменяют иконки стрелок, оставляя кнопку и её имя', async () => {
    const wrapper = mount(GrCarousel, {
      attachTo: document.body,
      props: { ariaLabel: 'Галерея' },
      slots: {
        default: () => [0, 1].map(index =>
          h(GrCarouselSlide, { key: index }, { default: () => `кадр ${index}` })),
        prev: () => h('span', { 'data-own-prev': '' }, '←'),
        next: () => h('span', { 'data-own-next': '' }, '→'),
      },
    })
    await nextTick()
    await nextTick()

    const prev = wrapper.get('[data-gr-carousel-prev]')
    expect(prev.find('[data-own-prev]').exists()).toBe(true)
    expect(prev.attributes('aria-label')).toBe('Previous slide')
    expect(wrapper.get('[data-gr-carousel-next]').find('[data-own-next]').exists()).toBe(true)
  })
})
