import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useComboboxNavigation } from '../useComboboxNavigation'

type Item = { id: string, selected?: boolean }

function setup(items: Item[], overrides: {
  open?: boolean
  initialIndex?: () => number
  scrollTo?: (item: Item, index: number) => void
} = {}) {
  const list = ref(items)
  const open = ref(overrides.open ?? true)
  const scope = effectScope()

  const nav = scope.run(() => useComboboxNavigation<Item>({
    items: () => list.value,
    open: () => open.value,
    idOf: item => `opt-${item.id}`,
    initialIndex: overrides.initialIndex,
    scrollTo: overrides.scrollTo,
  }))!

  return { nav, list, open }
}

function key(name: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: name, cancelable: true })
}

describe('useComboboxNavigation', () => {
  it('setActive клампит циклически и зовёт scrollTo', () => {
    const scrollTo = vi.fn()
    const { nav } = setup([{ id: 'a' }, { id: 'b' }, { id: 'c' }], { scrollTo })

    nav.setActive(1)
    expect(nav.activeItem.value?.id).toBe('b')
    expect(scrollTo).toHaveBeenLastCalledWith({ id: 'b' }, 1)

    nav.setActive(3)
    expect(nav.activeItem.value?.id).toBe('a')

    nav.setActive(-1)
    expect(nav.activeItem.value?.id).toBe('c')
  })

  it('init: выбранный, иначе первый, на пустом — никого', () => {
    const withSelected = setup([{ id: 'a' }, { id: 'b' }], { initialIndex: () => 1 })
    withSelected.nav.init()
    expect(withSelected.nav.activeItem.value?.id).toBe('b')

    const noSelected = setup([{ id: 'a' }, { id: 'b' }], { initialIndex: () => -1 })
    noSelected.nav.init()
    expect(noSelected.nav.activeItem.value?.id).toBe('a')

    const empty = setup([])
    empty.nav.init()
    expect(empty.nav.activeIndex.value).toBe(-1)
  })

  it('activeDescendantId существует только при открытом комбобоксе', () => {
    const { nav, open } = setup([{ id: 'a' }])
    nav.init()

    expect(nav.activeDescendantId.value).toBe('opt-a')

    open.value = false
    expect(nav.activeDescendantId.value).toBeUndefined()
  })

  it('сжатие списка клампит активный, расширение из пустоты активирует первый', async () => {
    const { nav, list } = setup([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
    nav.setActive(2)

    list.value = [{ id: 'a' }]
    await nextTick()
    expect(nav.activeIndex.value).toBe(0)

    nav.reset()
    list.value = [{ id: 'x' }, { id: 'y' }]
    await nextTick()
    expect(nav.activeItem.value?.id).toBe('x')
  })

  it('handleNavigationKeys двигает активный и гасит дефолт; чужие клавиши не трогает', () => {
    const { nav } = setup([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
    nav.init()

    const down = key('ArrowDown')
    expect(nav.handleNavigationKeys(down)).toBe(true)
    expect(down.defaultPrevented).toBe(true)
    expect(nav.activeItem.value?.id).toBe('b')

    expect(nav.handleNavigationKeys(key('End'))).toBe(true)
    expect(nav.activeItem.value?.id).toBe('c')

    expect(nav.handleNavigationKeys(key('Home'))).toBe(true)
    expect(nav.activeItem.value?.id).toBe('a')

    expect(nav.handleNavigationKeys(key('ArrowUp'))).toBe(true)
    expect(nav.activeItem.value?.id).toBe('c')

    const enter = key('Enter')
    expect(nav.handleNavigationKeys(enter)).toBe(false)
    expect(enter.defaultPrevented).toBe(false)
  })

  it('reset сбрасывает активный (по умолчанию в -1, палитре нужен 0)', () => {
    const { nav } = setup([{ id: 'a' }, { id: 'b' }])
    nav.setActive(1)

    nav.reset()
    expect(nav.activeIndex.value).toBe(-1)
    expect(nav.activeItem.value).toBeUndefined()

    nav.reset(0)
    expect(nav.activeIndex.value).toBe(0)
  })
})
