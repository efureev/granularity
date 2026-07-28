import { createVNode, getCurrentInstance, markRaw, render } from 'vue'
import type { AppContext, Raw } from 'vue'

import GrDialogServiceHost from './GrDialogServiceHost.vue'
import { useGrConfig, type GrConfigContext } from '../GrConfigProvider/context'
import { resolveGranularityI18n, type GranularityI18nLike } from '../../internal/granularityI18n'
import { dialogQueue, makeDialogId } from './store'
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
  dialogQueue.splice(0, dialogQueue.length)
}

/** Контекст, захваченный вызовом `useDialogService()` внутри `setup`. */
type CapturedContext = {
  config: Raw<GrConfigContext> | null
  i18n: Raw<GranularityI18nLike> | null
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

  const request: DialogRequest = {
    id,
    kind,
    message,
    options: { ...options, message },
    onConfirm,
    resolve: resolveFn,
    config: captured.config,
    i18n: captured.i18n,
  }

  dialogQueue.push(request)

  const close = (): void => {
    const index = dialogQueue.findIndex(item => item.id === id)
    if (index < 0) return
    dialogQueue.splice(index, 1)
    resolveFn({ action: 'close' })
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
): DialogBaseOptions {
  return {
    size: defaults.size,
    confirmText: defaults.confirmText,
    confirmVariant: defaults.confirmVariant,
    confirmTone: defaults.confirmTone,
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

  function closeAll(): void {
    while (dialogQueue.length > 0) {
      const request = dialogQueue.pop()!
      request.resolve({ action: 'close' })
    }
  }

  function setAppContext(ctx: AppContext | null): void {
    cachedAppContext = ctx
  }

  return { confirm, alert, prompt, open, closeAll, setAppContext }
}

/** Готовый синглтон-сервис с дефолтными настройками. */
export const dialogService: DialogService = useDialogService()
