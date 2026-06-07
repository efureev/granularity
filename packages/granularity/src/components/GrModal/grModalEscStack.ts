/**
 * grModalEscStack — общий стек открытых `GrModal` для корректной обработки Esc.
 *
 * Зачем нужен:
 * HeadlessUI вешает обработчик Escape на `window` у каждого открытого `<Dialog>`.
 * Когда модалки рендерятся в разных деревьях приложения (например, диалоги
 * `useDialogService` монтируются отдельным `render()` в `document.body`), их
 * HeadlessUI-стек не общий, и каждый `<Dialog>` считает себя верхним. В итоге
 * Esc перехватывает обработчик той модалки, что смонтирована раньше (нижней),
 * а реально верхнее окно (последнее открытое) остаётся.
 *
 * Решение: единый capture-обработчик на `window`, который срабатывает раньше
 * обработчиков HeadlessUI, гасит событие (`stopImmediatePropagation`) и
 * закрывает только верхнюю (последнюю зарегистрированную) модалку. Так Esc
 * всегда адресуется верхнему окну независимо от дерева рендера.
 */

export interface GrModalEscEntry {
  /** Уникальный id зарегистрированной модалки. */
  id: number
  /** Должна ли модалка закрываться по Esc (реактивный геттер `closeOnEsc`). */
  shouldClose: () => boolean
  /** Закрыть модалку (эмит `update:modelValue=false`). */
  close: () => void
}

const stack: GrModalEscEntry[] = []
let listening = false
let nextId = 1

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (stack.length === 0) return

  // Верхняя модалка — последняя зарегистрированная.
  const top = stack[stack.length - 1]

  // Перехватываем Esc раньше HeadlessUI и нижних модалок: даже если верхнее
  // окно не закрывается (`closeOnEsc=false`), событие не должно «проваливаться»
  // к нижним окнам.
  event.preventDefault()
  event.stopPropagation()
  if (typeof event.stopImmediatePropagation === 'function')
    event.stopImmediatePropagation()

  if (top.shouldClose()) top.close()
}

function startListening(): void {
  if (listening) return
  if (typeof window === 'undefined') return
  // Capture-фаза, чтобы опередить window-обработчик Escape HeadlessUI.
  window.addEventListener('keydown', handleKeydown, true)
  listening = true
}

function stopListening(): void {
  if (!listening) return
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', handleKeydown, true)
  listening = false
}

/** Регистрирует открытую модалку как верхнюю и возвращает её id. */
export function pushGrModalEsc(entry: Omit<GrModalEscEntry, 'id'>): number {
  const id = nextId++
  stack.push({ ...entry, id })
  startListening()
  return id
}

/** Снимает модалку со стека (при закрытии или размонтировании). */
export function removeGrModalEsc(id: number): void {
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  if (stack.length === 0) stopListening()
}

/** Тестовая/служебная очистка стека. */
export function resetGrModalEscStack(): void {
  stack.splice(0, stack.length)
  stopListening()
}
