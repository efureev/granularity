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

import { eventMatchesKey, isComposingEvent, shiftSatisfied } from '../../internal/keyboard'

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

/** macOS определяем по платформе — от неё зависит, чем является `mod`. */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
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

/** Одна клавиша в человекочитаемом виде. */
export interface HotkeyKeyView {
  /** Что видно на экране: символ (`⌘`) или слово (`Ctrl`). */
  label: string
  /**
   * Ключ читаемого имени (`gr.kbd.<name>`) для символьных клавиш. У `K` или
   * `Ctrl` его нет — они и так читаются вслух.
   */
  name?: 'command' | 'option' | 'shift' | 'control' | 'enter' | 'escape'
}

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
    return apple ? { label: '⌘', name: 'command' } : { label: 'Ctrl' }

  if (lower === 'meta' || lower === 'cmd' || lower === 'command' || t === '⌘')
    return apple ? { label: '⌘', name: 'command' } : { label: 'Meta' }

  if (lower === 'ctrl' || lower === 'control' || t === '⌃')
    return apple ? { label: '⌃', name: 'control' } : { label: 'Ctrl' }

  if (lower === 'alt' || lower === 'option' || t === '⌥')
    return apple ? { label: '⌥', name: 'option' } : { label: 'Alt' }

  if (lower === 'shift' || t === '⇧')
    return apple ? { label: '⇧', name: 'shift' } : { label: 'Shift' }

  if (lower === 'enter' || lower === 'return' || t === '↵' || t === '↩')
    return apple ? { label: '↩', name: 'enter' } : { label: 'Enter' }

  if (lower === 'esc' || lower === 'escape')
    return { label: 'Esc', name: 'escape' }

  if (lower === 'space')
    return { label: 'Space' }

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
