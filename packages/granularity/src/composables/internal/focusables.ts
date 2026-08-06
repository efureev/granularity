/**
 * Что пакет считает фокусируемым.
 *
 * Один источник правды на ловушку фокуса, roving-навигацию и «первый элемент
 * панели». До него каждый компонент собирал свой селектор: у `GrDropdown` в
 * список не попадали `select` и `textarea`, а фильтр видимости стоял на
 * `offsetParent !== null` — он врёт на `position: fixed` (у таких элементов
 * `offsetParent` всегда `null`), то есть на панелях самих оверлеев.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

/**
 * Видимость.
 *
 * В браузере спрашиваем `checkVisibility()` — он единственный учитывает скрытых
 * предков, `content-visibility` и `display: contents`. В jsdom его нет и
 * раскладки тоже нет, поэтому там остаётся проверка собственных стилей: этого
 * достаточно, чтобы тесты видели ту же логику, а не пустой список.
 */
function isVisible(element: HTMLElement): boolean {
  if (element.hidden) return false

  if (typeof element.checkVisibility === 'function')
    return element.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })

  const style = element.ownerDocument.defaultView?.getComputedStyle(element)
  if (!style) return true
  return style.display !== 'none' && style.visibility !== 'hidden'
}

/** Элемент внутри `inert`-поддерева не фокусируем — браузер его не отдаёт. */
function isInert(element: HTMLElement): boolean {
  return element.closest('[inert]') !== null
}

export function isFocusable(element: HTMLElement): boolean {
  if (!element.matches(FOCUSABLE_SELECTOR)) return false
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  return !isInert(element) && isVisible(element)
}

/** Участвует ли элемент в таб-порядке (`tabindex="-1"` — нет). */
export function isTabbable(element: HTMLElement): boolean {
  if (!isFocusable(element)) return false
  return Number.parseInt(element.getAttribute('tabindex') ?? '0', 10) >= 0
}

/**
 * Фокусируемые внутри корня, в порядке документа.
 *
 * `tabbableOnly` (по умолчанию) оставляет только участников таб-порядка — это
 * то, что нужно циклу Tab. Полный список нужен «первому фокусируемому» при
 * открытии: панель с `tabindex="-1"` фокусируется программно.
 */
export function getFocusableElements(
  root: HTMLElement | null | undefined,
  options: { tabbableOnly?: boolean } = {},
): HTMLElement[] {
  if (!root) return []

  const tabbableOnly = options.tabbableOnly ?? true
  const matches = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

  return matches.filter(element => (tabbableOnly ? isTabbable(element) : isFocusable(element)))
}

/**
 * Фокусируемые сразу в нескольких корнях, в порядке документа.
 *
 * Нужен ловушке: панель селекта, открытого внутри модалки, телепортирована в
 * `body` и лежит вне DOM-поддерева окна, но для пользователя это продолжение
 * того же слоя.
 */
export function getFocusableElementsIn(roots: (HTMLElement | null | undefined)[]): HTMLElement[] {
  const unique = new Set<HTMLElement>()

  for (const root of roots) {
    for (const element of getFocusableElements(root)) unique.add(element)
  }

  return Array.from(unique).sort((left, right) => {
    const position = left.compareDocumentPosition(right)
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })
}
