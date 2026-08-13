/**
 * Клавиатурные события в тестах.
 *
 * Существует ради одного флага: **`isComposing` не переживает
 * `wrapper.trigger('keydown', …)`**. `@vue/test-utils` собирает событие из
 * переданного объекта, но `isComposing` — свойство только для чтения на
 * `KeyboardEvent`, и присвоение молча теряется. Тест «Enter во время
 * IME-композиции ничего не коммитит» при такой записи проверяет обычный Enter,
 * то есть зеленеет на сломанном коде.
 *
 * Пакет читает флаг через `isComposingEvent` (`src/internal/keyboard.ts`) —
 * `event.isComposing || event.keyCode === 229`, потому что Safari до 16.4 не
 * ставил первое. Генератор ставит оба, иначе тест проверял бы половину предиката.
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
