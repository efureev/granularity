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

import { isAppleDevice, isComposingEvent, matchesHotkeyCombo, parseHotkeyCombo } from '../../internal/keyboard'
import type { ParsedHotkeyCombo } from '../../internal/keyboard'

import { findKbdToken, type HotkeyKeyView } from './hotkeyTokens'

export { isAppleDevice } from '../../internal/keyboard'
export { findKbdToken, GR_KBD_TOKENS } from './hotkeyTokens'
export type { GrKbdKeyName, GrKbdTokenGroup, GrKbdTokenSpec, HotkeyKeyView } from './hotkeyTokens'

/** Разбор сочетания — общий на пакет, см. `internal/keyboard`. */
export type ParsedCommandHotkey = ParsedHotkeyCombo

export function parseCommandHotkey(combo: string): ParsedCommandHotkey | null {
  return parseHotkeyCombo(combo)
}

export function matchesCommandHotkey(
  event: KeyboardEvent,
  hotkey: ParsedCommandHotkey,
  apple = isAppleDevice(),
): boolean {
  // Клавиша во время IME-композиции принадлежит композиции, а не сочетанию.
  // Директива спрашивает это раньше, до перебора своих хоткеев; здесь хоткей
  // один, и место у проверки только тут.
  if (isComposingEvent(event))
    return false

  return matchesHotkeyCombo(event, hotkey, apple)
}

/** Человекочитаемые клавиши для подсказки в поле ввода (`⌘` / `Ctrl`). */
export function formatCommandHotkey(hotkey: ParsedCommandHotkey, apple = isAppleDevice()): string[] {
  const keys: string[] = []
  if (hotkey.meta || (hotkey.mod && apple))
    keys.push('⌘')
  if (hotkey.ctrl || (hotkey.mod && !apple))
    keys.push('Ctrl')
  if (hotkey.alt)
    keys.push(apple ? '⌥' : 'Alt')
  if (hotkey.shift)
    keys.push(apple ? '⇧' : 'Shift')
  keys.push(hotkey.key.length === 1 ? hotkey.key.toUpperCase() : hotkey.key)
  return keys
}

/**
 * Токен → то, что видит пользователь. Каталог общий с витриной и докой
 * (`hotkeyTokens.ts`): цепочка `if` расходилась бы со списком, который читает
 * потребитель.
 */
export function formatHotkeyToken(token: string, apple: boolean): HotkeyKeyView {
  const spec = findKbdToken(token)
  if (spec)
    return apple ? spec.apple : spec.other

  // Не из каталога — печатная клавиша: одиночный символ заглавным, потому что
  // `k` и `K` на клавише выглядят одинаково.
  const t = token.trim()
  return { label: t.length === 1 ? t.toUpperCase() : t }
}

export function formatHotkeyTokens(tokens: readonly string[], apple: boolean): HotkeyKeyView[] {
  return tokens.map(token => formatHotkeyToken(token, apple))
}

/** Комбинация строкой (`mod+shift+K`) — в набор токенов в порядке показа. */
export function splitHotkeyCombo(combo: string): string[] {
  return combo.split('+').map(part => part.trim()).filter(Boolean)
}

/**
 * Последовательность строкой (`g i`, `mod+k p`) — в шаги, каждый набором
 * токенов. Аккорд даёт один шаг, поэтому отдельного пути для него нет.
 */
export function splitHotkeySequence(value: string): string[][] {
  return value
    .split(/\s+/)
    .map(splitHotkeyCombo)
    .filter(step => step.length > 0)
}
