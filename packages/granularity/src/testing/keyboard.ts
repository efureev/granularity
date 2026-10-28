/**
 * Клавиатурные события в тестах.
 *
 * `composingKeydown` ставит **оба** признака IME-композиции. Пакет читает её
 * через `isComposingEvent` (`src/internal/keyboard.ts`) — `event.isComposing ||
 * event.keyCode === 229`, потому что Safari до 16.4 не ставил первое, — и тест с
 * одним флагом проверял бы половину предиката. Заодно вызов называет проверку:
 * «Enter во время композиции», а не обычный Enter с лишним полем.
 *
 * Композиция — это не экзотика: пока пользователь набирает 日本語, 한국어 или
 * что угодно через IME, `Enter` подтверждает **выбор иероглифа**, а не действие
 * виджета. Компонент, который на нём выберет опцию или отправит форму, у такого
 * пользователя неработоспособен.
 */

export type KeyboardEventOptions = KeyboardEventInit & { key: string }

/** Клавиатурное событие с разумными умолчаниями (всплывает, отменяемо). */
export function keyboardEvent(type: string, init: KeyboardEventOptions): KeyboardEvent {
  return new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init })
}

/** Нажатие клавиши в элемент. */
export function keydown(target: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = keyboardEvent('keydown', { key, ...init })
  target.dispatchEvent(event)
  return event
}

/**
 * Нажатие во время IME-композиции. Отдельная функция, а не флаг у `keydown`:
 * из имени в тесте видно, что проверяется, а `keyCode: 229` не приходится
 * помнить на каждом вызове.
 */
export function composingKeydown(target: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return keydown(target, key, { isComposing: true, keyCode: 229, ...init })
}
