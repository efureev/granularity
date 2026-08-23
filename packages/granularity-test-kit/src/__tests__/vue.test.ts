// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import { fintI18nGlobal, nextFrame, queryOne, queryWrapper, stubElementRects } from '../vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('queryOne', () => {
  it('ищет по документу, когда корень не задан', () => {
    document.body.innerHTML = '<p data-mark>тут</p>'

    expect(queryOne('[data-mark]').textContent).toBe('тут')
  })

  it('ищет в заданном корне', () => {
    document.body.innerHTML = '<div id="a"><p data-mark>а</p></div><div id="b"><p data-mark>б</p></div>'
    const scope = queryOne('#b')

    expect(queryOne('[data-mark]', scope).textContent).toBe('б')
  })

  it('бросает с селектором в тексте, а не отдаёт null', () => {
    expect(() => queryOne('[data-missing]')).toThrow('[data-missing]')
  })
})

describe('queryWrapper', () => {
  it('отдаёт рабочую обёртку', async () => {
    document.body.innerHTML = '<button data-go type="button">жми</button>'
    let clicked = false
    queryOne('[data-go]').addEventListener('click', () => {
      clicked = true
    })

    const wrapper = queryWrapper('[data-go]')
    expect(wrapper.text()).toBe('жми')

    await wrapper.trigger('click')
    expect(clicked).toBe(true)
  })
})

describe('stubElementRects', () => {
  it('отдаёт прямоугольник любому элементу и достраивает стороны', () => {
    const restore = stubElementRects({ width: 1200, height: 600 })
    const rect = document.createElement('div').getBoundingClientRect()

    expect(rect.width).toBe(1200)
    expect(rect.right).toBe(1200)
    expect(rect.bottom).toBe(600)

    restore()
  })

  it('прямоугольник может зависеть от элемента', () => {
    const restore = stubElementRects(el => (el.tagName === 'SECTION' ? { width: 800 } : { width: 100 }))

    expect(document.createElement('section').getBoundingClientRect().width).toBe(800)
    expect(document.createElement('div').getBoundingClientRect().width).toBe(100)

    restore()
  })

  it('откат возвращает прежний метод', () => {
    const descriptor = (): unknown =>
      Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect')?.value
    const before: unknown = descriptor()

    const restore = stubElementRects({ width: 10 })
    expect(descriptor()).not.toBe(before)

    restore()
    expect(descriptor()).toBe(before)
  })
})

describe('nextFrame', () => {
  it('дожидается кадра', async () => {
    let painted = false
    requestAnimationFrame(() => {
      painted = true
    })

    expect(painted).toBe(false)
    await nextFrame()
    expect(painted).toBe(true)
  })
})

describe('fintI18nGlobal', () => {
  it('кладёт инстанс под глобальный символ', () => {
    const i18n = { t: (key: string) => key }

    expect(fintI18nGlobal(i18n).provide[Symbol.for('FintI18n')]).toBe(i18n)
  })

  it('складывается с чужими `provide` — ради этого форма и выбрана', () => {
    const other = Symbol('other')
    const foreign: Record<symbol, unknown> = { [other]: 1 }
    const merged = { ...foreign, ...fintI18nGlobal('i18n').provide }

    expect(merged[other]).toBe(1)
    expect(merged[Symbol.for('FintI18n')]).toBe('i18n')
  })
})
