import { computed, hasInjectionContext, inject, reactive } from 'vue'
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
  /**
   * Схлопывать повтор: `push` с уже занятым ключом обновляет **живой** тост
   * и перезапускает его автозакрытие вместо того, чтобы завести второй.
   *
   * Ключ действует только пока тост на экране. Это не то же самое, что помнить
   * последнее показанное: повтор действия с тем же текстом обязан показаться
   * снова, иначе второе «Сохранено» пропадёт молча.
   */
  dedupeKey?: string
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
  /** Ключ схлопывания повторов, если тост создан с ним. */
  dedupeKey?: string
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
// Где-то на странице установлен плагин: фолбэк в синглтон для такого приложения —
// почти наверняка ошибка вызова, а не осознанный выбор.
let appScopedToastProvided = false
let contextFallbackWarned = false

export const granularityToastPlugin = {
  install(app: App, options: GranularityToastPluginOptions = {}) {
    appScopedToastProvided = true
    app.provide(GRANULARITY_TOAST_STATE, createToastState(options.maxToasts))
  },
}

// Ленивый модульный синглтон — канонический фолбэк для простых SPA без плагина.
let moduleToastState: ToastState | null = null

/** Сброс dev-предупреждения о фолбэке. Внутреннее API — нужно тестам. */
export function resetToastContextWarning(): void {
  contextFallbackWarned = false
}

function resolveToastState(): ToastState {
  // App-scoped состояние (provide через плагин): setup-контекст ИЛИ
  // `app.runWithContext(() => useToast())` — `hasInjectionContext` покрывает оба,
  // поэтому вызов из router guard / интерцептора достаёт состояние приложения.
  if (hasInjectionContext()) {
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

  // Дедуп и текст — инлайном под dev-гардом: бандлер потребителя сворачивает
  // условие в `false` и выкидывает сообщение из продакшн-сборки.
  if (
    appScopedToastProvided && !contextFallbackWarned
    && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
  ) {
    contextFallbackWarned = true
    console.warn(
      '[granularity] useToast() вызван вне setup/inject-контекста: app-scoped состояние '
      + 'granularityToastPlugin недоступно, использован модульный синглтон — эти тосты не попадут '
      + 'в GrToaster приложения. Оберните вызов: app.runWithContext(() => useToast()).',
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
    const timeout = input.timeoutMs ?? DEFAULT_TIMEOUT_MS

    // Схлопывание ищет тост только среди живых. Помнить последний показанный
    // ключ нельзя: тогда повтор того же действия («Сохранено» второй раз)
    // не показался бы вообще — тост уже ушёл, а ключ ещё занят.
    if (input.dedupeKey !== undefined) {
      const existing = state.toasts.find(item => item.dedupeKey === input.dedupeKey)
      if (existing) {
        // Замена целиком, а не патч: повторный `push` — это законченное
        // высказывание, и `message` от прошлого раза донашивать он не должен.
        applyStage(existing.id, { ...input, tone: input.tone ?? 'info', timeoutMs: timeout })
        return existing.id
      }
    }

    const id = makeId()
    const toast: Toast = {
      id,
      title: input.title,
      message: input.message,
      tone: input.tone ?? 'info',
      timeoutMs: timeout > 0 ? timeout : 0,
      action: input.action,
      actions: input.actions,
      dedupeKey: input.dedupeKey,
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
  //
  // Это флуд-защита уровня состояния, а не очередь показа (`GrToaster` держит
  // видимыми старейших): при переполнении потолка вытеснен может быть и тост,
  // который сейчас на экране, — осознанный компромисс.
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

    if (patch.timeoutMs !== undefined)
      toast.timeoutMs = rearmTimer(id, patch.timeoutMs)

    return true
  }

  /** Перезапускает автозакрытие с нового таймаута; `0` и меньше — «навсегда». */
  function rearmTimer(id: string, timeoutMs: number): number {
    clearTimer(id)
    const next = timeoutMs > 0 ? timeoutMs : 0

    if (next > 0) {
      const timer: ToastTimer = { handle: null, remaining: next, startedAt: now() }
      state.timers.set(id, timer)
      armTimer(id, timer)
    }

    return next
  }

  /**
   * Полная замена стадии для `promise()`. В отличие от `update`, поле без
   * значения очищается: успех не должен донашивать `message` и action-кнопки
   * загрузки — патч-семантика оставляла бы их в тосте навсегда.
   */
  function applyStage(id: string, stage: ToastInput & { tone: GrToastTone, timeoutMs: number }): void {
    const toast = state.toasts.find(item => item.id === id)
    if (!toast) return

    toast.title = stage.title
    toast.message = stage.message
    toast.tone = stage.tone
    toast.action = stage.action
    toast.actions = stage.actions
    toast.timeoutMs = rearmTimer(id, stage.timeoutMs)
  }

  /**
   * Один тост на весь жизненный цикл промиса: «загружаем» переписывается в
   * успех или ошибку, а не закрывается ради нового — стек не дёргается.
   *
   * Каждая стадия **заменяет** предыдущую целиком: поле, не заданное в
   * success/error, очищается, а не наследуется от loading.
   *
   * Возвращает исходный промис и **не глотает отказ**: тост не заменяет
   * обработку ошибки, вызывающий по-прежнему обязан её обработать.
   */
  function promise<T>(input: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> {
    const id = push({ tone: 'info', ...toToastInput(messages.loading), timeoutMs: 0 })

    input.then(
      (value) => {
        const stage = resolveMessage(messages.success, value)
        applyStage(id, { ...stage, tone: stage.tone ?? 'success', timeoutMs: stage.timeoutMs ?? DEFAULT_TIMEOUT_MS })
      },
      (reason: unknown) => {
        const stage = resolveMessage(messages.error, reason)
        applyStage(id, { ...stage, tone: stage.tone ?? 'danger', timeoutMs: stage.timeoutMs ?? DEFAULT_TIMEOUT_MS })
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
