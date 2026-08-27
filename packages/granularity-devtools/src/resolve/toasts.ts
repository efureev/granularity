/**
 * Очередь тостов.
 *
 * В DOM видны только показанные — `GrToaster` режет их своим `maxVisible`, а
 * само состояние держит ещё и потолок очереди `maxToasts`, сверх которого
 * старые тосты вытесняются. Из браузера этого не видно вовсе: там просто
 * «тостов стало меньше, чем я слал».
 */

export interface ToastLike {
  id: string
  title: string
  tone: string
  timeoutMs: number
  dedupeKey?: string
}

export interface ToastTimerLike {
  /** Сколько осталось до автозакрытия на момент последней паузы. */
  remaining: number
}

export interface ToastStateLike {
  toasts: ToastLike[]
  timers: Map<string, ToastTimerLike>
  maxToasts: number
}

export interface ToastQueueEntry {
  id: string
  title: string
  tone: string
  /** `0` — тост без автозакрытия: висит, пока его не закроют. */
  timeoutMs: number
  /** Остаток таймера; `null` — таймера нет (автозакрытие выключено или тост на паузе без замера). */
  remainingMs: number | null
  dedupeKey: string | null
}

export interface ToastQueue {
  entries: ToastQueueEntry[]
  /** Живых тостов сейчас. */
  size: number
  /** Потолок очереди: сверх него самые старые вытесняются. */
  limit: number
  /**
   * Очередь упёрлась в потолок — следующий тост вытеснит самый старый.
   * Точного счётчика вытесненных в состоянии нет, и заводить его в ядре ради
   * панели незачем: сам факт «мы у потолка» отвечает на вопрос «куда делись
   * мои уведомления».
   */
  atLimit: boolean
}

export function toastQueue(state: ToastStateLike | undefined): ToastQueue | null {
  if (!state)
    return null

  const entries = state.toasts.map(toast => ({
    id: toast.id,
    title: toast.title,
    tone: toast.tone,
    timeoutMs: toast.timeoutMs,
    remainingMs: state.timers.get(toast.id)?.remaining ?? null,
    dedupeKey: toast.dedupeKey ?? null,
  }))

  return {
    entries,
    size: entries.length,
    limit: state.maxToasts,
    atLimit: entries.length >= state.maxToasts,
  }
}
