import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrSkeleton from '../GrSkeleton.vue'

describe('GrSkeleton', () => {
  it('использует дефолтные размеры и скругление', () => {
    const wrapper = mount(GrSkeleton)

    // Голый `<GrSkeleton />` рендерят `GrTable` и `GrList` — эти три значения
    // менять нельзя, не тронув их вид.
    expect(wrapper.attributes('style')).toContain('height: 12px;')
    expect(wrapper.attributes('style')).toContain('width: 100%;')
    expect(wrapper.attributes('style')).toContain('border-radius: var(--gr-radius-full);')
  })

  it('позволяет переопределить размеры и border radius', () => {
    const wrapper = mount(GrSkeleton, {
      props: {
        height: '24px',
        width: '8rem',
        rounded: '12px',
      },
    })

    expect(wrapper.attributes('style')).toContain('height: 24px;')
    expect(wrapper.attributes('style')).toContain('width: 8rem;')
    expect(wrapper.attributes('style')).toContain('border-radius: 12px;')
  })
})

describe('GrSkeleton — форма', () => {
  it('variant задаёт радиус: пилюля строке, скругление блоку', () => {
    // Из-за одного дефолта на всех прямоугольник просил `rounded` каждый раз.
    const text = mount(GrSkeleton, { props: { variant: 'text' } })
    expect(text.attributes('style')).toContain('border-radius: var(--gr-radius-full);')

    const rect = mount(GrSkeleton, { props: { variant: 'rect' } })
    expect(rect.attributes('style')).toContain('border-radius: var(--gr-radius-md);')

    const circle = mount(GrSkeleton, { props: { variant: 'circle' } })
    expect(circle.attributes('style')).toContain('border-radius: var(--gr-radius-full);')
  })

  it('явный rounded сильнее варианта', () => {
    const wrapper = mount(GrSkeleton, { props: { variant: 'rect', rounded: 'var(--gr-radius-full)' } })

    expect(wrapper.attributes('style')).toContain('border-radius: var(--gr-radius-full);')
  })

  it('variant не трогает размеры: они остаются на потребителе', () => {
    const rect = mount(GrSkeleton, { props: { variant: 'rect' } })

    expect(rect.attributes('style')).toContain('height: 12px;')
    expect(rect.attributes('style')).toContain('width: 100%;')
  })

  it('круг берёт высоту из ширины и отпускает её, когда высота задана', () => {
    const bare = mount(GrSkeleton, { props: { variant: 'circle' } })
    expect(bare.attributes('style')).toContain('width: 2.5rem;')
    expect(bare.attributes('style')).toContain('height: 2.5rem;')

    // Одна заданная сторона превратила бы круг в овал.
    const sized = mount(GrSkeleton, { props: { variant: 'circle', width: '64px' } })
    expect(sized.attributes('style')).toContain('width: 64px;')
    expect(sized.attributes('style')).toContain('height: 64px;')

    const explicit = mount(GrSkeleton, { props: { variant: 'circle', width: '64px', height: '20px' } })
    expect(explicit.attributes('style')).toContain('height: 20px;')
  })
})

describe('GrSkeleton — count', () => {
  it('одна заглушка рендерится без обёртки', () => {
    const wrapper = mount(GrSkeleton, { props: { count: 1 } })

    // DOM существующих потребителей от появления `count` не меняется.
    expect(wrapper.find('[data-gr-skeleton-group]').exists()).toBe(false)
    expect(wrapper.attributes('data-gr-skeleton')).toBeDefined()
  })

  it('несколько заглушек уезжают в общую обёртку', () => {
    const wrapper = mount(GrSkeleton, { props: { count: 3 } })

    expect(wrapper.attributes('data-gr-skeleton-group')).toBeDefined()
    expect(wrapper.findAll('[data-gr-skeleton]')).toHaveLength(3)
  })

  it('нечисловой и нулевой count не роняют компонент', () => {
    expect(mount(GrSkeleton, { props: { count: 0 } }).findAll('[data-gr-skeleton]')).toHaveLength(1)
    expect(mount(GrSkeleton, { props: { count: 2.7 } }).findAll('[data-gr-skeleton]')).toHaveLength(2)
  })

  it('последняя строка текста короче, у блоков — нет', () => {
    const text = mount(GrSkeleton, { props: { count: 3 } })
    const lines = text.findAll('[data-gr-skeleton]').map(node => node.attributes('style'))

    // Блок из одинаковых полос читается списком, а не абзацем.
    expect(lines[0]).toContain('width: 100%;')
    expect(lines[1]).toContain('width: 100%;')
    expect(lines[2]).toContain('width: 60%;')

    const rect = mount(GrSkeleton, { props: { count: 3, variant: 'rect' } })
    expect(rect.findAll('[data-gr-skeleton]').at(-1)!.attributes('style')).toContain('width: 100%;')
  })

  it('заданная ширина сильнее укороченной последней строки', () => {
    const wrapper = mount(GrSkeleton, { props: { count: 3, width: '80%' } })

    expect(wrapper.findAll('[data-gr-skeleton]').at(-1)!.attributes('style')).toContain('width: 80%;')
  })
})

describe('GrSkeleton — ARIA и движение', () => {
  it('заглушка скрыта от скринридера — и одна, и группой', () => {
    // Загрузку объявляет контейнер (`aria-busy` + живой регион), а не полоса:
    // озвучивать «пустой» узел незачем.
    expect(mount(GrSkeleton).attributes('aria-hidden')).toBe('true')

    const group = mount(GrSkeleton, { props: { count: 3 } })
    expect(group.attributes('aria-hidden')).toBe('true')
  })

  it('в группе нет ничего, кроме самих заглушек', () => {
    const wrapper = mount(GrSkeleton, { props: { count: 2 } })

    expect(wrapper.text()).toBe('')
    expect(wrapper.element.children).toHaveLength(2)
  })
})
