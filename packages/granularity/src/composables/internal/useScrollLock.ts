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
 *
 * Отдельная ветка — iOS Safari: там `overflow: hidden` фон не держит, страница
 * продолжает «резинить» под открытым окном. Лечится тем же, чем лечил
 * HeadlessUI (`handleIOSLocking`): гасим `touchmove` вне скроллящихся областей
 * оверлея и возвращаем позицию прокрутки после снятия лока.
 */

interface SavedBodyStyle {
  overflow: string
  paddingRight: string
  overscrollBehavior: string
}

let lockCount = 0
let saved: SavedBodyStyle | null = null
let savedScrollY = 0
let releaseTouchGuard: (() => void) | null = null

/**
 * iOS определяем по платформе, а не по ширине экрана: лечение специфично для
 * движка, а не для размера. `maxTouchPoints` отличает iPadOS, который со времён
 * 13-й версии представляется десктопным Mac.
 */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iP(?:hone|ad|od)/.test(navigator.platform)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** Прокручиваемая область оверлея — единственное, чему `touchmove` разрешён. */
function isScrollableOverlayArea(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false

  for (let node: Element | null = target; node; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue
    if (node.hasAttribute('data-gr-overlay-root')) return true
  }

  return false
}

function applyTouchGuard(): void {
  if (!isIOS()) return

  const onTouchMove = (event: TouchEvent): void => {
    // Внутри оверлея скролл законен (длинное окно, лента изображений), а всё
    // остальное — это и есть фон, который лок обязан держать.
    if (isScrollableOverlayArea(event.target)) return
    if (event.cancelable) event.preventDefault()
  }

  document.addEventListener('touchmove', onTouchMove, { passive: false })
  releaseTouchGuard = () => document.removeEventListener('touchmove', onTouchMove)
}

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

function applyLock(): void {
  const body = document.body
  saved = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    overscrollBehavior: body.style.overscrollBehavior,
  }
  savedScrollY = window.scrollY

  // Ширину скроллбара считаем ДО `overflow: hidden` (после — `clientWidth` меняется).
  const scrollbarWidth = getScrollbarWidth()

  body.style.overflow = 'hidden'
  // Прокрутка, «доехавшая» до края внутри окна, не должна продолжаться фоном.
  body.style.overscrollBehavior = 'contain'
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
  }

  applyTouchGuard()
}

function releaseLock(): void {
  releaseTouchGuard?.()
  releaseTouchGuard = null

  if (!saved) return
  document.body.style.overflow = saved.overflow
  document.body.style.paddingRight = saved.paddingRight
  document.body.style.overscrollBehavior = saved.overscrollBehavior
  saved = null

  // iOS сдвигает страницу, пока фон заблокирован; возвращаем её на место.
  if (isIOS() && window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY)
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
