/**
 * Указательные жесты в тестах.
 *
 * Две вещи, которые ломают наивную запись жеста, и обе неочевидны:
 *
 * 1. **`pointerdown` идёт в элемент, а `pointermove`/`pointerup`/`pointercancel` — в `window`.**
 *    Так слушает `useDragGesture` (и всё, что на нём стоит: слайдер, сплиттер,
 *    перестановка, смахивание тоста): нажатие приходит от разметки, а движение
 *    ловится глобально, иначе жест обрывался бы на выходе курсора за элемент.
 *    Тест, отправивший движение в тот же элемент, ничего не проверяет — и молча.
 * 2. **`PointerEvent` в jsdom нет**, а `wrapper.trigger('pointerdown', { clientY })`
 *    падает на попытке записать `clientY`. Поэтому события собираются
 *    `MouseEvent`-ом и отправляются через `dispatchEvent`.
 *
 * Плюс `button: 0` по умолчанию: жест игнорирует неосновную кнопку, и без этого
 * «перетаскивание» в тесте не начинается вовсе.
 */

/** Событие указателя: `MouseEvent`, потому что `PointerEvent` в jsdom не реализован. */
export function pointer(type: string, init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent(type, { bubbles: true, ...init })
}

/** Нажатие: единственное событие жеста, которое адресуется элементу. */
export function press(target: Element, init: MouseEventInit = {}): void {
  target.dispatchEvent(pointer('pointerdown', { button: 0, ...init }))
}

export function move(init: MouseEventInit = {}): void {
  window.dispatchEvent(pointer('pointermove', init))
}

export function release(init: MouseEventInit = {}): void {
  window.dispatchEvent(pointer('pointerup', init))
}

/**
 * Обрыв жеста: система забрала указатель (системный жест, звонок, потеря окна).
 * Отдельная ветка поведения у всех потребителей — смахивание возвращает тост,
 * перестановка откатывает порядок, — поэтому проверяется отдельно от `release`.
 */
export function cancelPointer(init: MouseEventInit = {}): void {
  window.dispatchEvent(pointer('pointercancel', init))
}

/** Жест целиком: нажали на элементе, провели, отпустили. */
export function drag(target: Element, from: MouseEventInit, to: MouseEventInit): void {
  press(target, from)
  move(to)
  release(to)
}
