import { createVNode, getCurrentInstance, render } from 'vue'
import type { AppContext } from 'vue'

import GrDialogServiceHost from './GrDialogServiceHost.vue'
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
  dialogQueue.splice(0, dialogQueue.length)
}

function enqueue(
  kind: DialogKind,
  message: string,
  options: DialogBaseOptions,
  onConfirm: DialogOnConfirm<any> | undefined,
): { promise: Promise<DialogResult<any>>, close: () => void } {
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

  function confirm(message: string, options: DialogConfirmOptions = {}): DialogPromise<boolean> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('confirm', message, merged, options.onConfirm)
    return withClose(promise.then(r => r.action === 'confirm'), close)
  }

  function alert(message: string, options: DialogAlertOptions = {}): DialogPromise<void> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('alert', message, merged, options.onConfirm)
    return withClose(promise.then(() => undefined), close)
  }

  function prompt(message: string, options: DialogPromptOptions = {}): DialogPromise<string | null> {
    const merged = mergeErrorDefaults(defaults, options)
    const { promise, close } = enqueue('prompt', message, merged, options.onConfirm)
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
    const { promise, close } = enqueue(kind, message, merged, (options as DialogConfirmOptions).onConfirm)
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
