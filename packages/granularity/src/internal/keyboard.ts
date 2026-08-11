/**
 * Общие примитивы разбора клавиатурных событий: IME-композиция и матчинг
 * клавиш, не зависящий от раскладки.
 *
 * Живут в `internal/`, а не рядом с потребителем: одно и то же нужно стеку
 * оверлеев (`composables/internal/overlayStack.ts`), директиве `v-hotkey` и
 * матчеру палитры (`components/shared/hotkey.ts`) — три слоя, у которых нет
 * общего предка ближе этого модуля.
 */

/**
 * Событие пришло во время IME-композиции — обрабатывать его как команду нельзя:
 * Esc здесь отменяет композицию, Enter — коммитит её, стрелки ходят по
 * кандидатам. `keyCode === 229` — страховка для движков, которые не выставляют
 * `isComposing` (исторически WebKit/старый Chromium).
 */
export function isComposingEvent(event: KeyboardEvent): boolean {
  return event.isComposing || event.keyCode === 229
}

/**
 * Фокус на контроле, который сам распоряжается печатными клавишами.
 *
 * Нужен всем, кто вешает клавиатурные команды на контейнер: горячая клавиша и
 * typeahead меню обязаны молчать, пока пользователь печатает в поле внутри них.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * macOS определяем по платформе: от неё зависит, чем является токен `mod` —
 * Cmd или Ctrl. Живёт здесь, а не рядом с одним потребителем: то же нужно
 * `GrKbd` (что показать), палитре (что слушать) и директиве `v-hotkey`.
 */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
}

/** Физический код клавиши для латинской буквы или цифры; иначе `null`. */
export function codeForChar(ch: string): string | null {
  if (/^[a-z]$/i.test(ch)) return `Key${ch.toUpperCase()}`
  if (/^\d$/.test(ch)) return `Digit${ch}`
  return null
}

export interface EventMatchesKeyOptions {
  /**
   * Дополнительно матчить по физическому коду (`event.code`), когда `event.key`
   * не совпал. Нужен комбинациям с модификаторами: на нелатинской раскладке
   * Ctrl/Cmd+K приходит как `key: 'л'`, и без кода сочетание мертво. Для
   * одиночных клавиш без модификаторов фолбэк не включается — там семантика
   * печатная, а не позиционная.
   */
  codeFallback?: boolean
}

/** Совпадает ли нажатая клавиша с ожидаемой (`'k'`, `'Escape'`, `' '`). */
export function eventMatchesKey(
  event: KeyboardEvent,
  expected: string,
  options: EventMatchesKeyOptions = {},
): boolean {
  if (expected === ' ') return event.key === ' ' || event.key === 'Spacebar'

  if (expected.length === 1) {
    if (event.key.toLowerCase() === expected.toLowerCase()) return true
    return Boolean(options.codeFallback) && codeForChar(expected) === event.code
  }

  return event.key === expected
}

/**
 * Удовлетворяет ли состояние Shift ожиданиям комбинации.
 *
 * Объявленный `shift` требует нажатого Shift. Необъявленный — запрещает его
 * с одним исключением: символ, который без Shift не набрать (`?`, `+`, `:`),
 * легален вместе с ним, когда `event.key` уже равен ожидаемому символу.
 * Буквы под исключение не попадают: `'a'` и Shift+A — разные намерения.
 */
export function shiftSatisfied(event: KeyboardEvent, expectedKey: string, expectShift: boolean): boolean {
  if (expectShift) return event.shiftKey
  if (!event.shiftKey) return true

  return expectedKey.length === 1 && !/\p{L}/u.test(expectedKey) && event.key === expectedKey
}
