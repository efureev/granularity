import { createVNode, getCurrentInstance, markRaw, render } from 'vue'
import type { AppContext, Raw } from 'vue'

import GrDialogServiceHost from './GrDialogServiceHost.vue'
import { useGrConfig, type GrConfigContext } from '../GrConfigProvider/context'
import { resolveGranularityI18n, type GranularityI18nLike } from '../../internal/granularityI18n'
import { dialogQueue, makeDialogId, settleDialogRequest } from './store'
import type { DialogRequest } from './store'
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
 * приложения (i18n / тема / `granular-provider`). Диалоги сериализуются
 * очередью FIFO.
 */

let mounted = false
let container: HTMLElement | null = null
let cachedAppContext: AppContext | null = null

function ensureMounted(appContext?: AppContext | null): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (appContext) cachedAppContext = appContext
  if (mounted) return

  container = document.createElement('div')
  container.setAttribute('data-gr-dialog-service-host', '')
  document.body.appendChild(container)

  const vnode = createVNode(GrDialogServiceHost)
  vnode.appContext = cachedAppContext ?? null
  render(vnode, container)
  mounted = true
}

/** Контекст, захваченный вызовом `useDialogService()` внутри `setup`. */
type CapturedContext = {
  config: Raw<GrConfigContext> | null
  i18n: Raw<GranularityI18nLike> | null
}

/**
 * Последний контекст, захваченный вызовом `useDialogService()` из `setup`.
 *
 * Нужен готовому синглтону `dialogService`: он создаётся на импорте модуля, где
 * `inject` не работает, и своего конфига с i18n не имеет никогда. Без этого
 * фолбэка «удобный вариант» из доки всегда открывал бы диалоги с английскими
 * строками и дефолтным размером — молча, без единой ошибки.
 *
 * Эвристика честная ровно настолько, насколько может быть честным контекст «из
 * ниоткуда»: при двух поддеревьях с разными провайдерами возьмётся последнее.
 * Точный ответ даёт `useDialogService()` в `setup` или явный `setAppContext`.
 */
let lastCapturedContext: CapturedContext | null = null

let contextlessWarned = false

function warnIfContextless(context: CapturedContext | null): void {
  if (contextlessWarned || context?.config || context?.i18n) return
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return

  contextlessWarned = true
  console.warn(
    '[granularity] useDialogService: диалог открыт без контекста приложения — '
    + 'ни `GrConfigProvider`, ни адаптер i18n не найдены, будут использованы дефолты. '
    + 'Вызовите `useDialogService()` внутри `setup` хотя бы один раз или передайте `setAppContext`.',
  )
}

/** Тестовая/служебная очистка смонтированного хоста. */
export function teardownDialogService(): void {
  if (container) {
    render(null, container)
    container.remove()
    container = null
  }
  mounted = false
  // Сбрасываем и кэш контекста приложения: без этого он переживает teardown и
  // протекает в следующее приложение (в тестах — в следующий тест), из-за чего
  // диалог может подхватить чужие provides и проверка соврёт.
  cachedAppContext = null
  lastCapturedContext = null
  contextlessWarned = false
  dialogQueue.splice(0, dialogQueue.length)
}

function enqueue(
  kind: DialogKind,
  message: string,
  options: DialogBaseOptions,
  onConfirm: DialogOnConfirm<any> | undefined,
  captured: CapturedContext,
): { promise: Promise<DialogResult<any>>, close: () => void } {
  // Императивный сервис клиент-only: монтирует хост в `document.body`. В SSR
  // выполнять его нельзя — модульная очередь (`dialogQueue`) мутировалась бы на
  // сервере и текла между запросами. Явно запрещаем вместо тихого no-op.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(
      '[granularity] useDialogService is client-only and cannot be called during SSR '
      + '(it mounts a host into document.body). Guard imperative dialog calls behind a client-side check.',
    )
  }

  ensureMounted(options.appContext ?? cachedAppContext)

  const id = makeDialogId()
  let resolveFn!: (result: DialogResult<any>) => void
  const promise = new Promise<DialogResult<any>>((resolve) => {
    resolveFn = resolve
  })

  // Синглтон `dialogService` создаётся на импорте модуля, вне `setup`, и своего
  // контекста не имеет в принципе. Берём последний захваченный — иначе такие
  // вызовы навсегда остаются без i18n и без `GrConfigProvider`.
  const context = captured.config || captured.i18n ? captured : lastCapturedContext
  warnIfContextless(context)

  const request: DialogRequest = {
    id,
    kind,
    message,
    options: { ...options, message },
    onConfirm,
    settled: false,
    resolve: resolveFn,
    config: context?.config ?? null,
    i18n: context?.i18n ?? null,
  }

  dialogQueue.push(request)

  // Закрытие через промис идёт тем же путём, что и кнопка в хосте: заявка сама
  // знает, завершена ли она, а хост по смене головы очереди свернёт всё, что
  // под неё заведено (в т.ч. оборвёт in-flight `onConfirm` через `abort()`).
  const close = (): void => {
    settleDialogRequest(request, { action: 'close' })
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
  // Авто-кэш appContext из текущего компонента (если вызвано в setup).
  const instance = getCurrentInstance()
  if (instance?.appContext && !cachedAppContext) {
    cachedAppContext = instance.appContext
  }

  // Конфиг и i18n захватываем здесь и только здесь: `inject` работает лишь в
  // `setup`, а хост монтируется вне дерева и сам до провайдера не дотянется.
  // Храним в замыкании сервиса, а не в модульной переменной, — иначе два
  // поддерева с разными провайдерами делили бы конфиг первого.
  // i18n захватываем не «на всякий случай»: дочерний `GrConfirmDialog` сам зовёт
  // `useGranularityTranslations()`, но его `inject` из хоста уходит в
  // `appContext.provides` — то есть видит только установку через `app.use()`.
  // Адаптер, переданный пропом `<GrConfigProvider i18n>`, живёт в дереве, и без
  // захвата диалог откатился бы на встроенные английские строки.
  //
  // `markRaw` — потому что дальше контекст ложится в `reactive`-очередь, а она
  // разворачивает вложенные рефы (см. комментарий в `store.ts`).
  const capturedI18n = instance ? resolveGranularityI18n() : null
  const captured: CapturedContext = {
    config: instance ? markRaw(useGrConfig()) : null,
    i18n: capturedI18n ? markRaw(capturedI18n) : null,
  }

  if (captured.config || captured.i18n)
    lastCapturedContext = captured

  function confirm(message: string, options: DialogConfirmOptions = {}): DialogPromise<boolean> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('confirm', message, merged, options.onConfirm, captured)
    return withClose(promise.then(r => r.action === 'confirm'), close)
  }

  function alert(message: string, options: DialogAlertOptions = {}): DialogPromise<void> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('alert', message, merged, options.onConfirm, captured)
    return withClose(promise.then(() => undefined), close)
  }

  function prompt(message: string, options: DialogPromptOptions = {}): DialogPromise<string | null> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('prompt', message, merged, options.onConfirm, captured)
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
    const { promise, close } = enqueue(kind, message, merged, (options as DialogConfirmOptions).onConfirm, captured)
    return withClose(promise as Promise<DialogResult<V>>, close)
  }

  // Порядок разбора — FIFO, как и порядок показа: `pop()` резолвил промисы
  // задом наперёд, и вызывающий получал результаты в обратном порядке.
  function closeAll(): void {
    for (const request of [...dialogQueue])
      settleDialogRequest(request, { action: 'close' })
  }

  function setAppContext(ctx: AppContext | null): void {
    cachedAppContext = ctx
  }

  return { confirm, alert, prompt, open, closeAll, setAppContext }
}

/** Готовый синглтон-сервис с дефолтными настройками. */
export const dialogService: DialogService = useDialogService()
