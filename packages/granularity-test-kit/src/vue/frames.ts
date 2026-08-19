/**
 * Кадр `requestAnimationFrame`.
 *
 * Всё, что компонент откладывает до кадра — накопленный сдвиг жеста, пересчёт
 * геометрии, — до этого `await` не произошло. `nextTick` тут не помогает: он
 * про очередь Vue, а не про кадр браузера.
 */
export async function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}
