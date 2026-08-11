/**
 * Каталог клавиш, которые понимает `keys` у `GrKbd`.
 *
 * Таблица, а не цепочка `if`, по двум причинам: во-первых, список — часть
 * публичного контракта (потребителю нужно знать, что можно написать), и
 * витрина показывает именно его, а не свою копию; во-вторых, копия в демо или
 * в доке разошлась бы с форматтером молча.
 */

/** Ключи читаемых имён — `gr.kbd.<name>`. */
export type GrKbdKeyName =
  | 'command' | 'option' | 'shift' | 'control' | 'enter' | 'escape' | 'tab'
  | 'backspace' | 'delete' | 'pageUp' | 'pageDown'
  | 'arrowUp' | 'arrowDown' | 'arrowLeft' | 'arrowRight'

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

/** Смысловая группа — ею витрина и дока раскладывают каталог. */
export type GrKbdTokenGroup = 'modifier' | 'editing' | 'navigation'

export interface GrKbdTokenSpec {
  /** Канонический токен: его пишут в `keys`. */
  token: string
  /** Что ещё принимается — синонимы и сам глиф. */
  aliases: readonly string[]
  group: GrKbdTokenGroup
  /** Вид на macOS и на остальных платформах. */
  apple: HotkeyKeyView
  other: HotkeyKeyView
}

function symbol(label: string, name: GrKbdKeyName): HotkeyKeyView {
  return { label, name, symbol: true }
}

function word(label: string, name?: GrKbdKeyName): HotkeyKeyView {
  return name ? { label, name } : { label }
}

export const GR_KBD_TOKENS: readonly GrKbdTokenSpec[] = [
  // Модификаторы: на macOS символы, на остальных платформах слова.
  { token: 'mod', aliases: [], group: 'modifier', apple: symbol('⌘', 'command'), other: word('Ctrl') },
  { token: 'meta', aliases: ['cmd', 'command', '⌘'], group: 'modifier', apple: symbol('⌘', 'command'), other: word('Meta') },
  { token: 'ctrl', aliases: ['control', '⌃'], group: 'modifier', apple: symbol('⌃', 'control'), other: word('Ctrl') },
  { token: 'alt', aliases: ['option', '⌥'], group: 'modifier', apple: symbol('⌥', 'option'), other: word('Alt') },
  { token: 'shift', aliases: ['⇧'], group: 'modifier', apple: symbol('⇧', 'shift'), other: word('Shift') },

  { token: 'enter', aliases: ['return', '↵', '↩'], group: 'editing', apple: symbol('↩', 'enter'), other: word('Enter') },
  { token: 'esc', aliases: ['escape'], group: 'editing', apple: word('Esc', 'escape'), other: word('Esc', 'escape') },
  { token: 'tab', aliases: ['⇥'], group: 'editing', apple: symbol('⇥', 'tab'), other: word('Tab') },
  { token: 'space', aliases: [], group: 'editing', apple: word('Space'), other: word('Space') },
  { token: 'backspace', aliases: ['⌫'], group: 'editing', apple: symbol('⌫', 'backspace'), other: word('Backspace') },
  { token: 'delete', aliases: ['del', '⌦'], group: 'editing', apple: symbol('⌦', 'delete'), other: word('Del') },

  { token: 'up', aliases: ['arrowup', '↑'], group: 'navigation', apple: symbol('↑', 'arrowUp'), other: symbol('↑', 'arrowUp') },
  { token: 'down', aliases: ['arrowdown', '↓'], group: 'navigation', apple: symbol('↓', 'arrowDown'), other: symbol('↓', 'arrowDown') },
  { token: 'left', aliases: ['arrowleft', '←'], group: 'navigation', apple: symbol('←', 'arrowLeft'), other: symbol('←', 'arrowLeft') },
  { token: 'right', aliases: ['arrowright', '→'], group: 'navigation', apple: symbol('→', 'arrowRight'), other: symbol('→', 'arrowRight') },
  { token: 'home', aliases: [], group: 'navigation', apple: word('Home'), other: word('Home') },
  { token: 'end', aliases: [], group: 'navigation', apple: word('End'), other: word('End') },
  { token: 'pageup', aliases: ['pgup', '⇞'], group: 'navigation', apple: symbol('⇞', 'pageUp'), other: word('PgUp') },
  { token: 'pagedown', aliases: ['pgdn', 'pgdown', '⇟'], group: 'navigation', apple: symbol('⇟', 'pageDown'), other: word('PgDn') },
]

const BY_ALIAS = new Map<string, GrKbdTokenSpec>()
for (const spec of GR_KBD_TOKENS) {
  BY_ALIAS.set(spec.token, spec)
  for (const alias of spec.aliases) BY_ALIAS.set(alias, spec)
}

/** Токен или его синоним — в описание клавиши. Регистр не важен, глиф тоже принимается. */
export function findKbdToken(token: string): GrKbdTokenSpec | undefined {
  const trimmed = token.trim()
  return BY_ALIAS.get(trimmed.toLowerCase()) ?? BY_ALIAS.get(trimmed)
}
