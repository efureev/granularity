import { computed, reactive } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export type ToastInput = {
  title: string
  message?: string
  variant?: ToastVariant
  timeoutMs?: number
}

export type Toast = {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

const toasts = reactive<Toast[]>([])

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
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

    const timeout = input.timeoutMs ?? 3500
    if (timeout > 0) {
      window.setTimeout(() => {
        dismiss(id)
      }, timeout)
    }

    return id
  }

  function dismiss(id: string): void {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index >= 0)
      toasts.splice(index, 1)
  }

  function clear(): void {
    toasts.splice(0, toasts.length)
  }

  return {
    list,
    push,
    dismiss,
    clear,
  }
}