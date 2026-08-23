import { createVNode, getCurrentInstance, inject, markRaw, render } from 'vue'
import type { App, AppContext, InjectionKey } from 'vue'

import { ensurePortalRoot } from '../../composables/internal/portalRoot'
import GrDialogServiceHost from './GrDialogServiceHost.vue'
import { useGrConfig } from '../GrConfigProvider/context'
import { resolveGranularityI18n } from '../../internal/granularityI18n'
import {
  createDialogServiceState,
  enqueueDialogRequest,
  makeDialogId,
  settleDialogRequest,
} from './store'
import type { CapturedDialogContext, DialogRequest, DialogServiceState } from './store'
import type {
  DialogAlertOptions,
  DialogBaseOptions,
  DialogConfirmOptions,
  DialogKind,
  DialogOnConfirm,
  DialogPromise,
  DialogPromptOptions,
  DialogResult,
  DialogService,
  DialogServiceDefaults,
} from './types'

/**
 * `useDialogService` — императивный сервис диалогов (в духе Element Plus
 * `ElMessageBox`). Позволяет вызывать `confirm`/`alert`/`prompt` из `<script>`
 * или `.ts` без вставки компонента в шаблон.
 *
 * Поверх существующих `GrConfirmDialog`/`GrPromptDialog`: лениво монтирует
 * единый хост (`GrDialogServiceHost`) в `document.body`, наследуя контекст
 * приложения (i18n / тема / `granular-provider`).
 */

/** Ключ provide/inject для app-scoped состояния сервиса (устанавливает плагин ниже). */
export const GRANULARITY_DIALOG_SERVICE_STATE: InjectionKey<DialogServiceState>
  = Symbol.for('@feugene/granularity/dialog-service-state')

/**
 * Инстансы, заведённые плагином. Реестр нужен готовому синглтону
 * `dialogService`: он создаётся на импорте модуля, где `inject` не работает
 * вовсе, и сам до app-scoped состояния не дотянется. Ровно один
 * зарегистрированный — ответ однозначен; несколько — выбирать за пользователя
 * нечего, и он получает предупреждение с модульным фолбэком.
 */
const registeredStates = new Set<DialogServiceState>()

/**
 * Vue-плагин: даёт каждому приложению собственное состояние сервиса и снимает
 * его хост вместе с приложением. Обязателен для нескольких Vue-приложений на
 * одной странице (микрофронтенды — иначе они делят одну очередь и один хост) и
 * для HMR, где контейнер прошлого приложения иначе остаётся в `document.body`.
 *
 * ```ts
 * app.use(granularityDialogServicePlugin)
 * ```
 */
export const granularityDialogServicePlugin = {
  install(app: App) {
    const state = createDialogServiceState()

    app.provide(GRANULARITY_DIALOG_SERVICE_STATE, state)
    registeredStates.add(state)

    app.onUnmount(() => {
      teardownDialogServiceState(state)
      registeredStates.delete(state)
    })
  },
}

// Ленивый модульный фолбэк — канонический вариант для простого SPA без плагина.
let moduleState: DialogServiceState | null = null

function getModuleState(): DialogServiceState {
  if (!moduleState)
    moduleState = createDialogServiceState()

  return moduleState
}

let ambiguousStateWarned = false

function warnAmbiguousState(): void {
  if (ambiguousStateWarned)
    return
  if (!__GR_DEV__)
    return

  ambiguousStateWarned = true
  console.warn(
    '[granularity] useDialogService: плагин установлен в нескольких приложениях, '
    + 'а сервис запрошен вне `setup` — какое из них имелось в виду, знать неоткуда. '
    + 'Используется модульное состояние. Вызовите `useDialogService()` внутри `setup` нужного приложения.',
  )
}

/**
 * Состояние текущего вызова: app-scoped (плагин) → единственный
 * зарегистрированный инстанс → модульный фолбэк.
 */
function resolveDialogServiceState(): DialogServiceState {
  // `inject` работает только в `setup` — там ответ точный.
  if (getCurrentInstance()) {
    const provided = inject(GRANULARITY_DIALOG_SERVICE_STATE, null)
    if (provided)
      return provided
  }

  if (registeredStates.size === 1)
    return registeredStates.values().next().value!

  if (registeredStates.size > 1)
    warnAmbiguousState()

  return getModuleState()
}

function ensureMounted(state: DialogServiceState, appContext?: AppContext | null): void {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return

  if (appContext)
    state.appContext = appContext
  if (state.mounted)
    return

  const container = document.createElement('div')
  container.setAttribute('data-gr-dialog-service-host', '')
  container.setAttribute('data-gr-overlay-root', '')
  // Хост уезжает в общий портал оверлеев: он должен лежать в той же ветке, что
  // и остальные слои, иначе правило `inert` пометит его вместе со страницей.
  ;(ensurePortalRoot() ?? document.body).appendChild(container)
  state.container = container

  // Состояние отдаём пропом: хост монтируется вне дерева и своим `inject` до
  // app-scoped состояния не дотянулся бы. `markRaw` — чтобы Vue не пытался
  // сделать реактивной саму обёртку: реактивна очередь внутри неё.
  const vnode = createVNode(GrDialogServiceHost, { state: markRaw(state) })
  vnode.appContext = state.appContext ?? null
  render(vnode, container)
  state.mounted = true
}

function warnIfContextless(state: DialogServiceState, context: CapturedDialogContext | null): void {
  if (state.contextlessWarned || context?.config || context?.i18n)
    return
  if (!__GR_DEV__)
    return

  state.contextlessWarned = true
  console.warn(
    '[granularity] useDialogService: диалог открыт без контекста приложения — '
    + 'ни `GrConfigProvider`, ни адаптер i18n не найдены, будут использованы дефолты. '
    + 'Вызовите `useDialogService()` внутри `setup` хотя бы один раз или передайте `setAppContext`.',
  )
}

/** Снимает смонтированный хост и сбрасывает захваченный контекст одного инстанса. */
function teardownDialogServiceState(state: DialogServiceState): void {
  if (state.container) {
    render(null, state.container)
    state.container.remove()
    state.container = null
  }
  state.mounted = false
  // Сбрасываем и кэш контекста приложения: без этого он переживает teardown и
  // протекает в следующее приложение (в тестах — в следующий тест), из-за чего
  // диалог может подхватить чужие provides и проверка соврёт.
  state.appContext = null
  state.lastCapturedContext = null
  state.contextlessWarned = false
  state.queue.splice(0, state.queue.length)
  state.inFlight.splice(0, state.inFlight.length)
}

/**
 * Тестовая/служебная очистка смонтированного хоста. Работает над тем же
 * состоянием, что и сам сервис: app-scoped при вызове из `setup` или при
 * единственном зарегистрированном приложении, иначе — модульным.
 */
export function teardownDialogService(): void {
  teardownDialogServiceState(resolveDialogServiceState())
}

function enqueue(
  state: DialogServiceState,
  kind: DialogKind,
  message: string,
  options: DialogBaseOptions,
  onConfirm: DialogOnConfirm<any> | undefined,
  captured: CapturedDialogContext,
): { promise: Promise<DialogResult<any>>, close: () => void } {
  // Императивный сервис клиент-only: монтирует хост в `document.body`. В SSR
  // выполнять его нельзя — очередь мутировалась бы на сервере и текла между
  // запросами. Явно запрещаем вместо тихого no-op.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(
      '[granularity] useDialogService is client-only and cannot be called during SSR '
      + '(it mounts a host into document.body). Guard imperative dialog calls behind a client-side check.',
    )
  }

  ensureMounted(state, options.appContext ?? state.appContext)

  const id = makeDialogId()
  let resolveFn!: (result: DialogResult<any>) => void
  const promise = new Promise<DialogResult<any>>((resolve) => {
    resolveFn = resolve
  })

  // Синглтон `dialogService` создаётся на импорте модуля, вне `setup`, и своего
  // контекста не имеет в принципе. Берём последний захваченный — иначе такие
  // вызовы навсегда остаются без i18n и без `GrConfigProvider`.
  const context = captured.config || captured.i18n ? captured : state.lastCapturedContext
  warnIfContextless(state, context)

  const request: DialogRequest = {
    id,
    kind,
    message,
    options: { ...options, message },
    onConfirm,
    priority: options.priority ?? 0,
    nested: false,
    settled: false,
    resolve: resolveFn,
    config: context?.config ?? null,
    i18n: context?.i18n ?? null,
  }

  enqueueDialogRequest(state, request)

  // Закрытие через промис идёт тем же путём, что и кнопка в окне: заявка сама
  // знает, завершена ли она, а окно по её исчезновению свернёт всё, что под неё
  // заведено (в т.ч. оборвёт in-flight `onConfirm` через `abort()`).
  const close = (): void => {
    settleDialogRequest(state, request, { action: 'close' })
  }

  return { promise, close }
}

function withClose<T>(promise: Promise<T>, close: () => void): DialogPromise<T> {
  const result = promise as DialogPromise<T>
  result.close = close
  return result
}

function mergeErrorDefaults(
  defaults: DialogServiceDefaults,
  options: DialogBaseOptions,
): DialogBaseOptions & Pick<DialogConfirmOptions, 'cancelText'> {
  return {
    size: defaults.size,
    confirmText: defaults.confirmText,
    confirmVariant: defaults.confirmVariant,
    confirmTone: defaults.confirmTone,
    cancelText: defaults.cancelText,
    buttonSize: defaults.buttonSize,
    closeOnBackdrop: defaults.closeOnBackdrop,
    closeOnEsc: defaults.closeOnEsc,
    errorParsers: defaults.errorParsers,
    errorTexts: defaults.errorTexts,
    errorMessageKey: defaults.errorMessageKey,
    fieldLabels: defaults.fieldLabels,
    ...options,
  }
}

/**
 * Создаёт сервис диалогов. Опциональные `defaults` применяются ко всем
 * вызовам (можно переопределить в каждом конкретном вызове).
 *
 * Контекст приложения кэшируется автоматически при первом вызове внутри
 * `setup`. Для вызовов вне компонента используйте `setAppContext`.
 */
export function useDialogService(defaults: DialogServiceDefaults = {}): DialogService {
  const state = resolveDialogServiceState()

  // Авто-кэш appContext из текущего компонента (если вызвано в setup).
  const instance = getCurrentInstance()
  if (instance?.appContext && !state.appContext) {
    state.appContext = instance.appContext
  }

  // Конфиг и i18n захватываем здесь и только здесь: `inject` работает лишь в
  // `setup`, а хост монтируется вне дерева и сам до провайдера не дотянется.
  // Храним в замыкании сервиса, а не в состоянии, — иначе два поддерева с
  // разными провайдерами делили бы конфиг первого.
  // i18n захватываем не «на всякий случай»: дочерний `GrConfirmDialog` сам зовёт
  // `useGranularityTranslations()`, но его `inject` из хоста уходит в
  // `appContext.provides` — то есть видит только установку через `app.use()`.
  // Адаптер, переданный пропом `<GrConfigProvider i18n>`, живёт в дереве, и без
  // захвата диалог откатился бы на встроенные английские строки.
  //
  // `markRaw` — потому что дальше контекст ложится в `reactive`-очередь, а она
  // разворачивает вложенные рефы (см. комментарий в `store.ts`).
  const capturedI18n = instance ? resolveGranularityI18n() : null
  const captured: CapturedDialogContext = {
    config: instance ? markRaw(useGrConfig()) : null,
    i18n: capturedI18n ? markRaw(capturedI18n) : null,
  }

  if (captured.config || captured.i18n)
    state.lastCapturedContext = captured

  function confirm(message: string, options: DialogConfirmOptions = {}): DialogPromise<boolean> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue(state, 'confirm', message, merged, options.onConfirm, captured)
    return withClose(promise.then(r => r.action === 'confirm'), close)
  }

  function alert(message: string, options: DialogAlertOptions = {}): DialogPromise<void> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue(state, 'alert', message, merged, options.onConfirm, captured)
    return withClose(promise.then(() => undefined), close)
  }

  function prompt(message: string, options: DialogPromptOptions = {}): DialogPromise<string | null> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue(state, 'prompt', message, merged, options.onConfirm, captured)
    return withClose(
      promise.then(r => (r.action === 'confirm' ? ((r.value as string) ?? '') : null)),
      close,
    )
  }

  function open<V = unknown>(
    kind: DialogKind,
    message: string,
    options: DialogBaseOptions = {},
  ): DialogPromise<DialogResult<V>> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue(
      state,
      kind,
      message,
      merged,
      (options as DialogConfirmOptions).onConfirm,
      captured,
    )
    return withClose(promise as Promise<DialogResult<V>>, close)
  }

  // Порядок разбора — FIFO, как и порядок показа: `pop()` резолвил промисы
  // задом наперёд, и вызывающий получал результаты в обратном порядке.
  function closeAll(): void {
    for (const request of [...state.queue])
      settleDialogRequest(state, request, { action: 'close' })
  }

  function setAppContext(ctx: AppContext | null): void {
    state.appContext = ctx
  }

  return { confirm, alert, prompt, open, closeAll, setAppContext }
}

/** Готовый синглтон-сервис с дефолтными настройками. */
export const dialogService: DialogService = {
  confirm: (message, options) => useDialogService().confirm(message, options),
  alert: (message, options) => useDialogService().alert(message, options),
  prompt: (message, options) => useDialogService().prompt(message, options),
  open: (kind, message, options) => useDialogService().open(kind, message, options),
  closeAll: () => useDialogService().closeAll(),
  setAppContext: ctx => useDialogService().setAppContext(ctx),
}
