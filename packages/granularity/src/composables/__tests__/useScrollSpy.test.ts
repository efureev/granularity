import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockRect, stubMatchMedia } from '../../testing'
import type { UseScrollSpyOptions, UseScrollSpyReturn } from '../useScrollSpy'
import { useScrollSpy } from '../useScrollSpy'

/**
 * Подделка наблюдателя — локальным классом, как в `GrAffix`. В `src/testing/`
 * не выносится: потребитель один, а `src/testing` — публичный subpath пакета,
 * замораживаемый на 1.0.
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

  /** Записи наблюдателя нам безразличны — он только повод пересчитать. */
  fire(): void {
    this.callback([], this as unknown as IntersectionObserver)
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

const last = (): IntersectionObserverMock => IntersectionObserverMock.instances.at(-1)!

interface Stand {
  spy: UseScrollSpyReturn
  scroller: HTMLElement
  sections: Map<string, HTMLElement>
  /** Сдвинуть содержимое: в jsdom прокрутка не двигает прямоугольники сама. */
  scrollTo: (top: number) => void
  unmount: () => void
}

/**
 * Стенд: коробка-скроллер с четырьмя разделами по 300px.
 *
 * Раскладки в jsdom нет, поэтому прямоугольники задаются руками и вручную же
 * пересчитываются при «прокрутке» — иначе проверять было бы нечего.
 */
function setup(overrides: Partial<UseScrollSpyOptions> = {}, ids = ['intro', 'setup', 'usage', 'faq']): Stand {
  const scroller = document.createElement('div')
  scroller.style.overflowY = 'auto'
  document.body.append(scroller)

  const sections = new Map<string, HTMLElement>()

  for (const id of ids) {
    const el = document.createElement('section')
    el.id = id
    scroller.append(el)
    sections.set(id, el)
  }

  Object.defineProperty(scroller, 'scrollHeight', { value: 1200, configurable: true })
  Object.defineProperty(scroller, 'clientHeight', { value: 400, configurable: true })
  scroller.scrollTop = 0
  mockRect(scroller, { top: 0, height: 400, left: 0, width: 300 })

  function place(): void {
    ids.forEach((id, index) => {
      mockRect(sections.get(id)!, { top: index * 300 - scroller.scrollTop, height: 300, left: 0, width: 300 })
    })
  }

  place()

  let spy!: UseScrollSpyReturn

  const Host = defineComponent({
    setup() {
      spy = useScrollSpy({
        sections: () => ids,
        elementFor: id => sections.get(id) ?? null,
        scroller: () => scroller,
        ...overrides,
      })

      return () => null
    },
  })

  const wrapper = mount(Host)

  return {
    spy,
    scroller,
    sections,
    scrollTo: (top) => {
      scroller.scrollTop = top
      place()
      scroller.dispatchEvent(new Event('scroll'))
    },
    unmount: () => wrapper.unmount(),
  }
}

beforeEach(() => {
  IntersectionObserverMock.instances = []
  installObserver()
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''

  if (original)
    Object.defineProperty(globalThis, 'IntersectionObserver', original)
  else
    removeObserver()
})

describe('useScrollSpy: наблюдатель', () => {
  it('наблюдает все разделы, корнем берёт скроллпорт', () => {
    const stand = setup()

    expect(last().observed).toEqual([...stand.sections.values()])
    expect(last().options?.root).toBe(stand.scroller)
    expect(last().options?.threshold).toBe(0)
  })

  it('верх корня поджат замеренным отступом', () => {
    setup({ offset: () => 64 })

    expect(last().options?.rootMargin).toBe('-64px 0px 0px 0px')
  })

  it('находит скроллпорт сам, если он не задан', () => {
    const stand = setup({ scroller: () => undefined })

    expect(last().options?.root).toBe(stand.scroller)
  })

  it('отсутствующий раздел не наблюдается и объявляется один раз', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const stand = setup({ elementFor: id => (id === 'faq' ? null : document.getElementById(id)) })

    expect(last().observed).toHaveLength(3)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('#faq')

    last().fire()
    stand.spy.refresh()

    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe('useScrollSpy: активный раздел', () => {
  it('на первом кадре активен раздел под линией', () => {
    const stand = setup()

    expect(stand.spy.active.value).toBe('intro')
  })

  it('едет по разделам вместе с прокруткой', () => {
    const stand = setup()

    stand.scrollTo(320)
    last().fire()
    expect(stand.spy.active.value).toBe('setup')

    stand.scrollTo(650)
    last().fire()
    expect(stand.spy.active.value).toBe('usage')
  })

  it('линия сдвигается отступом', () => {
    const stand = setup({ offset: () => 120 })

    // Верх второго раздела на 300, линия на 120: он дойдёт до неё, когда
    // прокрутка возьмёт 180 пикселей, а не 300, как было бы без отступа.
    stand.scrollTo(100)
    last().fire()
    expect(stand.spy.active.value).toBe('intro')

    stand.scrollTo(180)
    last().fire()
    expect(stand.spy.active.value).toBe('setup')
  })

  it('дно скроллпорта активирует последний раздел', () => {
    const stand = setup()

    // Прокрутка до конца: верх последнего раздела линии не достигает никогда.
    stand.scrollTo(800)

    expect(stand.spy.active.value).toBe('faq')
  })

  it('сообщает о смене один раз, а не на каждой записи', () => {
    const onChange = vi.fn()
    const stand = setup({ onChange })

    onChange.mockClear()
    stand.scrollTo(320)
    last().fire()
    last().fire()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('setup', 'intro')
  })

  it('пустой список разделов не даёт активного', () => {
    const stand = setup({}, [])

    expect(stand.spy.active.value).toBeNull()
    expect(IntersectionObserverMock.instances.at(-1)?.observed ?? []).toHaveLength(0)
  })
})

describe('useScrollSpy: выключение и пересборка', () => {
  it('`disabled` снимает наблюдателя и сбрасывает активный', async () => {
    const disabled = ref(false)
    const stand = setup({ disabled: () => disabled.value })
    const observer = last()

    expect(stand.spy.active.value).toBe('intro')

    disabled.value = true
    await nextTick()

    expect(observer.disconnect).toHaveBeenCalled()
    expect(stand.spy.active.value).toBeNull()
  })

  it('`refresh()` пересобирает наблюдателя', () => {
    const stand = setup()
    const first = last()

    stand.spy.refresh()

    expect(first.disconnect).toHaveBeenCalled()
    expect(IntersectionObserverMock.instances).toHaveLength(2)
  })

  it('размонтирование отключает наблюдателя', () => {
    const stand = setup()
    const observer = last()

    stand.unmount()

    expect(observer.disconnect).toHaveBeenCalled()
  })
})

describe('useScrollSpy: среда без наблюдателя', () => {
  it('монтируется, молчит про активный, но прокручивать умеет', () => {
    removeObserver()
    const stand = setup()

    // Молчание — правильная деградация: подсветить первый раздел значило бы
    // поставить `aria-current` на пункт, который активным не является.
    expect(stand.spy.active.value).toBeNull()
    expect(IntersectionObserverMock.instances).toHaveLength(0)

    stand.spy.scrollTo('usage')

    expect(stand.scroller.scrollTop).toBe(600)
  })
})

describe('useScrollSpy: прокрутка к разделу', () => {
  it('ставит верх раздела на линию активации', () => {
    const stand = setup({ offset: () => 64 })

    stand.spy.scrollTo('usage')

    // Верх третьего раздела на 600, минус отступ.
    expect(stand.scroller.scrollTop).toBe(536)
  })

  it('подсветка переезжает сразу, до всякой прокрутки', () => {
    const stand = setup()

    stand.spy.scrollTo('faq')

    expect(stand.spy.active.value).toBe('faq')
  })

  it('закреп держит подсветку, пока наблюдатель говорит другое', () => {
    const stand = setup()

    stand.spy.scrollTo('faq')
    stand.scroller.scrollTop = 0
    last().fire()

    expect(stand.spy.active.value).toBe('faq')
  })

  it('закреп отпускается на первом событии прокрутки после оседания', () => {
    const stand = setup()

    stand.spy.scrollTo('faq')
    // Первое событие: доехали до цели — прокрутка осела.
    stand.scrollTo(stand.scroller.scrollTop)
    expect(stand.spy.active.value).toBe('faq')

    // Второе: пользователь тронул прокрутку — закреп снят, считаем заново.
    stand.scrollTo(0)
    expect(stand.spy.active.value).toBe('intro')
  })

  it('перехват колесом снимает закреп немедленно', () => {
    const stand = setup()

    stand.spy.scrollTo('faq')
    stand.scroller.scrollTop = 0
    stand.scroller.dispatchEvent(new Event('wheel'))

    expect(stand.spy.active.value).toBe('intro')
  })

  it('`pin(null)` отпускает закреп руками', () => {
    const stand = setup()

    stand.spy.pin('faq')
    expect(stand.spy.active.value).toBe('faq')

    stand.spy.pin(null)
    expect(stand.spy.active.value).toBe('intro')
  })

  it('прокрутка к несуществующему разделу ничего не делает', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const stand = setup()

    stand.spy.scrollTo('nope')

    expect(stand.scroller.scrollTop).toBe(0)
  })

  it('под `reduce` прокрутка мгновенная', () => {
    stubMatchMedia({ reducedMotion: true })
    const stand = setup()
    const scrollTo = vi.fn()
    Object.defineProperty(stand.scroller, 'scrollTo', { value: scrollTo, configurable: true })

    stand.spy.scrollTo('usage')

    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'auto' })
  })
})
