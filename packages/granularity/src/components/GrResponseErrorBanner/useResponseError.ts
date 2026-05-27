import { computed, ref, shallowRef } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import { createResponseErrorClassifier, defaultResponseErrorParsers } from './parsers/createResponseErrorClassifier'
import { DEFAULT_AUTO_HIDE_KINDS, DEFAULT_RESPONSE_ERROR_TEXTS } from './responseError.defaults'
import type {
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorParser,
  ResponseErrorTexts,
} from './responseError.types'

/**
 * Опции для `useResponseError`. Все поля опциональны и поддерживают
 * **реактивные геттеры** (`() => value`) — чтобы пробрасывать пропсы
 * родителя без потери реактивности.
 */
export type UseResponseErrorOptions = {
  /** Цепочка парсеров. По умолчанию — `defaultResponseErrorParsers`. */
  parsers?: () => ResponseErrorParser[] | undefined
  /** Частичный override текстов баннера. */
  texts?: () => Partial<ResponseErrorTexts> | undefined
  /**
   * `kind`'ы, которые **не** выставляются в state (баннер останется скрытым).
   * По умолчанию пусто — `aborted` показывается info-плашкой. Передайте
   * `['aborted']`, если хотите тихо проглатывать отмены.
   */
  autoHideKinds?: () => ResponseErrorKind[] | undefined
  /** Имя поля основного сообщения в body (для `plainMessageParser`). */
  messageKey?: () => string | undefined
  /** Контекст, который попадёт в `ctx.meta` каждого парсера (`{ files, formId, ... }`). */
  meta?: () => Record<string, unknown> | undefined
  /** Побочка после успешной классификации (логирование, sentry). */
  onClassify?: (info: ResponseErrorInfo) => void
}

/** Публичный возвращаемый API. */
export type UseResponseErrorReturn = {
  /** Текущее состояние ошибки. `null` — баннер скрыт. */
  currentError: Ref<ResponseErrorInfo | null>
  /** `currentError.value !== null`. */
  isVisible: ComputedRef<boolean>
  /** Последний «сырой» вход (для retry/логов). */
  lastRaw: Ref<unknown>

  /**
   * Главное API: классифицирует raw, сохраняет в state, возвращает info
   * (или `null`, если `kind` в `autoHideKinds`). Возвращает Promise,
   * т.к. нормализатор поддерживает `Response.json()` (async).
   */
  setRaw: (raw: unknown, meta?: Record<string, unknown>) => Promise<ResponseErrorInfo | null>

  /** Установить готовый info, не пропуская через парсеры. */
  setError: (info: ResponseErrorInfo) => void

  /** Чистая классификация без записи в state — для предпросмотра. */
  classify: (raw: unknown, meta?: Record<string, unknown>) => Promise<ResponseErrorInfo>

  /** Сбросить state (скрыть баннер). */
  dismiss: () => void
  /** Алиас `dismiss`. */
  reset: () => void

  /**
   * Хелпер: вызывает `handler(currentError)`. Если handler завершился без
   * исключения — сбрасывает state. Если кинул — оставляет state, поднимает.
   * Удобно бинать к кнопке «Повторить».
   */
  retry: (handler: (info: ResponseErrorInfo) => void | Promise<void>) => Promise<void>
}

/**
 * Stateful-композабл вокруг `createResponseErrorClassifier`. Хранит
 * `currentError`, инкапсулирует setRaw/retry/dismiss. Подходит для типичного
 * сценария «поймал ошибку запроса → показал баннер → ретрай/скрыть».
 */
export function useResponseError(options: UseResponseErrorOptions = {}): UseResponseErrorReturn {
  const currentError = shallowRef<ResponseErrorInfo | null>(null)
  const lastRaw = ref<unknown>(null)

  function getClassifier() {
    return createResponseErrorClassifier({
      parsers: options.parsers?.() ?? defaultResponseErrorParsers,
      texts: options.texts?.() ?? {},
      messageKey: options.messageKey?.(),
    })
  }

  function isAutoHidden(kind: ResponseErrorKind): boolean {
    const list = options.autoHideKinds?.() ?? DEFAULT_AUTO_HIDE_KINDS
    return list.includes(kind)
  }

  async function classify(raw: unknown, extra?: Record<string, unknown>): Promise<ResponseErrorInfo> {
    const classifier = getClassifier()
    const meta = { ...(options.meta?.() ?? {}), ...(extra ?? {}) }
    const info = await classifier(raw, meta)
    options.onClassify?.(info)
    return info
  }

  async function setRaw(raw: unknown, extra?: Record<string, unknown>): Promise<ResponseErrorInfo | null> {
    lastRaw.value = raw
    const info = await classify(raw, extra)
    if (isAutoHidden(info.kind)) {
      currentError.value = null
      return null
    }
    currentError.value = info
    return info
  }

  function setError(info: ResponseErrorInfo): void {
    currentError.value = info
  }

  function dismiss(): void {
    currentError.value = null
  }

  async function retry(handler: (info: ResponseErrorInfo) => void | Promise<void>): Promise<void> {
    const info = currentError.value
    if (!info) return
    await handler(info)
    currentError.value = null
  }

  return {
    currentError,
    isVisible: computed(() => currentError.value !== null),
    lastRaw,
    setRaw,
    setError,
    classify,
    dismiss,
    reset: dismiss,
    retry,
  }
}

export { DEFAULT_RESPONSE_ERROR_TEXTS }
