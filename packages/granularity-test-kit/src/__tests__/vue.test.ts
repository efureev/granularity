// @vitest-environment jsdom
import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { componentSheet, fintI18nGlobal, lookElement, nextFrame, queryOne, queryWrapper, stubElementRects } from '../vue'
import { createFixturePackage } from './fixture'

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

describe('componentSheet', () => {
  const sheet = `<script setup lang="ts"></script>

<template><span /></template>

<style>
/* <style> в комментарии листа не обрывает разбор */
[data-x] { color: red; }
[data-x][data-y] { color: blue; }
[data-x]:hover { background-color: var(--x-bg); }
[data-p] { --x-bg: var(--gr-muted); }
@media (prefers-reduced-motion: no-preference) {
  [data-x] { transition-duration: 150ms; }
}
</style>
`
  const fixture = createFixturePackage({ 'src/components/GrThing/GrThing.vue': sheet })
  const { cascade, look } = componentSheet(`${fixture.dir}/src/components/GrThing/GrThing.vue`)

  afterAll(fixture.cleanup)

  it('выигрывает более специфичное правило', () => {
    expect(cascade(lookElement('span', { 'data-x': '' })).color).toBe('red')
    expect(cascade(lookElement('span', { 'data-x': '', 'data-y': '' })).color).toBe('blue')
  })

  it('состояние ставится меткой, переменная предка подставляется', () => {
    const parent = lookElement('div', { 'data-p': '' })
    const element = lookElement('span', { 'data-x': '' })
    parent.append(element)
    document.body.append(parent)

    expect(cascade(element)['background-color']).toBeUndefined()
    expect(cascade(element, { hover: true })['background-color']).toBe('var(--x-bg)')
    expect(look(element, { hover: true })['background-color']).toBe('var(--gr-muted)')
  })

  it('лист файлом читается целиком', () => {
    const css = createFixturePackage({ 'src/components/GrThing/styles.css': '[data-x] { color: green; }' })
    const element = lookElement('span', { 'data-x': '' })

    expect(componentSheet(`${css.dir}/src/components/GrThing/styles.css`).cascade(element).color).toBe('green')
    css.cleanup()
  })

  it('читает медиазапрос движения', () => {
    const element = lookElement('span', { 'data-x': '' })

    expect(cascade(element)['transition-duration']).toBe('150ms')
    expect(cascade(element, { reducedMotion: true })['transition-duration']).toBeUndefined()
  })
})
