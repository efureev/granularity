/**
 * Разбор, матчинг и человекочитаемое представление сочетаний клавиш.
 *
 * Общий модуль, а не часть `GrCommandPalette`: то же нужно `GrKbd`, а импорт из
 * чужой компонентной директории на сборке дал бы ребро `GrKbd →
 * GrCommandPalette` (хелпер уехал бы в чанк палитры) — `granular doctor` считает
 * такое незадекларированной зависимостью.
 *
 * Директива `v-hotkey` для палитры не годится: ей нужен смонтированный элемент,
 * а палитра в закрытом состоянии не рендерит ничего. Поэтому здесь — свой
 * матчер на `window`, с тем же синтаксисом комбинаций плюс токен `mod`.
 */

import { eventMatchesKey, isAppleDevice, isComposingEvent, shiftSatisfied } from '../../internal/keyboard'

export { isAppleDevice } from '../../internal/keyboard'

export type ParsedCommandHotkey = {
  key: string
  ctrl: boolean
  meta: boolean
  alt: boolean
  shift: boolean
  /** `mod` — Cmd на macOS, Ctrl на остальных платформах. */
  mod: boolean
}

export function parseCommandHotkey(combo: string): ParsedCommandHotkey | null {
  const parts = combo.split('+').map(p => p.trim()).filter(Boolean)
  const keyToken = parts.at(-1)
  if (!keyToken) return null

  const parsed: ParsedCommandHotkey = {
    key: keyToken.length === 1 ? keyToken.toLowerCase() : keyToken,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    mod: false,
  }

  for (const part of parts.slice(0, -1)) {
    const token = part.toLowerCase()
    if (token === 'mod') parsed.mod = true
    else if (token === 'ctrl' || token === 'control') parsed.ctrl = true
    else if (token === 'meta' || token === 'cmd' || token === 'command' || token === '⌘') parsed.meta = true
    else if (token === 'alt' || token === 'option') parsed.alt = true
    else if (token === 'shift') parsed.shift = true
  }

  return parsed
}

export function matchesCommandHotkey(
  event: KeyboardEvent,
  hotkey: ParsedCommandHotkey,
  apple = isAppleDevice(),
): boolean {
  // Клавиша во время IME-композиции принадлежит композиции, а не сочетанию.
  if (isComposingEvent(event)) return false

  const expectMeta = hotkey.meta || (hotkey.mod && apple)
  const expectCtrl = hotkey.ctrl || (hotkey.mod && !apple)

  if (event.metaKey !== expectMeta) return false
  if (event.ctrlKey !== expectCtrl) return false
  if (event.altKey !== hotkey.alt) return false
  if (!shiftSatisfied(event, hotkey.key, hotkey.shift)) return false

  // Комбинация с модификаторами матчится и по физическому коду: на нелатинской
  // раскладке `mod+K` приходит как `key: 'л'`, и без кода сочетание мертво.
  return eventMatchesKey(event, hotkey.key, {
    codeFallback: expectMeta || expectCtrl || hotkey.alt,
  })
}

/** Человекочитаемые клавиши для подсказки в поле ввода (`⌘` / `Ctrl`). */
export function formatCommandHotkey(hotkey: ParsedCommandHotkey, apple = isAppleDevice()): string[] {
  const keys: string[] = []
  if (hotkey.meta || (hotkey.mod && apple)) keys.push('⌘')
  if (hotkey.ctrl || (hotkey.mod && !apple)) keys.push('Ctrl')
  if (hotkey.alt) keys.push(apple ? '⌥' : 'Alt')
  if (hotkey.shift) keys.push(apple ? '⇧' : 'Shift')
  keys.push(hotkey.key.length === 1 ? hotkey.key.toUpperCase() : hotkey.key)
  return keys
}

/**
 * Символьная клавиша: глиф плюс ключ читаемого имени. Без имени диктор
 * произносит `⌘` как «знак места интереса», а `↑` — как «стрелка вверх»,
 * то есть как значок, а не как клавишу.
 */
function symbolKey(label: string, name: GrKbdKeyName): HotkeyKeyView {
  return { label, name, symbol: true }
}

const ARROWS: Record<string, { label: string, name: GrKbdKeyName }> = {
  up: { label: '↑', name: 'arrowUp' },
  arrowup: { label: '↑', name: 'arrowUp' },
  down: { label: '↓', name: 'arrowDown' },
  arrowdown: { label: '↓', name: 'arrowDown' },
  left: { label: '←', name: 'arrowLeft' },
  arrowleft: { label: '←', name: 'arrowLeft' },
  right: { label: '→', name: 'arrowRight' },
  arrowright: { label: '→', name: 'arrowRight' },
}

const ARROW_GLYPHS: Record<string, { label: string, name: GrKbdKeyName }> = {
  '↑': ARROWS.up,
  '↓': ARROWS.down,
  '←': ARROWS.left,
  '→': ARROWS.right,
}

/** Одна клавиша в человекочитаемом виде. */
export interface HotkeyKeyView {
  /** Что видно на экране: символ (`⌘`) или слово (`Ctrl`). */
  label: string
  /**
   * Ключ читаемого имени (`gr.kbd.<name>`) для символьных клавиш. У `K` или
   * `Ctrl` его нет — они и так читаются вслух.
   */
  name?: GrKbdKeyName
  /** Символ (`⌘`, `↑`) или слово (`Ctrl`, `Esc`): от этого зависит склейка в одной плашке. */
  symbol?: boolean
}

/** Ключи читаемых имён — `gr.kbd.<name>`. */
export type GrKbdKeyName =
  | 'command' | 'option' | 'shift' | 'control' | 'enter' | 'escape' | 'tab'
  | 'backspace' | 'delete' | 'pageUp' | 'pageDown'
  | 'arrowUp' | 'arrowDown' | 'arrowLeft' | 'arrowRight'

/**
 * Токен → то, что видит пользователь. `mod` зависит от платформы: на macOS это
 * Cmd, на остальных — Ctrl. Символы отдаются вместе с ключом читаемого имени:
 * `⌘` без имени диктор произносит как «знак места интереса».
 */
export function formatHotkeyToken(token: string, apple: boolean): HotkeyKeyView {
  const t = token.trim()
  const lower = t.toLowerCase()

  // Читаемое имя добавляется только к символу: у слова `Ctrl` оно дало бы
  // диктору «Ctrl Control».
  if (lower === 'mod')
    return apple ? symbolKey('⌘', 'command') : { label: 'Ctrl' }

  if (lower === 'meta' || lower === 'cmd' || lower === 'command' || t === '⌘')
    return apple ? symbolKey('⌘', 'command') : { label: 'Meta' }

  if (lower === 'ctrl' || lower === 'control' || t === '⌃')
    return apple ? symbolKey('⌃', 'control') : { label: 'Ctrl' }

  if (lower === 'alt' || lower === 'option' || t === '⌥')
    return apple ? symbolKey('⌥', 'option') : { label: 'Alt' }

  if (lower === 'shift' || t === '⇧')
    return apple ? symbolKey('⇧', 'shift') : { label: 'Shift' }

  if (lower === 'enter' || lower === 'return' || t === '↵' || t === '↩')
    return apple ? symbolKey('↩', 'enter') : { label: 'Enter' }

  if (lower === 'esc' || lower === 'escape')
    return { label: 'Esc', name: 'escape' }

  if (lower === 'space')
    return { label: 'Space' }

  if (lower === 'tab' || t === '⇥')
    return apple ? symbolKey('⇥', 'tab') : { label: 'Tab' }

  if (lower === 'backspace' || t === '⌫')
    return apple ? symbolKey('⌫', 'backspace') : { label: 'Backspace' }

  if (lower === 'delete' || lower === 'del' || t === '⌦')
    return apple ? symbolKey('⌦', 'delete') : { label: 'Del' }

  if (lower === 'pageup' || lower === 'pgup' || t === '⇞')
    return apple ? symbolKey('⇞', 'pageUp') : { label: 'PgUp' }

  if (lower === 'pagedown' || lower === 'pgdn' || lower === 'pgdown' || t === '⇟')
    return apple ? symbolKey('⇟', 'pageDown') : { label: 'PgDn' }

  // Стрелки одинаковы на всех платформах: словом их пишут только в прозе.
  const arrow = ARROWS[lower] ?? ARROW_GLYPHS[t]
  if (arrow) return symbolKey(arrow.label, arrow.name)

  if (lower === 'home') return { label: 'Home' }
  if (lower === 'end') return { label: 'End' }

  // Одиночный символ — заглавным: `k` и `K` на клавише выглядят одинаково.
  return { label: t.length === 1 ? t.toUpperCase() : t }
}

export function formatHotkeyTokens(tokens: readonly string[], apple: boolean): HotkeyKeyView[] {
  return tokens.map(token => formatHotkeyToken(token, apple))
}

/** Комбинация строкой (`mod+shift+K`) — в набор токенов в порядке показа. */
export function splitHotkeyCombo(combo: string): string[] {
  return combo.split('+').map(part => part.trim()).filter(Boolean)
}
