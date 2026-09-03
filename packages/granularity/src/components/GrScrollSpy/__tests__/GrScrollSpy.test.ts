import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubMatchMedia } from '../../../testing'
import GrScrollSpy from '../GrScrollSpy.vue'

/** Подделка наблюдателя: ядро `IntersectionObserver` в setup не заглушает. */
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

  fire(): void {
    this.callback([], this as unknown as IntersectionObserver)
  }
}

const original = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver')

const sections = [
  { id: 'intro', label: 'Введение' },
  { id: 'setup', label: 'Установка', level: 2 },
  { id: 'faq', label: 'Вопросы' },
]

/** Разделы в документе: без них наблюдать нечего, а клик некуда вести. */
function placeSections(): Map<string, HTMLElement> {
  const nodes = new Map<string, HTMLElement>()

  for (const section of sections) {
    const el = document.createElement('section')
    el.id = section.id
    document.body.append(el)
    nodes.set(section.id, el)
  }

  return nodes
}

beforeEach(() => {
  IntersectionObserverMock.instances = []
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''

  if (original)
    Object.defineProperty(globalThis, 'IntersectionObserver', original)
  else
    Reflect.deleteProperty(globalThis, 'IntersectionObserver')
})

describe('GrScrollSpy: разметка', () => {
  it('лендмарк с именем, список с ролью и ссылки на разделы', () => {
    placeSections()
    const wrapper = mount(GrScrollSpy, { props: { sections } })

    const nav = wrapper.find('[data-gr-scroll-spy]')
    expect(nav.attributes('aria-label')).toBeTruthy()
    // Снятый `list-style` отнимает у списка роль в WebKit — возвращаем явно.
    expect(wrapper.find('ul').attributes('role')).toBe('list')

    const links = wrapper.findAll('[data-gr-scroll-spy-item]')
    expect(links.map(link => link.attributes('href'))).toEqual(['#intro', '#setup', '#faq'])
    expect(links[0].text()).toBe('Введение')
  })

  it('уровень доезжает до диктора и до отступа', () => {
    placeSections()
    const wrapper = mount(GrScrollSpy, { props: { sections } })
    const items = wrapper.findAll('li')

    expect(items[1].attributes('aria-level')).toBe('2')
    expect(items[1].attributes('data-level')).toBe('2')
    expect(items[1].attributes('style')).toContain('padding-inline-start')
  })

  it('пустой список не рендерит лендмарк', () => {
    const wrapper = mount(GrScrollSpy, { props: { sections: [] } })

    expect(wrapper.find('[data-gr-scroll-spy]').exists()).toBe(false)
  })

  it('своё имя перекрывает встроенное', () => {
    placeSections()
    const wrapper = mount(GrScrollSpy, { props: { sections, ariaLabel: 'Разделы статьи' } })

    expect(wrapper.find('[data-gr-scroll-spy]').attributes('aria-label')).toBe('Разделы статьи')
  })

  it('число и строка в `offset` уезжают в переменную', () => {
    placeSections()
    const byNumber = mount(GrScrollSpy, { props: { sections, offset: 112 } })
    const byLength = mount(GrScrollSpy, { props: { sections, offset: 'var(--gr-navbar-height)' } })

    expect(byNumber.find('[data-gr-scroll-spy]').attributes('style')).toContain('--gr-scroll-spy-offset: 112px')
    expect(byLength.find('[data-gr-scroll-spy]').attributes('style')).toContain('--gr-scroll-spy-offset: var(--gr-navbar-height)')
  })

  it('обязательный `sections` не массивом — предупреждение', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(GrScrollSpy, { props: { sections: undefined as never } })

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls[0][0]).toContain('sections')
  })
})

describe('GrScrollSpy: состояние', () => {
  function stuck(id: string) {
    placeSections()
    const wrapper = mount(GrScrollSpy, { props: { sections } })
    const instance = wrapper.vm as unknown as { scrollTo: (id: string) => void }
    instance.scrollTo(id)

    return wrapper
  }

  it('активный пункт объявлен `location`, а не `page`', async () => {
    const wrapper = stuck('setup')
    await nextTick()

    const links = wrapper.findAll('[data-gr-scroll-spy-item]')
    expect(links[1].attributes('aria-current')).toBe('location')
    expect(links[0].attributes('aria-current')).toBeUndefined()
    expect(links.filter(link => link.attributes('aria-current')).length).toBe(1)
  })

  it('активность различима не только цветом', async () => {
    const wrapper = stuck('setup')
    await nextTick()

    const active = wrapper.findAll('[data-gr-scroll-spy-item]')[1]
    expect(active.attributes('data-active')).toBe('true')
    expect(active.classes()).toContain('font-600')
    expect(active.classes()).toContain('border-s-[var(--gr-scroll-spy-marker,var(--gr-primary))]')
  })

  it('предок активного помечен, но текущим не объявлен', async () => {
    const wrapper = stuck('setup')
    await nextTick()

    const parent = wrapper.findAll('[data-gr-scroll-spy-item]')[0]
    expect(parent.attributes('data-ancestor')).toBe('true')
    expect(parent.attributes('aria-current')).toBeUndefined()
  })

  it('сообщает о смене наружу', async () => {
    const wrapper = stuck('faq')
    await nextTick()

    expect(wrapper.emitted('activeChange')?.at(-1)).toEqual(['faq'])
  })
})

describe('GrScrollSpy: клик', () => {
  it('перехватывает обычный клик и сообщает о выборе', async () => {
    const nodes = placeSections()
    const focus = vi.spyOn(nodes.get('faq')!, 'focus')
    const replaceState = vi.spyOn(history, 'replaceState')
    const wrapper = mount(GrScrollSpy, { props: { sections } })

    const event = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true })
    wrapper.findAll('[data-gr-scroll-spy-item]')[2].element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')?.[0][0]).toBe('faq')
    expect(replaceState).toHaveBeenCalledWith(null, '', '#faq')
    // Фокус переезжает на раздел: иначе `Tab` продолжится внутри оглавления.
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('временный `tabindex` снимается, когда фокус ушёл', async () => {
    const nodes = placeSections()
    const wrapper = mount(GrScrollSpy, { props: { sections } })

    wrapper.findAll('[data-gr-scroll-spy-item]')[2].element
      .dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true, cancelable: true }))

    const target = nodes.get('faq')!
    expect(target.getAttribute('tabindex')).toBe('-1')

    target.dispatchEvent(new FocusEvent('blur'))
    expect(target.hasAttribute('tabindex')).toBe(false)
  })

  it('Cmd-клик остаётся браузеру', async () => {
    placeSections()
    const replaceState = vi.spyOn(history, 'replaceState')
    const wrapper = mount(GrScrollSpy, { props: { sections } })

    const event = new MouseEvent('click', { button: 0, metaKey: true, bubbles: true, cancelable: true })
    wrapper.findAll('[data-gr-scroll-spy-item]')[2].element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(replaceState).not.toHaveBeenCalled()
  })

  it('`updateHash: false` адрес не трогает', async () => {
    placeSections()
    const replaceState = vi.spyOn(history, 'replaceState')
    const wrapper = mount(GrScrollSpy, { props: { sections, updateHash: false } })

    wrapper.findAll('[data-gr-scroll-spy-item]')[1].element
      .dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true, cancelable: true }))

    expect(replaceState).not.toHaveBeenCalled()
  })

  it('`focusTarget: false` фокус не переносит', async () => {
    const nodes = placeSections()
    const focus = vi.spyOn(nodes.get('faq')!, 'focus')
    const wrapper = mount(GrScrollSpy, { props: { sections, focusTarget: false } })

    wrapper.findAll('[data-gr-scroll-spy-item]')[2].element
      .dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true, cancelable: true }))

    expect(focus).not.toHaveBeenCalled()
  })
})

describe('GrScrollSpy: движение', () => {
  it('под `reduce` прокрутка мгновенная', () => {
    stubMatchMedia({ reducedMotion: true })
    placeSections()
    const scrollTo = vi.fn()
    Object.defineProperty(document.scrollingElement ?? document.documentElement, 'scrollTo', {
      value: scrollTo,
      configurable: true,
    })

    const wrapper = mount(GrScrollSpy, { props: { sections } })
    wrapper.findAll('[data-gr-scroll-spy-item]')[2].element
      .dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true, cancelable: true }))

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })
})
