import { DEFAULT_RESPONSE_ERROR_TEXTS } from '../responseError.defaults'
import type {
  ResponseErrorContext,
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorParser,
  ResponseErrorTexts,
} from '../responseError.types'

import { abortErrorParser } from './abortErrorParser'
import { fileValidationParser } from './fileValidationParser'
import { httpStatusParser } from './httpStatusParser'
import { jsonApiErrorParser } from './jsonApiErrorParser'
import { laravelValidationParser } from './laravelValidationParser'
import { networkErrorParser } from './networkErrorParser'
import { normalizeError } from './normalizeError'
import { plainMessageParser } from './plainMessageParser'
import { problemDetailsParser } from './problemDetailsParser'

/**
 * Дефолтная цепочка парсеров. Порядок важен:
 * `abort → network → fileValidation → laravel → problemDetails → jsonApi → httpStatus → plainMessage`.
 *
 * - Ранние специализированные парсеры могут поставить `stop` (abort/file).
 * - HTTP-парсер даёт fallback-kind/message, чтобы остальное могло уточнить.
 * - `plainMessage` всегда последний — добывает хоть какое-то сообщение.
 */
export const defaultResponseErrorParsers: ResponseErrorParser[] = [
  abortErrorParser,
  networkErrorParser,
  fileValidationParser,
  laravelValidationParser,
  problemDetailsParser,
  jsonApiErrorParser,
  httpStatusParser,
  plainMessageParser,
]

/** Добавляет пользовательские парсеры в начало дефолтной цепочки. */
export function extendDefaultParsers(extra: ResponseErrorParser[]): ResponseErrorParser[] {
  return [...extra, ...defaultResponseErrorParsers]
}

export type CreateResponseErrorClassifierOptions = {
  parsers?: ResponseErrorParser[]
  texts?: Partial<ResponseErrorTexts>
  /** Имя поля основного сообщения в body (для `plainMessageParser`). */
  messageKey?: string
}

/**
 * Фабрика классификатора. Возвращает функцию `(raw, meta?) => Promise<ResponseErrorInfo>`,
 * которая:
 * 1. нормализует вход через `normalizeError`,
 * 2. строит `ResponseErrorContext`,
 * 3. прогоняет цепочку парсеров (с поддержкой `stop`),
 * 4. собирает финальный `ResponseErrorInfo` с фолбэками из `texts`.
 */
export function createResponseErrorClassifier(options: CreateResponseErrorClassifierOptions = {}) {
  const parsers = options.parsers ?? defaultResponseErrorParsers
  const texts: ResponseErrorTexts = { ...DEFAULT_RESPONSE_ERROR_TEXTS, ...(options.texts ?? {}) }
  const messageKey = options.messageKey ?? 'message'

  return async function classify(raw: unknown, meta: Record<string, unknown> = {}): Promise<ResponseErrorInfo> {
    const normalized = await normalizeError(raw)

    const ctx: ResponseErrorContext = {
      ...normalized,
      meta: { ...meta, _messageKey: messageKey },
      texts,
    }

    let kind: ResponseErrorKind | undefined
    let status: number | undefined = ctx.status
    let message: string | undefined
    let details: string[] | undefined
    let fieldErrors: ResponseErrorInfo['fieldErrors']

    for (const parser of parsers) {
      const result = parser(ctx)
      if (!result) continue
      if (result.kind) kind = result.kind
      if (typeof result.status === 'number') status = result.status
      if (result.message) message = result.message
      if (result.details?.length) details = result.details
      if (result.fieldErrors?.length) fieldErrors = result.fieldErrors
      if (result.stop) break
    }

    if (!kind) kind = 'unknown'

    if (!message) message = resolveDefaultMessage(kind, texts)

    return {
      kind,
      status,
      message,
      details,
      fieldErrors,
      raw,
      meta,
    }
  }
}

function resolveDefaultMessage(kind: ResponseErrorKind, texts: ResponseErrorTexts): string {
  switch (kind) {
    case 'network': return texts.networkMessage
    case 'aborted': return texts.abortedMessage
    case 'validation': return texts.validationMessage
    case 'client': return texts.clientMessage
    case 'server': return texts.serverMessage
    case 'unknown':
    default: return texts.unknownMessage
  }
}

export function resolveResponseErrorTitle(kind: ResponseErrorKind, texts: ResponseErrorTexts): string {
  switch (kind) {
    case 'network': return texts.networkTitle
    case 'aborted': return texts.abortedTitle
    case 'validation': return texts.validationTitle
    case 'client': return texts.clientTitle
    case 'server': return texts.serverTitle
    case 'unknown':
    default: return texts.unknownTitle
  }
}
