/**
 * Клиент dev-канала ядра (`__GR_DEV_HOOK__`).
 *
 * Типы событий здесь — **копия** внутреннего контракта ядра, а не импорт: канал
 * живёт в `internal/`, публичного subpath у него нет и не должно быть. Поэтому
 * пакет объявляет peer на ядро с точным полом — расхождение версий ловится
 * установкой, а не молчаливым несовпадением формы события.
 */

export interface GrLayerFocus {
  inside: boolean
  willRestore: boolean
  restoreTo: string | null
}

export interface GrOverlaySnapshot {
  id: number
  owner: string | null
  focus: GrLayerFocus | null
  modal: boolean
  topmostForEscape: boolean
  inert: boolean
  depth: number | null
  closesOnEscape: boolean
}

export type GrDevEvent
  = | { type: 'overlay:sync', layers: GrOverlaySnapshot[] }
    | { type: 'overlay:push', id: number, modal: boolean, owner: string | null }
    | { type: 'overlay:remove', id: number }
    | { type: 'overlay:escape', id: number, closed: boolean }

interface GrDevHook {
  events: GrDevEvent[]
  listeners: Set<(event: GrDevEvent) => void>
  /** Свежий снимок стека: часть состояния (фокус) меняется без событий. */
  readLayers?: () => GrOverlaySnapshot[]
}

type GlobalWithDevHook = typeof globalThis & { __GR_DEV_HOOK__?: GrDevHook }

/**
 * Хук создаёт та сторона, которая пришла первой: порядок «панель или ядро» не
 * определён — приложение может смонтировать оверлей раньше, чем выполнится
 * `app.use()`. Отсюда и форма хука: голые поля, которые умеет создать любой.
 */
function ensureHook(): GrDevHook {
  const target = globalThis as GlobalWithDevHook
  const existing = target.__GR_DEV_HOOK__
  if (existing)
    return existing

  const hook: GrDevHook = { events: [], listeners: new Set() }
  target.__GR_DEV_HOOK__ = hook
  return hook
}

/**
 * Подписка на канал. Сначала отдаёт то, что ядро успело накопить до подключения
 * панели, — иначе открытая до этого модалка была бы панели не видна.
 */
/**
 * Картина стека на «сейчас», а не на момент последнего события.
 *
 * Фокус уходит из слоя от обычного клика, и события стека при этом не
 * происходит вовсе — по одной ленте событий панель показывала бы устаревшее.
 * `null` означает, что ядро читалку не предоставило: старая версия или слоёв
 * не было вовсе.
 */
export function readGrOverlayLayers(): GrOverlaySnapshot[] | null {
  return (globalThis as GlobalWithDevHook).__GR_DEV_HOOK__?.readLayers?.() ?? null
}

export function subscribeToGrDevEvents(listener: (event: GrDevEvent) => void): () => void {
  const hook = ensureHook()

  for (const event of hook.events)
    listener(event)

  hook.listeners.add(listener)
  return () => hook.listeners.delete(listener)
}
