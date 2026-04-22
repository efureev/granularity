import { computed, reactive } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export type ToastInput = {
  title: string
  message?: string
  variant?: ToastVariant
  /**
   * Автозакрытие через N мс. `0` или отрицательное значение — «навсегда»
   * (до явного вызова `dismiss(id)` / `clear()`). По умолчанию: `3500`.
   */
  timeoutMs?: number
}

export type Toast = {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

// Модульный синглтон состояния: один источник истины для всех `DsToaster`
// в приложении. Подразумевается один активный `DsToaster` на корень.
const toasts = reactive<Toast[]>([])

// Таймеры авто-дисмисса по id — чтобы при раннем `dismiss()` / `clear()`
// не оставлять «висящие» setTimeout'ы и не будить мёртвый tab.
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const DEFAULT_TIMEOUT_MS = 3500

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function clearTimer(id: string): void {
  const handle = timers.get(id)
  if (handle !== undefined) {
    clearTimeout(handle)
    timers.delete(id)
  }
}

export function useToast() {
  const list = computed(() => toasts)

  function push(input: ToastInput): string {
    const id = makeId()
    const toast: Toast = {
      id,
      title: input.title,
      message: input.message,
      variant: input.variant ?? 'info',
    }

    toasts.unshift(toast)

    const timeout = input.timeoutMs ?? DEFAULT_TIMEOUT_MS
    if (timeout > 0 && typeof window !== 'undefined') {
      const handle = window.setTimeout(() => {
        timers.delete(id)
        dismiss(id)
      }, timeout)
      timers.set(id, handle)
    }

    return id
  }

  function dismiss(id: string): void {
    clearTimer(id)
    const index = toasts.findIndex(toast => toast.id === id)
    if (index >= 0)
      toasts.splice(index, 1)
  }

  function clear(): void {
    for (const id of timers.keys()) clearTimer(id)
    toasts.splice(0, toasts.length)
  }

  return {
    list,
    push,
    dismiss,
    clear,
  }
}
