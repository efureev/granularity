import { computed, getCurrentInstance, inject, reactive } from 'vue'
import type { App, InjectionKey } from 'vue'

import type { GrButtonSize, GrButtonVariant } from '../components/GrButton/grButtonStyles'
import type { GrTone } from '../components/shared/tones'

export type GrToastTone = GrTone

/**
 * Опциональная action-кнопка тоста: `label` — текст, `onClick` — обработчик.
 * По клику вызывается `onClick`, затем тост закрывается (если `dismissOnClick`
 * не установлен в `false`). `size`/`variant` настраивают вид кнопки.
 */
export type ToastAction = {
  label: string
  onClick: () => void
  /** Закрывать ли тост после клика по действию. По умолчанию `true`. */
  dismissOnClick?: boolean
  /** Размер кнопки действия. По умолчанию `sm`. */
  size?: GrButtonSize
  /** Вариант кнопки действия. По умолчанию `outline`. */
  variant?: GrButtonVariant
}

export type ToastInput = {
  title: string
  message?: string
  tone?: GrToastTone
  /**
   * Автозакрытие через N мс. `0` или отрицательное значение — «навсегда»
   * (до явного вызова `dismiss(id)` / `clear()`). По умолчанию: `3500`.
   */
  timeoutMs?: number
  /** Одна action-кнопка в теле тоста (шорткат для `actions: [action]`). */
  action?: ToastAction
  /** Несколько action-кнопок в теле тоста. Рендерятся после `action`. */
  actions?: ToastAction[]
}

/**
 * Сообщения для `promise`. Строка — шорткат для `{ title }`; функция получает
 * результат промиса (или причину отказа), чтобы подставить его в текст.
 */
export type ToastPromiseMessages<T> = {
  loading: string | ToastInput
  success: string | ToastInput | ((value: T) => string | ToastInput)
  error: string | ToastInput | ((reason: unknown) => string | ToastInput)
}

export type Toast = {
  id: string
  title: string
  message?: string
  tone: GrToastTone
  /** Исходный таймаут автозакрытия, мс (`0` — без автозакрытия). Нужен для progress-бара. */
  timeoutMs: number
  /** Одна action-кнопка в теле тоста. */
  action?: ToastAction
  /** Несколько action-кнопок в теле тоста. */
  actions?: ToastAction[]
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
  /** Потолок очереди: сверх него самые старые тосты вытесняются. */
  maxToasts: number
}

/**
 * Потолок очереди по умолчанию. `maxVisible` у `GrToaster` режет только видимые,
 * поэтому без него поток событий (переподключение сокета, цикл ошибок) копил бы
 * очередь и вываливал её на пользователя, когда стек освободится.
 */
const DEFAULT_MAX_TOASTS = 20

export type GranularityToastPluginOptions = {
  /** Потолок очереди. По умолчанию `20`. */
  maxToasts?: number
}

function createToastState(maxToasts = DEFAULT_MAX_TOASTS): ToastState {
  return {
    toasts: reactive<Toast[]>([]),
    timers: new Map<string, ToastTimer>(),
    maxToasts: Math.max(1, Math.trunc(maxToasts)),
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
 * app.use(granularityToastPlugin, { maxToasts: 50 })
 * ```
 */
export const granularityToastPlugin = {
  install(app: App, options: GranularityToastPluginOptions = {}) {
    app.provide(GRANULARITY_TOAST_STATE, createToastState(options.maxToasts))
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
      action: input.action,
      actions: input.actions,
    }

    state.toasts.unshift(toast)
    trimQueue()

    if (toast.timeoutMs > 0) {
      const timer: ToastTimer = { handle: null, remaining: toast.timeoutMs, startedAt: now() }
      state.timers.set(id, timer)
      armTimer(id, timer)
    }

    return id
  }

  // Вытесняем с хвоста — там самые старые: при потоке событий устаревшее
  // уведомление менее ценно, чем свежее. Таймеры снимаем, иначе остались бы
  // висящие `setTimeout` на тосты, которых больше нет.
  function trimQueue(): void {
    while (state.toasts.length > state.maxToasts) {
      const dropped = state.toasts.pop()
      if (dropped)
        clearTimer(dropped.id)
    }
  }

  /**
   * Меняет показанный тост на месте. `timeoutMs` в патче перезапускает таймер
   * (`0` — снова «навсегда»), поэтому «вечный» loading может стать
   * самозакрывающимся success.
   *
   * Возвращает `false`, если тоста уже нет: пользователь мог закрыть его руками,
   * и воскрешать его нельзя.
   */
  function update(id: string, patch: Partial<ToastInput>): boolean {
    const toast = state.toasts.find(item => item.id === id)
    if (!toast) return false

    if (patch.title !== undefined) toast.title = patch.title
    if (patch.message !== undefined) toast.message = patch.message
    if (patch.tone !== undefined) toast.tone = patch.tone
    if (patch.action !== undefined) toast.action = patch.action
    if (patch.actions !== undefined) toast.actions = patch.actions

    if (patch.timeoutMs !== undefined) {
      clearTimer(id)
      toast.timeoutMs = patch.timeoutMs > 0 ? patch.timeoutMs : 0

      if (toast.timeoutMs > 0) {
        const timer: ToastTimer = { handle: null, remaining: toast.timeoutMs, startedAt: now() }
        state.timers.set(id, timer)
        armTimer(id, timer)
      }
    }

    return true
  }

  /**
   * Один тост на весь жизненный цикл промиса: «загружаем» переписывается в
   * успех или ошибку, а не закрывается ради нового — стек не дёргается.
   *
   * Возвращает исходный промис и **не глотает отказ**: тост не заменяет
   * обработку ошибки, вызывающий по-прежнему обязан её обработать.
   */
  function promise<T>(input: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> {
    const id = push({ tone: 'info', ...toToastInput(messages.loading), timeoutMs: 0 })

    input.then(
      (value) => {
        update(id, { tone: 'success', timeoutMs: DEFAULT_TIMEOUT_MS, ...resolveMessage(messages.success, value) })
      },
      (reason: unknown) => {
        update(id, { tone: 'danger', timeoutMs: DEFAULT_TIMEOUT_MS, ...resolveMessage(messages.error, reason) })
      },
    )

    return input
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
    update,
    promise,
    dismiss,
    clear,
    pause,
    resume,
  }
}

function toToastInput(message: string | ToastInput): ToastInput {
  return typeof message === 'string' ? { title: message } : message
}

function resolveMessage<T>(
  message: string | ToastInput | ((value: T) => string | ToastInput),
  value: T,
): ToastInput {
  return toToastInput(typeof message === 'function' ? message(value) : message)
}
