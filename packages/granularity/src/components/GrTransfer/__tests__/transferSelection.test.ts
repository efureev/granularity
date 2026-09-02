import { describe, expect, it } from 'vitest'

import type { GrTransferKey } from '../transferModel'
import {
  allVisibleState,
  applySelect,
  emptySelection,
  pruneSelection,
  selectIntentFrom,
  toggleAllVisible,
} from '../transferSelection'

const visible: GrTransferKey[] = ['a', 'b', 'c', 'd', 'e']
const always = (): boolean => true
const state = (keys: GrTransferKey[], anchor?: GrTransferKey) => ({ keys: new Set(keys), anchor })
const picked = (s: { keys: ReadonlySet<GrTransferKey> }): GrTransferKey[] => [...s.keys]

describe('selectIntentFrom', () => {
  it('голый клик заменяет', () => {
    expect(selectIntentFrom({ shiftKey: false, ctrlKey: false, metaKey: false }))
      .toEqual({ mode: 'replace', additive: false })
  })

  it('Ctrl и Cmd переключают', () => {
    expect(selectIntentFrom({ shiftKey: false, ctrlKey: true, metaKey: false }).mode).toBe('toggle')
    expect(selectIntentFrom({ shiftKey: false, ctrlKey: false, metaKey: true }).mode).toBe('toggle')
  })

  it('Shift сильнее Ctrl, но их сочетание объединяет', () => {
    expect(selectIntentFrom({ shiftKey: true, ctrlKey: false, metaKey: false }))
      .toEqual({ mode: 'range', additive: false })
    expect(selectIntentFrom({ shiftKey: true, ctrlKey: true, metaKey: false }))
      .toEqual({ mode: 'range', additive: true })
  })
})

describe('applySelect', () => {
  it('клик оставляет одну строку и ставит якорь', () => {
    const next = applySelect(state(['a', 'b']), 'd', { mode: 'replace', additive: false }, visible, always)

    expect(picked(next)).toEqual(['d'])
    expect(next.anchor).toBe('d')
  })

  it('Ctrl добавляет и снимает', () => {
    const added = applySelect(emptySelection, 'b', { mode: 'toggle', additive: true }, visible, always)
    expect(picked(added)).toEqual(['b'])

    const removed = applySelect(added, 'b', { mode: 'toggle', additive: true }, visible, always)
    expect(picked(removed)).toEqual([])
  })

  it('Shift берёт диапазон от якоря и заменяет им выделение', () => {
    const next = applySelect(state(['z'], 'b'), 'd', { mode: 'range', additive: false }, visible, always)

    expect(picked(next)).toEqual(['b', 'c', 'd'])
  })

  it('Shift не двигает якорь — иначе диапазон нельзя растянуть', () => {
    const first = applySelect(state([], 'b'), 'c', { mode: 'range', additive: false }, visible, always)
    expect(first.anchor).toBe('b')

    const second = applySelect(first, 'e', { mode: 'range', additive: false }, visible, always)
    expect(picked(second)).toEqual(['b', 'c', 'd', 'e'])
  })

  it('диапазон работает в обе стороны', () => {
    const next = applySelect(state([], 'd'), 'b', { mode: 'range', additive: false }, visible, always)

    expect(picked(next)).toEqual(['b', 'c', 'd'])
  })

  it('Ctrl+Shift объединяет диапазон с уже выбранным', () => {
    const next = applySelect(state(['a'], 'c'), 'd', { mode: 'range', additive: true }, visible, always)

    expect(picked(next).sort()).toEqual(['a', 'c', 'd'])
  })

  it('диапазон считается по видимому порядку, а не по каталогу', () => {
    // Фильтр оставил a, c, e — «от a до e» это три строки, а не пять.
    const next = applySelect(state([], 'a'), 'e', { mode: 'range', additive: false }, ['a', 'c', 'e'], always)

    expect(picked(next)).toEqual(['a', 'c', 'e'])
  })

  it('якорь вне видимого вырождает диапазон в замену', () => {
    const next = applySelect(state([], 'b'), 'e', { mode: 'range', additive: false }, ['c', 'd', 'e'], always)

    expect(picked(next)).toEqual(['e'])
    expect(next.anchor).toBe('e')
  })

  it('невыбираемая строка не меняет ничего', () => {
    const before = state(['a'], 'a')
    const next = applySelect(before, 'c', { mode: 'replace', additive: false }, visible, key => key !== 'c')

    expect(next).toBe(before)
  })

  it('диапазон перешагивает невыбираемые строки', () => {
    const next = applySelect(state([], 'a'), 'd', { mode: 'range', additive: false }, visible, key => key !== 'c')

    expect(picked(next)).toEqual(['a', 'b', 'd'])
  })
})

describe('toggleAllVisible', () => {
  it('берёт всё видимое, не трогая скрытое выделенное', () => {
    const next = toggleAllVisible(state(['e']), ['a', 'b'], always)

    expect(picked(next).sort()).toEqual(['a', 'b', 'e'])
  })

  it('всё уже выбрано — снимает только видимое', () => {
    const next = toggleAllVisible(state(['a', 'b', 'e']), ['a', 'b'], always)

    expect(picked(next)).toEqual(['e'])
  })

  it('пустая видимая часть ничего не делает', () => {
    expect(picked(toggleAllVisible(state(['a']), [], always))).toEqual(['a'])
  })
})

describe('pruneSelection', () => {
  it('вычищает исчезнувшие ключи и якорь', () => {
    const next = pruneSelection(state(['a', 'z'], 'z'), ['a', 'b'])

    expect(picked(next)).toEqual(['a'])
    expect(next.anchor).toBeUndefined()
  })

  it('ничего не изменилось — возвращает тот же объект', () => {
    const before = state(['a'], 'a')

    expect(pruneSelection(before, ['a', 'b'])).toBe(before)
  })
})

describe('allVisibleState', () => {
  it('различает три состояния отметки в шапке', () => {
    expect(allVisibleState(state([]), visible, always)).toBe('unchecked')
    expect(allVisibleState(state(['a']), visible, always)).toBe('indeterminate')
    expect(allVisibleState(state(visible), visible, always)).toBe('checked')
  })

  it('невыбираемые строки в счёт не идут', () => {
    expect(allVisibleState(state(['a', 'b']), ['a', 'b', 'c'], key => key !== 'c')).toBe('checked')
  })

  it('пустая панель — отметка снята', () => {
    expect(allVisibleState(state([]), [], always)).toBe('unchecked')
  })
})
