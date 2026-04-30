import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrDropdown from '../GrDropdown.vue'

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
    toJSON: () => ({}),
  }
}

describe('GrDropdown', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('рендерит выпадающую панель вне локального контейнера, чтобы её не обрезали родительские блоки', async () => {
    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()

    const content = document.body.querySelector('#dropdown-content')

    expect(content).toBeTruthy()
    expect(wrapper.element.contains(content)).toBe(false)
  })

  it('телепортирует панель в указанный target вместо body', async () => {
    const target = document.createElement('div')
    target.id = 'dropdown-target'
    document.body.appendChild(target)

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      props: {
        teleportTo: '#dropdown-target',
      },
      slots: {
        trigger: '<button type="button" data-testid="trigger">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()

    const content = target.querySelector('#dropdown-content')

    expect(content).toBeTruthy()
    expect(document.body.querySelector('#dropdown-content')).toBe(content)
    expect(wrapper.element.contains(content)).toBe(false)
  })

  it('привязывает правый край панели к trigger без измерения ширины панели', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      return window.setTimeout(() => callback(performance.now()), 0)
    })

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect() {
      const text = this.textContent ?? ''

      if (text.includes('Открыть') && !text.includes('Элемент меню')) {
        return {
          x: 100,
          y: 20,
          top: 20,
          right: 300,
          bottom: 52,
          left: 100,
          width: 200,
          height: 32,
          toJSON: () => ({}),
        }
      }

      return {
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        toJSON: () => ({}),
      }
    })

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('#dropdown-content')?.parentElement?.parentElement

    expect(panel).toBeTruthy()
    expect(panel?.style.left).toBe('300px')
    expect(panel?.style.top).toBe('60px')
    expect(panel?.className).toContain('-translate-x-full')
  })

  it('привязывает панель к trigger, а не к растянутому layout-контейнеру', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      return window.setTimeout(() => callback(performance.now()), 0)
    })

    const wrapper = mount(GrDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button" data-testid="trigger">Открыть</button>',
        content: '<div id="dropdown-content">Элемент меню</div>',
      },
    })

    const layoutContainer = wrapper.element as HTMLElement
    const triggerWrapper = wrapper.get('[data-testid="trigger"]').element.parentElement as HTMLElement

    vi.spyOn(layoutContainer, 'getBoundingClientRect').mockImplementation(() => rect(0, 20, 900, 48))
    vi.spyOn(triggerWrapper, 'getBoundingClientRect').mockImplementation(() => rect(24, 20, 240, 40))

    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('#dropdown-content')?.parentElement?.parentElement

    expect(panel).toBeTruthy()
    expect(panel?.style.left).toBe('264px')
    expect(panel?.style.top).toBe('68px')
    expect(panel?.className).toContain('-translate-x-full')
  })
})