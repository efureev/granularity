import { describe, expect, it } from 'vitest'

import {
  anchorFromElement,
  anchorFromPointer,
  isContextMenuKey,
  isKeyboardContextMenu,
  wantsNativeMenu,
} from '../contextMenuAnchor'

/**
 * Разбор события — вся содержательная логика открытия, и проверяется она без
 * монтирования: через отрендеренный компонент те же случаи стоили бы дороже и
 * проверяли бы слабее. Цена ошибки здесь высокая: перепутанный признак делает
 * меню либо недоступным с клавиатуры, либо открывающимся дважды.
 */
describe('anchorFromPointer', () => {
  it('точка курсора — прямоугольник нулевого размера', () => {
    const anchor = anchorFromPointer(new MouseEvent('contextmenu', { clientX: 120, clientY: 240 }))

    expect(anchor).toEqual({ x: 120, y: 240 })
  })
})

describe('anchorFromElement', () => {
  it('берёт прямоугольник целиком, а не его угол', () => {
    const element = document.createElement('div')
    element.getBoundingClientRect = () => ({
      left: 10, top: 20, width: 300, height: 32,
    } as DOMRect)

    expect(anchorFromElement(element)).toEqual({ x: 10, y: 20, width: 300, height: 32 })
  })
})

describe('isKeyboardContextMenu', () => {
  it('правый клик мышью клавиатурным не считается', () => {
    expect(isKeyboardContextMenu(new MouseEvent('contextmenu', { button: 2, detail: 1 }))).toBe(false)
    // Часть браузеров не проставляет `detail` мышиному `contextmenu` — кнопка
    // остаётся единственным надёжным признаком.
    expect(isKeyboardContextMenu(new MouseEvent('contextmenu', { button: 2, detail: 0 }))).toBe(false)
  })

  it('вызов с клавиатуры распознаётся по отсутствию кнопки и числа кликов', () => {
    expect(isKeyboardContextMenu(new MouseEvent('contextmenu', { button: 0, detail: 0 }))).toBe(true)
  })
})

describe('wantsNativeMenu', () => {
  it('Shift отдаёт меню браузеру', () => {
    expect(wantsNativeMenu(new MouseEvent('contextmenu', { shiftKey: true }))).toBe(true)
  })

  /** На macOS Ctrl+клик — это и есть правый клик, а не просьба о нативном меню. */
  it('Ctrl escape-hatch-ом не является', () => {
    expect(wantsNativeMenu(new MouseEvent('contextmenu', { ctrlKey: true }))).toBe(false)
    expect(wantsNativeMenu(new MouseEvent('contextmenu'))).toBe(false)
  })
})

describe('isContextMenuKey', () => {
  it('ловит оба клавиатурных вызова', () => {
    expect(isContextMenuKey(new KeyboardEvent('keydown', { key: 'ContextMenu' }))).toBe(true)
    expect(isContextMenuKey(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true }))).toBe(true)
  })

  it('F10 без Shift остаётся своей клавишей', () => {
    expect(isContextMenuKey(new KeyboardEvent('keydown', { key: 'F10' }))).toBe(false)
    expect(isContextMenuKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false)
  })
})
