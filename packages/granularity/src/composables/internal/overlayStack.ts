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
 *  - **высота** → `openModalCount()` поднимает floating-панель над окном, из
 *    которого её открыли: телепортированная панель лежит рядом с корнем окна,
 *    и статический `z-index` дропдауна оставлял её под ним.
 *
 * Вести эти две вершины в двух независимых реестрах нельзя: реестры описывают
 * один и тот же порядок и расходятся молча — достаточно оверлея, который
 * зарегистрировался в одном и забыл про другой.
 *
 * Ловушку фокуса стек не реализует сам, но питает её (`useFocusTrap`): он
 * видит слои из **разных деревьев рендера** (диалоги `useDialogService`
 * монтируются отдельным `render()` в `body`) и знает их корни.
 */

import { isComposingEvent } from '../../internal/keyboard'

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
  /**
   * Позиция слоя среди модальных, от нуля. Только для `modal`.
   *
   * От неё считается высота: у всех модальных слоёв один токен
   * (`--gr-z-modal`), и без этой прибавки порядок отрисовки решал бы порядок
   * узлов в портале, а он задаётся **созданием** телепорта, а не открытием
   * слоя. Диалог, объявленный в шаблоне статически, вставал бы под окном,
   * открытым позже, — и получал бы `inert` от стека, оставаясь видимым.
   */
  setDepth?: (depth: number) => void
  /**
   * Корень слоя. Ловушка фокуса нижнего слоя обязана считать его своим:
   * панель селекта, открытого внутри модалки, телепортирована в `body` и лежит
   * вне DOM-поддерева окна, но для пользователя это тот же слой.
   */
  root?: () => HTMLElement | null
}

const stack: OverlayLayer[] = []
let listening = false
let nextId = 1

/**
 * Пересчитывает состояние модальных слоёв: кто верхний и на какой высоте.
 *
 * Обе величины выводятся из одного порядка, поэтому и считаются в одном месте:
 * разъедься они — «верхний» для `inert` и «верхний» для отрисовки перестали бы
 * совпадать, а это ровно тот дефект, из-за которого высота и заведена.
 */
function syncModalLayers(): void {
  const modals = stack.filter(layer => layer.modal)
  const top = modals[modals.length - 1]

  modals.forEach((layer, index) => {
    layer.setTopmost?.(layer === top)
    layer.setDepth?.(index)
  })
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape')
    return
  // Esc во время IME-композиции отменяет её, а не закрывает слой.
  if (isComposingEvent(event))
    return
  if (stack.length === 0)
    return

  const top = stack[stack.length - 1]

  // Гасим всегда, даже если верхний слой не закрывается по Esc: иначе нажатие
  // «провалится» на слой ниже и закроет не то, что видит пользователь.
  event.preventDefault()
  event.stopPropagation()
  if (typeof event.stopImmediatePropagation === 'function')
    event.stopImmediatePropagation()

  if (top.shouldClose())
    top.close()
}

function startListening(): void {
  if (listening)
    return
  if (typeof window === 'undefined')
    return
  // Capture-фаза опережает любые локальные обработчики: Esc обязан достаться
  // верхнему слою, а не тому, кто первым подписался.
  window.addEventListener('keydown', handleKeydown, true)
  listening = true
}

function stopListening(): void {
  if (!listening)
    return
  if (typeof window === 'undefined')
    return
  window.removeEventListener('keydown', handleKeydown, true)
  listening = false
}

/** Регистрирует слой как верхний и возвращает его id. */
export function pushOverlayLayer(layer: Omit<OverlayLayer, 'id'>): number {
  const id = nextId++
  stack.push({ ...layer, id })
  startListening()
  syncModalLayers()
  return id
}

/** Снимает слой со стека (при закрытии или размонтировании). */
export function removeOverlayLayer(id: number): void {
  const index = stack.findIndex(item => item.id === id)
  if (index >= 0)
    stack.splice(index, 1)
  if (stack.length === 0)
    stopListening()
  syncModalLayers()
}

/**
 * Корни слоёв, открытых **поверх** данного.
 *
 * Ими ловушка фокуса дополняет свой контейнер: всё, что открыто изнутри слоя
 * (панель селекта, меню, подсказка), лежит в `body` отдельным поддеревом, и
 * без этого списка ловушка утаскивала бы из него фокус обратно в окно.
 */
export function layerRootsAbove(id: number): HTMLElement[] {
  const index = stack.findIndex(layer => layer.id === id)
  if (index < 0)
    return []

  return stack
    .slice(index + 1)
    .map(layer => layer.root?.() ?? null)
    .filter((root): root is HTMLElement => root !== null)
}

/** Корни всех зарегистрированных слоёв. */
export function allLayerRoots(): HTMLElement[] {
  return stack
    .map(layer => layer.root?.() ?? null)
    .filter((root): root is HTMLElement => root !== null)
}

/** Сколько слоёв открыто. Для тестов и диагностики. */
export function overlayStackSize(): number {
  return stack.length
}

/**
 * Сколько **модальных** слоёв открыто прямо сейчас.
 *
 * Читает `useFloating`, когда считает высоту панели: панель телепортирована в
 * общий портал и лежит рядом с корнем окна, а не внутри него, поэтому свой
 * стек-контекст её не спасает — высоту приходится брать из порядка слоёв.
 */
export function openModalCount(): number {
  return stack.reduce((count, layer) => count + (layer.modal ? 1 : 0), 0)
}

/**
 * Высота слоя, лежащего внутри открытого окна.
 *
 * Панель телепортирована в общий портал и становится **соседом** корня окна, а
 * не его потомком: собственный stacking-контекст окна её не накрывает, и
 * статический `--gr-z-dropdown` (1000) оставлял её под окном (1100). Слагаемое —
 * число модальных слоёв, поэтому панель встаёт над самым верхним из них, а
 * полноэкранная загрузка (1150) и тосты (1200) остаются сверху.
 *
 * Обратный случай — «поповер снаружи не должен перекрывать окно» — не страдает:
 * пока окно открыто, страница под ним в `inert`, и открыть там поповер нечем.
 */
export function floatingLayerZIndex(zIndexVar: string): string {
  const modals = openModalCount()

  return modals > 0 ? `calc(var(--gr-z-modal) + ${modals})` : `var(${zIndexVar})`
}

/**
 * Высота самого модального слоя: базовый токен плюс его позиция в стеке.
 *
 * Нулевая глубина оставляет чистый `var(...)` — у единственного окна на экране
 * в стилях не появляется лишней арифметики.
 */
export function modalLayerZIndex(depth: number, zIndexVar = '--gr-z-modal'): string {
  return depth > 0 ? `calc(var(${zIndexVar}) + ${depth})` : `var(${zIndexVar})`
}

/** Тестовая/служебная очистка стека. */
export function resetOverlayStack(): void {
  stack.splice(0, stack.length)
  stopListening()
}
