import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { mount } from '@vue/test-utils'

import { announced, cancelPointer, granularityGlobal, move, press, release, resetGranularityDom } from '@feugene/granularity/testing'
import { nextFrame } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardPaletteItem } from '../grDashboardPaletteStyles'
import GrDashboardPalette from '../GrDashboardPalette.vue'

afterEach(() => {
  cancelPointer()
  resetGranularityDom()
})

const ITEMS: GrDashboardPaletteItem[] = [
  { id: 'sales', title: 'Продажи', defaultSize: { w: 6, h: 2 } },
  { id: 'traffic', title: 'Трафик', disabled: true },
]

type PaletteSlots = ComponentMountingOptions<typeof GrDashboardPalette>['slots']

function stand(props: Record<string, unknown> = {}, slots: PaletteSlots = {}) {
  const added: string[] = []

  const wrapper = mount(GrDashboardPalette, {
    props: { items: ITEMS, onAdd: (item: GrDashboardPaletteItem) => added.push(item.id), ...props },
    slots,
    attachTo: document.body,
    global: granularityGlobal(),
  })

  return { wrapper, added, root: wrapper.element as HTMLElement }
}

function row(root: HTMLElement, id: string): HTMLElement {
  const items = [...root.querySelectorAll<HTMLElement>('[data-gr-dashboard-palette-item]')]
  const found = items.find(item => item.textContent?.includes(id === 'sales' ? 'Продажи' : 'Трафик'))
  if (!found) throw new Error(`нет плитки ${id}`)

  return found.firstElementChild as HTMLElement
}

const ghost = () => document.body.querySelector<HTMLElement>('[data-gr-dashboard-transfer-ghost]')

describe('grDashboardPalette: начало переноса', () => {
  it('перетаскивание включено по умолчанию', async () => {
    const { root } = stand()

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()

    expect(ghost()).not.toBeNull()
  })

  it('draggable=false перенос не начинает, а кнопка работает как раньше', async () => {
    const { root, added } = stand({ draggable: false })

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    expect(ghost()).toBeNull()

    root.querySelector('button')?.click()
    await nextTick()
    expect(added).toEqual(['sales'])
  })

  it('нажатие на кнопку переносом не становится, и клик по-прежнему добавляет', async () => {
    // Дёрнувший мышью на пять пикселей во время клика получил бы перенос вместо
    // добавления — а добавление тут контракт.
    const { root, added } = stand()
    const button = row(root, 'sales').querySelector('button')!

    press(button, { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    expect(ghost()).toBeNull()

    button.click()
    await nextTick()
    expect(added).toEqual(['sales'])
  })

  it('выключенная плитка и выключенный каталог не тащатся', async () => {
    const { root } = stand()
    press(row(root, 'traffic'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    expect(ghost()).toBeNull()

    cancelPointer()
    const off = stand({ disabled: true })
    press(row(off.root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    expect(ghost()).toBeNull()
  })

  it('живой регион молчит про указательный перенос и говорит про кнопку', async () => {
    const { root } = stand()

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    release()
    await nextTick()
    expect(await announced()).toBe('')

    root.querySelector('button')?.click()
    await nextTick()
    expect(await announced()).not.toBe('')
  })
})

describe('grDashboardPalette: призрак', () => {
  it('появляется только после порога, живёт в портале и не мешает хит-тестам', async () => {
    const { root } = stand()

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 12, clientY: 10 })
    await nextFrame()
    expect(ghost()).toBeNull()

    move({ clientX: 60, clientY: 40 })
    await nextFrame()

    const el = ghost()!
    expect(el).not.toBeNull()
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('pointer-events-none')
    expect(root.contains(el)).toBe(false)
    expect(el.textContent).toContain('Продажи')
    expect(el.textContent).toContain('6×2')
  })

  it('слот ghost заменяет содержимое', async () => {
    const { root } = stand({}, { ghost: () => h('span', { 'data-own-ghost': '' }, 'своё') })

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()

    expect(ghost()?.querySelector('[data-own-ghost]')).not.toBeNull()
    expect(ghost()?.textContent).not.toContain('6×2')
  })

  it('исчезает по отпусканию', async () => {
    const { root } = stand()

    press(row(root, 'sales'), { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    release()
    await nextTick()

    expect(ghost()).toBeNull()
  })
})

describe('grDashboardPalette: своя плитка', () => {
  it('слот item получает transferProps и признак переноса', async () => {
    const { root } = stand({}, {
      item: (slotProps: {
        item: GrDashboardPaletteItem
        dragging: boolean
        transferProps: Record<string, unknown>
      }) => h('span', {
        'data-own-row': '',
        'data-dragging': slotProps.dragging ? '' : undefined,
        ...slotProps.transferProps,
      }, slotProps.item.title),
    })

    const own = root.querySelector<HTMLElement>('[data-own-row]')!
    press(own, { clientX: 10, clientY: 10 })
    move({ clientX: 60, clientY: 40 })
    await nextFrame()
    await nextTick()

    expect(ghost()).not.toBeNull()
    expect(root.querySelector('[data-own-row][data-dragging]')).not.toBeNull()
  })
})
