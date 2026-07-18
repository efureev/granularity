import { computed, getCurrentInstance, inject, reactive } from 'vue'
import type { App, InjectionKey } from 'vue'

import type { GrTone } from '../components/shared/tones'

export type GrToastTone = GrTone

export type ToastInput = {
  title: string
  message?: string
  tone?: GrToastTone
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
  tone: GrToastTone
  /** Исходный таймаут автозакрытия, мс (`0` — без автозакрытия). Нужен для progress-бара. */
  timeoutMs: number
}

const DEFAULT_TIMEOUT_MS = 3500
const IS_SERVER = typeof window === 'undefined'

// Метаданные таймера автозакрытия с поддержкой pause/resume (WCAG 2.2.1: под
// курсором/фокусом отсчёт должен останавливаться).
type ToastTimer = {
  handle: number | null
  /** Сколько мс осталось до автозакрытия на момент последней паузы/старта. */
  remaining: number
  /** `performance.now()` момента запуска текущего отрезка (для вычисления остатка). */
  startedAt: number
}

export type ToastState = {
  toasts: Toast[]
  timers: Map<string, ToastTimer>
}

function createToastState(): ToastState {
  return {
    toasts: reactive<Toast[]>([]),
    timers: new Map<string, ToastTimer>(),
  }
}

/** Ключ provide/inject для app-scoped состояния тостов (устанавливает плагин ниже). */
export const GRANULARITY_TOAST_STATE: InjectionKey<ToastState> = Symbol.for('@feugene/granularity/toast-state')

/**
 * Vue-плагин: даёт каждому приложению собственное изолированное состояние тостов
 * через `app.provide`. Обязателен для (а) нескольких Vue-приложений на одной
 * странице (микрофронтенды — иначе делят один стек тостов) и (б) SSR (иначе
 * модульное состояние течёт между запросами).
 *
 * ```ts
 * app.use(granularityToastPlugin)
 * ```
 */
export const granularityToastPlugin = {
  install(app: App) {
    app.provide(GRANULARITY_TOAST_STATE, createToastState())
  },
}

// Ленивый модульный синглтон — канонический фолбэк для простых SPA без плагина.
let moduleToastState: ToastState | null = null

function resolveToastState(): ToastState {
  // App-scoped состояние (provide через плагин) доступно только в setup-контексте.
  if (getCurrentInstance()) {
    const provided = inject(GRANULARITY_TOAST_STATE, null)
    if (provided) return provided
  }

  // В SSR модульный фолбэк запрещён: одно mutable-состояние на модуль утекало бы
  // между запросами. Требуем установленный плагин (app.provide).
  if (IS_SERVER) {
    throw new Error(
      '[granularity] useToast requires `app.use(granularityToastPlugin)` during SSR — '
      + 'the module-singleton fallback is disabled server-side to avoid state leaking between requests.',
    )
  }

  if (!moduleToastState)
    moduleToastState = createToastState()

  return moduleToastState
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useToast() {
  const state = resolveToastState()
  const list = computed(() => state.toasts)

  function armTimer(id: string, timer: ToastTimer): void {
    if (timer.remaining <= 0 || typeof window === 'undefined') return
    timer.startedAt = now()
    timer.handle = window.setTimeout(() => {
      state.timers.delete(id)
      dismiss(id)
    }, timer.remaining)
  }

  function clearTimer(id: string): void {
    const timer = state.timers.get(id)
    if (timer?.handle != null) {
      clearTimeout(timer.handle)
      timer.handle = null
    }
    state.timers.delete(id)
  }

  function push(input: ToastInput): string {
    const id = makeId()
    const timeout = input.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const toast: Toast = {
      id,
      title: input.title,
      message: input.message,
      tone: input.tone ?? 'info',
      timeoutMs: timeout > 0 ? timeout : 0,
    }

    state.toasts.unshift(toast)

    if (toast.timeoutMs > 0) {
      const timer: ToastTimer = { handle: null, remaining: toast.timeoutMs, startedAt: now() }
      state.timers.set(id, timer)
      armTimer(id, timer)
    }

    return id
  }

  /** Останавливает отсчёт автозакрытия, сохраняя остаток (идемпотентно). */
  function pause(id: string): void {
    const timer = state.timers.get(id)
    if (!timer || timer.handle == null) return

    clearTimeout(timer.handle)
    timer.handle = null
    timer.remaining = Math.max(0, timer.remaining - (now() - timer.startedAt))
  }

  /** Возобновляет отсчёт с сохранённого остатка (идемпотентно). */
  function resume(id: string): void {
    const timer = state.timers.get(id)
    if (!timer || timer.handle != null) return

    armTimer(id, timer)
  }

  function dismiss(id: string): void {
    clearTimer(id)
    const index = state.toasts.findIndex(toast => toast.id === id)
    if (index >= 0)
      state.toasts.splice(index, 1)
  }

  function clear(): void {
    for (const id of [...state.timers.keys()]) clearTimer(id)
    state.toasts.splice(0, state.toasts.length)
  }

  return {
    list,
    push,
    dismiss,
    clear,
    pause,
    resume,
  }
}
