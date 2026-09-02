import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrAffix from '../GrAffix.vue'

/**
 * Подделка наблюдателя — локальным классом, по образцу `ResizeObserverMock` из
 * `GrSegmented`. В `src/testing/` не выносится: потребитель один, а `src/testing`
 * — публичный subpath пакета, замораживаемый на 1.0.
 *
 * Ставится явно: `src/__tests__/setup.ts` ядра `IntersectionObserver` не
 * заглушает, и штатное состояние jsdom здесь — его отсутствие.
 */
class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = []

  readonly callback: IntersectionObserverCallback
  readonly options: IntersectionObserverInit | undefined
  readonly observed: Element[] = []
  disconnect = vi.fn()
  unobserve = vi.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    IntersectionObserverMock.instances.push(this)
  }

  observe(target: Element): void {
    this.observed.push(target)
  }

  /** Раскладки в jsdom нет, поэтому геометрию записи задаём руками. */
  emit(
    rect: { top: number, bottom: number },
    rootBounds: { top: number, bottom: number } | null = { top: 0, bottom: 800 },
  ): void {
    this.callback(
      [{ boundingClientRect: rect, rootBounds } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

const original = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver')

function installObserver(): void {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    configurable: true,
    writable: true,
  })
}

function removeObserver(): void {
  Reflect.deleteProperty(globalThis, 'IntersectionObserver')
}

interface StubbedStyle {
  top?: string
  bottom?: string
  overflowY?: string
}

/**
 * Подмена вычисленного стиля: классы UnoCSS в jsdom в CSS не превращаются, и
 * `getComputedStyle(box).top` там всегда `auto`.
 */
function stubComputedStyle(resolve: (el: Element) => StubbedStyle): void {
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => ({
    top: 'auto',
    bottom: 'auto',
    overflowY: 'visible',
    ...resolve(el),
  } as CSSStyleDeclaration))
}

const last = (): IntersectionObserverMock => IntersectionObserverMock.instances.at(-1)!

beforeEach(() => {
  IntersectionObserverMock.instances = []
  installObserver()
})

afterEach(() => {
  vi.restoreAllMocks()
  if (original)
    Object.defineProperty(globalThis, 'IntersectionObserver', original)
  else
    removeObserver()
})

describe('GrAffix: разметка', () => {
  it('коробка липкая, стоит на краю и несёт контракт data-атрибутов', () => {
    const wrapper = mount(GrAffix, { slots: { default: 'Панель' } })
    const box = wrapper.find('[data-gr-affix]')

    expect(box.classes()).toContain('sticky')
    expect(box.classes()).toContain('top-[var(--gr-affix-offset,0px)]')
    expect(box.attributes('data-placement')).toBe('top')
    expect(box.attributes('data-stuck')).toBeUndefined()
    expect(box.text()).toBe('Панель')
  })

  it('число в `offset` уезжает в инлайновую переменную', () => {
    const wrapper = mount(GrAffix, { props: { offset: 112 } })

    expect(wrapper.find('[data-gr-affix]').attributes('style')).toContain('--gr-affix-offset: 112px')
  })

  it('строка в `offset` уходит как есть', () => {
    const wrapper = mount(GrAffix, { props: { offset: 'var(--app-header-h)' } })

    expect(wrapper.find('[data-gr-affix]').attributes('style')).toContain('--gr-affix-offset: var(--app-header-h)')
  })

  it('атрибуты потребителя садятся на коробку, а не на сентинел', () => {
    const wrapper = mount(GrAffix, { attrs: { 'class': 'my-panel', 'data-testid': 'actions' } })
    const box = wrapper.find('[data-gr-affix]')

    expect(box.classes()).toContain('my-panel')
    expect(box.attributes('data-testid')).toBe('actions')
    expect(wrapper.find('[data-gr-affix-sentinel]').attributes('data-testid')).toBeUndefined()
  })

  it('при placement="top" сентинел стоит перед коробкой', () => {
    const wrapper = mount(GrAffix)
    const box = wrapper.find('[data-gr-affix]').element
    const sentinel = wrapper.find('[data-gr-affix-sentinel]').element

    expect(box.previousElementSibling).toBe(sentinel)
    expect(sentinel.classList.contains('-mb-px')).toBe(true)
    expect(sentinel.getAttribute('aria-hidden')).toBe('true')
  })

  it('при placement="bottom" сентинел стоит после коробки', () => {
    const wrapper = mount(GrAffix, { props: { placement: 'bottom' } })
    const box = wrapper.find('[data-gr-affix]').element
    const sentinel = wrapper.find('[data-gr-affix-sentinel]').element

    expect(box.nextElementSibling).toBe(sentinel)
    expect(sentinel.classList.contains('-mt-px')).toBe(true)
    expect(wrapper.find('[data-gr-affix]').classes()).toContain('bottom-[var(--gr-affix-offset,0px)]')
  })
})

describe('GrAffix: disabled', () => {
  it('ни липкости, ни сентинела, ни наблюдателя', () => {
    const wrapper = mount(GrAffix, { props: { disabled: true } })

    expect(wrapper.find('[data-gr-affix]').classes()).not.toContain('sticky')
    expect(wrapper.find('[data-gr-affix-sentinel]').exists()).toBe(false)
    expect(IntersectionObserverMock.instances).toHaveLength(0)
  })

  it('гасит поверхность даже там, где наблюдателя нет', async () => {
    // Без наблюдателя поверхность включена всегда — и выключение обязано её
    // снять: неплипкая панель посреди формы ничего не перекрывает, и фон с
    // тенью были бы там визуальным мусором.
    removeObserver()
    const wrapper = mount(GrAffix)
    await nextTick()

    expect(wrapper.find('[data-gr-affix]').classes()).toContain('bg-[var(--gr-affix-bg,var(--gr-bg))]')

    await wrapper.setProps({ disabled: true })

    expect(wrapper.find('[data-gr-affix]').classes()).not.toContain('bg-[var(--gr-affix-bg,var(--gr-bg))]')
  })
})

describe('GrAffix: наблюдатель', () => {
  it('порог один, край поджат на замеренный отступ', () => {
    stubComputedStyle(el => (el.hasAttribute('data-gr-affix') ? { top: '112px' } : {}))
    mount(GrAffix, { props: { offset: 112 } })

    expect(last().options?.threshold).toBe(0)
    expect(last().options?.rootMargin).toBe('-112px 0px 0px 0px')
    expect(last().options?.root).toBeNull()
  })

  it('нижний край поджимается зеркально', () => {
    stubComputedStyle(el => (el.hasAttribute('data-gr-affix') ? { bottom: '64px' } : {}))
    mount(GrAffix, { props: { placement: 'bottom', offset: 64 } })

    expect(last().options?.rootMargin).toBe('0px 0px -64px 0px')
  })

  it('наблюдает сентинел, а не коробку', () => {
    const wrapper = mount(GrAffix)

    expect(last().observed).toEqual([wrapper.find('[data-gr-affix-sentinel]').element])
  })

  it('корнем становится ближайший предок-скроллер', () => {
    const Host = defineComponent({
      components: { GrAffix },
      template: '<div class="outer"><div class="scroller"><GrAffix>x</GrAffix></div></div>',
    })

    stubComputedStyle(el => (el.classList.contains('scroller') ? { overflowY: 'auto' } : {}))
    const wrapper = mount(Host, { attachTo: document.body })

    expect(last().options?.root).toBe(wrapper.find('.scroller').element)
  })
})

describe('GrAffix: состояние', () => {
  it('прилипает, включает поверхность и сообщает об этом один раз', async () => {
    const wrapper = mount(GrAffix)

    last().emit({ top: -5, bottom: -4 })
    await nextTick()

    const box = wrapper.find('[data-gr-affix]')
    expect(box.attributes('data-stuck')).toBe('true')
    expect(box.classes()).toContain('bg-[var(--gr-affix-bg,var(--gr-bg))]')
    expect(box.classes()).toContain('shadow-[var(--gr-affix-shadow,var(--gr-shadow-2))]')
    expect(wrapper.emitted('stickyChange')).toEqual([[true]])

    last().emit({ top: -9, bottom: -8 })
    await nextTick()

    expect(wrapper.emitted('stickyChange')).toEqual([[true]])
  })

  it('отлипает обратно', async () => {
    const wrapper = mount(GrAffix)

    last().emit({ top: -5, bottom: -4 })
    last().emit({ top: 300, bottom: 301 })
    await nextTick()

    expect(wrapper.find('[data-gr-affix]').attributes('data-stuck')).toBeUndefined()
    expect(wrapper.emitted('stickyChange')).toEqual([[true], [false]])
  })

  it('пустой rootBounds состояния не меняет', async () => {
    const wrapper = mount(GrAffix)

    last().emit({ top: -5, bottom: -4 }, null)
    await nextTick()

    expect(wrapper.find('[data-gr-affix]').attributes('data-stuck')).toBeUndefined()
    expect(wrapper.emitted('stickyChange')).toBeUndefined()
  })

  it('состояние доезжает до слота', async () => {
    const wrapper = mount(GrAffix, {
      slots: { default: '<template #default="{ stuck }">{{ stuck ? "прилипло" : "в потоке" }}</template>' },
    })

    expect(wrapper.text()).toBe('в потоке')

    last().emit({ top: -5, bottom: -4 })
    await nextTick()

    expect(wrapper.text()).toBe('прилипло')
  })

  it('нижняя панель берёт свою, зеркальную тень', async () => {
    const wrapper = mount(GrAffix, { props: { placement: 'bottom' } })

    last().emit({ top: 900, bottom: 901 })
    await nextTick()

    expect(wrapper.find('[data-gr-affix]').classes().join(' ')).toContain('shadow-[var(--gr-affix-shadow,0_-8px_24px_-12px_')
  })
})

describe('GrAffix: среда без наблюдателя', () => {
  it('монтируется и держит поверхность включённой', async () => {
    removeObserver()
    const wrapper = mount(GrAffix)
    await nextTick()

    const box = wrapper.find('[data-gr-affix]')
    expect(box.classes()).toContain('sticky')
    expect(box.classes()).toContain('bg-[var(--gr-affix-bg,var(--gr-bg))]')
    // Состояние выдумывать нельзя: непрозрачность — это деградация, а не «прилипло».
    expect(box.attributes('data-stuck')).toBeUndefined()
    expect(IntersectionObserverMock.instances).toHaveLength(0)
  })
})

describe('GrAffix: жизненный цикл', () => {
  it('размонтирование отключает наблюдателя', () => {
    const wrapper = mount(GrAffix)
    const observer = last()

    wrapper.unmount()

    expect(observer.disconnect).toHaveBeenCalled()
  })

  it('смена края пересобирает наблюдателя на новый сентинел', async () => {
    const wrapper = mount(GrAffix)
    const first = last()

    await wrapper.setProps({ placement: 'bottom' })

    expect(first.disconnect).toHaveBeenCalled()
    expect(IntersectionObserverMock.instances).toHaveLength(2)
    expect(last().options?.rootMargin).toBe('0px 0px 0px 0px')
    expect(last().observed).toEqual([wrapper.find('[data-gr-affix-sentinel]').element])
  })

  it('`remeasure()` перечитывает отступ', async () => {
    let offset = '0px'
    stubComputedStyle(el => (el.hasAttribute('data-gr-affix') ? { top: offset } : {}))

    const wrapper = mount(GrAffix)
    expect(last().options?.rootMargin).toBe('0px 0px 0px 0px')

    offset = '96px'
    ;(wrapper.vm as unknown as { remeasure: () => void }).remeasure()
    await nextTick()

    expect(IntersectionObserverMock.instances).toHaveLength(2)
    expect(last().options?.rootMargin).toBe('-96px 0px 0px 0px')
  })

  it('выключение прилипания на живом компоненте снимает наблюдателя', async () => {
    const wrapper = mount(GrAffix)
    const observer = last()

    observer.emit({ top: -5, bottom: -4 })
    await wrapper.setProps({ disabled: true })

    expect(observer.disconnect).toHaveBeenCalled()
    expect(wrapper.find('[data-gr-affix]').attributes('data-stuck')).toBeUndefined()
  })
})

describe('GrAffix: предупреждение про overflow у предка', () => {
  function mountIn(template: string, styles: (el: Element) => StubbedStyle) {
    stubComputedStyle(styles)

    return mount(defineComponent({ components: { GrAffix }, template }), { attachTo: document.body })
  }

  it('называет предка, внутри которого sticky мёртв', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountIn(
      '<div class="card"><GrAffix>x</GrAffix></div>',
      el => (el.classList.contains('card') ? { overflowY: 'hidden' } : {}),
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('overflow')
    expect(warn.mock.calls[0][0]).toContain('class="card')
  })

  it('молчит, когда предок — рабочий скроллер', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountIn(
      '<div class="pane"><GrAffix>x</GrAffix></div>',
      el => (el.classList.contains('pane') ? { overflowY: 'auto' } : {}),
    )

    expect(warn).not.toHaveBeenCalled()
  })

  it('молчит, когда клипер стоит выше скроллера', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountIn(
      '<div class="card"><div class="pane"><GrAffix>x</GrAffix></div></div>',
      (el) => {
        if (el.classList.contains('pane'))
          return { overflowY: 'auto' }

        return el.classList.contains('card') ? { overflowY: 'hidden' } : {}
      },
    )

    expect(warn).not.toHaveBeenCalled()
  })

  it('молчит на scroll-lock: обход не доходит до body', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Так выглядит страница с открытой модалкой: `useScrollLock` вешает
    // `overflow: hidden` на `body`. Кричать на каждый аффикс внутри окна нельзя.
    stubComputedStyle(el => (el === document.body ? { overflowY: 'hidden' } : {}))
    mount(GrAffix, { attachTo: document.body })

    expect(warn).not.toHaveBeenCalled()
  })
})
