import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrSplitter from '../GrSplitter.vue'
import { cancelPointer, mockRect, move, press as pressPointer, release } from '../../../testing'

function mountSplitter(props: Record<string, unknown> = {}) {
  return mount(GrSplitter, {
    props,
    slots: { start: () => 'дерево', end: () => 'контент' },
    attachTo: document.body,
  })
}

function separator(wrapper: ReturnType<typeof mountSplitter>) {
  return wrapper.get('[data-gr-splitter-separator]')
}

function track(wrapper: ReturnType<typeof mountSplitter>): string {
  const style = wrapper.get('[data-gr-splitter]').attributes('style') ?? ''
  return style
}

async function press(wrapper: ReturnType<typeof mountSplitter>, key: string, options: Record<string, unknown> = {}) {
  await separator(wrapper).trigger('keydown', { key, ...options })
}

async function pointerDown(wrapper: ReturnType<typeof mountSplitter>, button = 0) {
  pressPointer(separator(wrapper).element, { button })
  await wrapper.vm.$nextTick()
}

/** Контейнер в jsdom нулевого размера: без прямоугольника считать не от чего. */
function stubRect(wrapper: ReturnType<typeof mountSplitter>) {
  mockRect(wrapper.get('[data-gr-splitter]').element, { width: 400, height: 200 })
}

describe('GrSplitter', () => {
  it('объявляет себя разделителем с размером первой панели', () => {
    const wrapper = mountSplitter({ modelValue: 30 })
    const bar = separator(wrapper)

    expect(bar.attributes('role')).toBe('separator')
    expect(bar.attributes('tabindex')).toBe('0')
    expect(bar.attributes('aria-valuenow')).toBe('30')
    expect(bar.attributes('aria-valuemin')).toBe('10')
    expect(bar.attributes('aria-valuemax')).toBe('90')
    expect(bar.attributes('aria-label')).toBe('Resize panels')

    wrapper.unmount()
  })

  it('`aria-controls` указывает на первую панель', () => {
    const wrapper = mountSplitter()
    const controls = separator(wrapper).attributes('aria-controls')!

    expect(wrapper.get(`#${controls}`).attributes('data-gr-splitter-pane')).toBe('start')

    wrapper.unmount()
  })

  it('`aria-orientation` — это ориентация полосы, а не раскладки', () => {
    // Панели, стоящие рядом, разделяет вертикальная полоса.
    expect(separator(mountSplitter()).attributes('aria-orientation')).toBe('vertical')
    expect(separator(mountSplitter({ orientation: 'vertical' })).attributes('aria-orientation'))
      .toBe('horizontal')
  })

  it('имя берётся из пропа, когда оно задано', () => {
    expect(separator(mountSplitter({ ariaLabel: 'Ширина дерева' })).attributes('aria-label'))
      .toBe('Ширина дерева')
  })

  it('раскладка идёт колонками или строками по ориентации', () => {
    expect(track(mountSplitter({ modelValue: 30 }))).toContain('grid-template-columns: 30%')
    expect(track(mountSplitter({ modelValue: 30, orientation: 'vertical' })))
      .toContain('grid-template-rows: 30%')
  })

  it('стрелки своей оси двигают размер, чужой — нет', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })

    await press(wrapper, 'ArrowRight')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([51])

    await press(wrapper, 'ArrowLeft')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([50])

    // Вертикальные стрелки принадлежат вертикальной раскладке.
    await press(wrapper, 'ArrowDown')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)

    wrapper.unmount()
  })

  it('`Shift` даёт крупный шаг', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })

    await press(wrapper, 'ArrowRight', { shiftKey: true })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([60])

    wrapper.unmount()
  })

  it('`Home` и `End` упираются в границы', async () => {
    const wrapper = mountSplitter({ modelValue: 50, min: 20, max: 70 })

    await press(wrapper, 'Home')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([20])

    await press(wrapper, 'End')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([70])

    wrapper.unmount()
  })

  it('размер не выходит за `min`, `max` и `minEnd`', async () => {
    const wrapper = mountSplitter({ modelValue: 50, min: 20, max: 90, minEnd: 30 })

    await press(wrapper, 'End')
    // 100 − 30: дальше вторая панель ушла бы под свой минимум.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([70])

    wrapper.unmount()
  })

  it('без `v-model` компонент помнит размер сам', async () => {
    const wrapper = mountSplitter({ defaultSize: 40 })

    expect(track(wrapper)).toContain('40%')
    await press(wrapper, 'ArrowRight')
    expect(track(wrapper)).toContain('41%')

    wrapper.unmount()
  })

  it('`v-model` ведёт размер снаружи', async () => {
    const wrapper = mountSplitter({ modelValue: 30 })

    await wrapper.setProps({ modelValue: 65 })
    expect(track(wrapper)).toContain('65%')
    expect(separator(wrapper).attributes('aria-valuenow')).toBe('65')

    wrapper.unmount()
  })

  it('`change` идёт на клавиатурном шаге', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })

    await press(wrapper, 'ArrowRight')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([51])

    wrapper.unmount()
  })

  it('`Enter` сворачивает панель и возвращает прежний размер', async () => {
    const wrapper = mountSplitter({ modelValue: 35, collapsible: true })

    await press(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([true])
    expect(track(wrapper)).toContain('0%')
    // Свёрнутость — это ноль в треке, но не ноль в модели.
    expect(separator(wrapper).attributes('aria-valuenow')).toBe('0')

    await press(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([false])
    expect(track(wrapper)).toContain('35%')

    wrapper.unmount()
  })

  it('без `collapsible` `Enter` ничего не делает', async () => {
    const wrapper = mountSplitter({ modelValue: 35 })

    await press(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')).toBeUndefined()
    expect(track(wrapper)).toContain('35%')

    wrapper.unmount()
  })

  it('свёрнутая панель на первое нажатие стрелки возвращается', async () => {
    const wrapper = mountSplitter({ modelValue: 35, collapsible: true })

    await press(wrapper, 'Enter')
    await press(wrapper, 'ArrowRight')

    expect(track(wrapper)).toContain('35%')
    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('двойной клик возвращает размер по умолчанию', async () => {
    const wrapper = mountSplitter({ modelValue: 20, defaultSize: 45 })

    await separator(wrapper).trigger('dblclick')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([45])
    expect(track(wrapper)).toContain('45%')

    wrapper.unmount()
  })

  it('перетаскивание меняет размер и коммитит его в конце', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })
    stubRect(wrapper)

    await pointerDown(wrapper)
    expect(wrapper.get('[data-gr-splitter]').attributes('data-dragging')).toBe('')

    move({ clientX: 100, clientY: 0 })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([25])
    // Пока тянут — только модель: `change` это точка сохранения раскладки.
    expect(wrapper.emitted('change')).toBeUndefined()

    release()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([25])
    expect(wrapper.get('[data-gr-splitter]').attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('оборванный жест возвращает раскладку к состоянию до нажатия', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })
    stubRect(wrapper)

    await pointerDown(wrapper)
    move({ clientX: 100, clientY: 0 })
    await wrapper.vm.$nextTick()

    cancelPointer()
    await wrapper.vm.$nextTick()

    expect(track(wrapper)).toContain('50%')
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('при `collapsible` жест ниже половины минимума сворачивает панель', async () => {
    const wrapper = mountSplitter({ modelValue: 50, min: 20, collapsible: true })
    stubRect(wrapper)

    await pointerDown(wrapper)
    move({ clientX: 20, clientY: 0 })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([true])
    expect(track(wrapper)).toContain('0%')

    wrapper.unmount()
  })

  it('не основная кнопка мыши жестом не считается', async () => {
    const wrapper = mountSplitter({ modelValue: 50 })

    await pointerDown(wrapper, 2)
    expect(wrapper.get('[data-gr-splitter]').attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('`disabled` убирает из таб-порядка и не даёт менять размер', async () => {
    const wrapper = mountSplitter({ modelValue: 50, disabled: true })

    expect(separator(wrapper).attributes('tabindex')).toBeUndefined()
    expect(separator(wrapper).attributes('aria-disabled')).toBe('true')

    await press(wrapper, 'ArrowRight')
    await separator(wrapper).trigger('dblclick')
    await pointerDown(wrapper)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('[data-gr-splitter]').attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('оформление приходит из `GrConfigProvider`, локальный проп сильнее', () => {
    const fromConfig = mount(GrConfigProvider, {
      props: { componentDefaults: { GrSplitter: { orientation: 'vertical' } } },
      slots: { default: () => h(GrSplitter, { modelValue: 40 }) },
    })
    expect(fromConfig.get('[data-gr-splitter]').attributes('data-orientation')).toBe('vertical')

    const localWins = mount(GrConfigProvider, {
      props: { componentDefaults: { GrSplitter: { orientation: 'vertical' } } },
      slots: { default: () => h(GrSplitter, { modelValue: 40, orientation: 'horizontal' }) },
    })
    expect(localWins.get('[data-gr-splitter]').attributes('data-orientation')).toBe('horizontal')
  })
})
