/**
 * Разбор и матчинг сочетания открытия палитры.
 *
 * Директива `v-hotkey` здесь не подходит: ей нужен смонтированный элемент, а
 * палитра в закрытом состоянии не рендерит ничего (весь UI живёт внутри
 * `GrModal`, который скрыт). Поэтому — минимальный собственный матчер на
 * `window`, с тем же синтаксисом комбинаций плюс токен `mod`.
 */

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
  const expectMeta = hotkey.meta || (hotkey.mod && apple)
  const expectCtrl = hotkey.ctrl || (hotkey.mod && !apple)

  if (event.metaKey !== expectMeta) return false
  if (event.ctrlKey !== expectCtrl) return false
  if (event.altKey !== hotkey.alt) return false
  if (event.shiftKey !== hotkey.shift) return false

  return hotkey.key.length === 1
    ? event.key.toLowerCase() === hotkey.key
    : event.key === hotkey.key
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
