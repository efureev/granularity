/**
 * Единый стек слоёв оверлеев: модалки, drawer'ы, просмотрщик, панели селектов,
 * дропдауны, подсказки — всё, что открывается поверх страницы.
 *
 * Список один, и порядок регистрации совпадает с порядком открытия, но из него
 * выводятся **две разные вершины**:
 *
 *  - **Esc** → последний слой любого рода. Дропдаун, открытый внутри модалки,
 *    обязан закрыться первым — пользователь видит верхним именно его.
 *  - **`inert`** → ставится на модальные слои ниже последнего **модального**.
 *    Немодальный слой сверху модалку не понижает: иначе окно ушло бы в `inert`
 *    вместе со своим же открытым дропдауном и перестало отвечать.
 *
 * Вести эти две вершины в двух независимых реестрах нельзя: реестры описывают
 * один и тот же порядок и расходятся молча — достаточно оверлея, который
 * зарегистрировался в одном и забыл про другой.
 *
 * Фокус-ловушку стек не реализует — у модальных оверлеев пакета её даёт
 * `Dialog` из HeadlessUI. Стек решает то, чего HeadlessUI не может: он видит
 * слои из **разных деревьев рендера** (диалоги `useDialogService` монтируются
 * отдельным `render()` в `body`), где каждый `<Dialog>` считает себя верхним.
 */

export interface OverlayLayer {
  /** Уникальный id зарегистрированного слоя. */
  id: number
  /**
   * Модальный слой: блокирует страницу и участвует в вычислении `inert`.
   * Немодальные (поповеры, меню, подсказки) — только в очереди Esc.
   */
  modal: boolean
  /** Закрывать ли слой по Esc (реактивный геттер: `closeOnEsc` и подобные). */
  shouldClose: () => boolean
  /** Закрыть слой. */
  close: () => void
  /** Уведомление «этот модальный слой сейчас верхний». Только для `modal`. */
  setTopmost?: (isTopmost: boolean) => void
}

const stack: OverlayLayer[] = []
let listening = false
let nextId = 1

/** Пересчитывает верхний **модальный** слой и уведомляет все модальные. */
function syncTopmost(): void {
  const modals = stack.filter(layer => layer.modal)
  const top = modals[modals.length - 1]
  for (const layer of modals) layer.setTopmost?.(layer === top)
}

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
  // Capture-фаза опережает собственный window-обработчик Escape у HeadlessUI.
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
export function pushOverlayLayer(layer: Omit<OverlayLayer, 'id'>): number {
  const id = nextId++
  stack.push({ ...layer, id })
  startListening()
  syncTopmost()
  return id
}

/** Снимает слой со стека (при закрытии или размонтировании). */
export function removeOverlayLayer(id: number): void {
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0) stack.splice(index, 1)
  if (stack.length === 0) stopListening()
  syncTopmost()
}

/** Сколько слоёв открыто. Для тестов и диагностики. */
export function overlayStackSize(): number {
  return stack.length
}

/** Тестовая/служебная очистка стека. */
export function resetOverlayStack(): void {
  stack.splice(0, stack.length)
  stopListening()
}
