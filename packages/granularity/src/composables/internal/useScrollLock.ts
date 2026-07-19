/**
 * useScrollLock — общий **reference-counted** lock скролла `<body>` для оверлеев
 * (GrModal, GrDrawer, GrImageViewer).
 *
 * Зачем счётчик: раньше каждый оверлей хранил `savedBodyOverflow` per-instance и
 * восстанавливал `overflow` при СВОЁМ закрытии. Если открыты A, затем B, и первым
 * закрывают A — body получал `overflow: ''` при ещё открытой B (баг LIFO).
 * Здесь состояние `<body>` сохраняется один раз (при переходе счётчика 0→1) и
 * восстанавливается только когда закрыт последний оверлей (счётчик 1→0).
 *
 * Плюс компенсация ширины скроллбара: при `overflow: hidden` скроллбар исчезает и
 * контент дёргается вправо — добавляем `padding-right` на его ширину.
 */

interface SavedBodyStyle {
  overflow: string
  paddingRight: string
}

let lockCount = 0
let saved: SavedBodyStyle | null = null

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

function applyLock(): void {
  const body = document.body
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }

  // Ширину скроллбара считаем ДО `overflow: hidden` (после — `clientWidth` меняется).
  const scrollbarWidth = getScrollbarWidth()

  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
  }
}

function releaseLock(): void {
  if (!saved) return
  document.body.style.overflow = saved.overflow
  document.body.style.paddingRight = saved.paddingRight
  saved = null
}

/**
 * Возвращает пару `lock`/`unlock`, идемпотентную **в пределах одного инстанса**
 * (повторный `lock()` без `unlock()` не увеличивает глобальный счётчик дважды).
 * Глобальный счётчик разделяется всеми оверлеями.
 */
export function useScrollLock() {
  const isClient = typeof window !== 'undefined'
  let held = false

  function lock(): void {
    if (!isClient || held) return
    held = true
    lockCount += 1
    if (lockCount === 1) applyLock()
  }

  function unlock(): void {
    if (!isClient || !held) return
    held = false
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) releaseLock()
  }

  return { lock, unlock }
}

/** Тестовая/служебная очистка глобального состояния. */
export function resetScrollLock(): void {
  lockCount = 0
  if (typeof document !== 'undefined') releaseLock()
  saved = null
}
