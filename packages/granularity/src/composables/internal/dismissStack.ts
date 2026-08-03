/**
 * Единый стек dismissible-слоёв: модалки, drawer'ы, панели селектов, дропдауны,
 * подсказки — всё, что закрывается по Esc.
 *
 * Зачем один стек на всё. Механизмов было четыре, и они не знали друг о друге:
 * модалки слушали `window` в capture и глушили событие `stopImmediatePropagation`,
 * а floating-компоненты — `document` в bubble. Capture на `window` всегда раньше,
 * поэтому дропдаун, открытый ВНУТРИ модалки, по Esc не закрывался: закрывалась
 * модалка. Один дефект ломал GrSelect, GrDropdown, GrTooltip, GrTreeSelect и
 * GrAutocomplete.
 *
 * Инвариант: Esc адресуется верхнему слою — последнему зарегистрированному, —
 * и ниже не проваливается. Порядок регистрации совпадает с порядком открытия,
 * поэтому «внутри» всегда оказывается выше «снаружи».
 *
 * Capture-фаза на `window` нужна и сейчас: она опережает собственный
 * window-обработчик Escape у `Dialog` из HeadlessUI. Без неё HeadlessUI закрыл
 * бы модалку тем же нажатием, которым мы закрываем панель внутри неё.
 */

export interface DismissLayer {
  /** Уникальный id зарегистрированного слоя. */
  id: number
  /** Закрывать ли слой по Esc (реактивный геттер: `closeOnEsc` и подобные). */
  shouldClose: () => boolean
  /** Закрыть слой. */
  close: () => void
}

const stack: DismissLayer[] = []
let listening = false
let nextId = 1

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (stack.length === 0) return

  const top = stack[stack.length - 1]

  // Гасим всегда, даже если верхний слой не закрывается по Esc: иначе нажатие
  // «провалится» на слой ниже и закроет не то, что видит пользователь.
  event.preventDefault()
  event.stopPropagation()
  if (typeof event.stopImmediatePropagation === 'function')
    event.stopImmediatePropagation()

  if (top.shouldClose()) top.close()
}

function startListening(): void {
  if (listening) return
  if (typeof window === 'undefined') return
  window.addEventListener('keydown', handleKeydown, true)
  listening = true
}

function stopListening(): void {
  if (!listening) return
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', handleKeydown, true)
  listening = false
}

/** Регистрирует слой как верхний и возвращает его id. */
export function pushDismissLayer(layer: Omit<DismissLayer, 'id'>): number {
  const id = nextId++
  stack.push({ ...layer, id })
  startListening()
  return id
}

/** Снимает слой со стека (при закрытии или размонтировании). */
export function removeDismissLayer(id: number): void {
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  if (stack.length === 0) stopListening()
}

/** Сколько слоёв открыто. Для тестов и диагностики. */
export function dismissStackSize(): number {
  return stack.length
}

/** Тестовая/служебная очистка стека. */
export function resetDismissStack(): void {
  stack.splice(0, stack.length)
  stopListening()
}
