import type { GrTransferKey } from './transferModel'

/**
 * Алгебра выделения панели: чистая, без DOM и Vue.
 *
 * Мультивыбор со `Shift`-диапазоном в пакете появляется впервые, прецедента API
 * нет — тем важнее, чтобы правила лежали числами в одном месте и проверялись
 * без монтирования.
 */

export type GrTransferSelectMode = 'replace' | 'toggle' | 'range'

export interface GrTransferSelectIntent {
  mode: GrTransferSelectMode
  /** Диапазон объединяется с текущим выделением, а не заменяет его. */
  additive: boolean
}

export interface GrTransferSelection {
  keys: ReadonlySet<GrTransferKey>
  /** Опора диапазона. `Shift` её не двигает — иначе диапазон нельзя растянуть. */
  anchor: GrTransferKey | undefined
}

export const emptySelection: GrTransferSelection = { keys: new Set(), anchor: undefined }

/** `Shift` сильнее `Ctrl`; их сочетание объединяет диапазон с выделением. */
export function selectIntentFrom(
  event: Pick<MouseEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>,
): GrTransferSelectIntent {
  const additive = event.ctrlKey || event.metaKey

  if (event.shiftKey)
    return { mode: 'range', additive }

  return { mode: additive ? 'toggle' : 'replace', additive }
}

function rangeBetween(
  visible: readonly GrTransferKey[],
  from: GrTransferKey,
  to: GrTransferKey,
): GrTransferKey[] {
  const start = visible.indexOf(from)
  const end = visible.indexOf(to)

  if (start < 0 || end < 0)
    return []

  return visible.slice(Math.min(start, end), Math.max(start, end) + 1)
}

/**
 * Новое состояние выделения после жеста по строке `key`.
 *
 * Диапазон считается по **видимому** порядку, а не по каталогу: пользователь
 * растягивает то, что видит, и после фильтра «от сих до сих» обязано значить
 * то же самое.
 */
export function applySelect(
  state: GrTransferSelection,
  key: GrTransferKey,
  intent: GrTransferSelectIntent,
  visible: readonly GrTransferKey[],
  isSelectable: (key: GrTransferKey) => boolean,
): GrTransferSelection {
  if (!isSelectable(key))
    return state

  if (intent.mode === 'range' && state.anchor !== undefined) {
    const range = rangeBetween(visible, state.anchor, key).filter(isSelectable)

    if (range.length > 0) {
      const keys = intent.additive ? new Set(state.keys) : new Set<GrTransferKey>()
      range.forEach(item => keys.add(item))

      // Якорь остаётся прежним: повторный `Shift`-клик обязан растягивать
      // диапазон от той же опоры, а не от предыдущего края.
      return { keys, anchor: state.anchor }
    }
  }

  if (intent.mode === 'toggle') {
    const keys = new Set(state.keys)
    if (keys.has(key))
      keys.delete(key)
    else keys.add(key)

    return { keys, anchor: key }
  }

  return { keys: new Set([key]), anchor: key }
}

/** Всё видимое и выбираемое; уже выбрано всё — снять. */
export function toggleAllVisible(
  state: GrTransferSelection,
  visible: readonly GrTransferKey[],
  isSelectable: (key: GrTransferKey) => boolean,
): GrTransferSelection {
  const selectable = visible.filter(isSelectable)

  if (selectable.length === 0)
    return { keys: new Set(state.keys), anchor: undefined }

  const allSelected = selectable.every(key => state.keys.has(key))

  if (allSelected) {
    const keys = new Set(state.keys)
    selectable.forEach(key => keys.delete(key))

    return { keys, anchor: undefined }
  }

  const keys = new Set(state.keys)
  selectable.forEach(key => keys.add(key))

  return { keys, anchor: undefined }
}

/** Ключи, которых больше нет в панели. Якорь исчез — забываем и его. */
export function pruneSelection(
  state: GrTransferSelection,
  present: readonly GrTransferKey[],
): GrTransferSelection {
  const alive = new Set(present)
  const keys = new Set<GrTransferKey>()

  state.keys.forEach((key) => {
    if (alive.has(key))
      keys.add(key)
  })

  const anchor = state.anchor !== undefined && alive.has(state.anchor) ? state.anchor : undefined

  if (keys.size === state.keys.size && anchor === state.anchor)
    return state

  return { keys, anchor }
}

/** Состояние отметки «выбрать всё видимое» в шапке панели. */
export function allVisibleState(
  state: GrTransferSelection,
  visible: readonly GrTransferKey[],
  isSelectable: (key: GrTransferKey) => boolean,
): 'checked' | 'indeterminate' | 'unchecked' {
  const selectable = visible.filter(isSelectable)
  if (selectable.length === 0)
    return 'unchecked'

  const picked = selectable.filter(key => state.keys.has(key)).length

  if (picked === 0)
    return 'unchecked'

  return picked === selectable.length ? 'checked' : 'indeterminate'
}
