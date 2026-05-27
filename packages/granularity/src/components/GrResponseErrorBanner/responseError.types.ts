/**
 * Универсальные типы для отображения ошибок ответа сервера/сети.
 *
 * Компонент `GrResponseErrorBanner` не зависит от транспорта (axios/fetch/xhr)
 * и не делает запросов — он получает уже готовый «сырой» результат и
 * прогоняет его через цепочку парсеров (`ResponseErrorParser[]`), превращая
 * в `ResponseErrorInfo`.
 */

/**
 * Категория ошибки. Жёстко разделены по семантике (см. `DEFAULT_TONE_BY_KIND`).
 *
 * - `network`     — транспортная проблема: нет интернета, DNS, CORS-preflight,
 *                   `fetch` `TypeError`, axios `ERR_NETWORK`. **Ответа от сервера нет.**
 * - `aborted`     — запрос отменён клиентом (`AbortController`, axios `CanceledError`).
 * - `validation`  — ошибка валидации формы/файлов; есть структурированные поля или
 *                   статус `400`/`422`. UX: «исправь поле и повтори».
 * - `client`      — прочие 4xx (auth/forbidden/not-found/conflict/rate-limit) —
 *                   проблема запроса, retry обычно не помогает.
 * - `server`      — 5xx, проблема на сервере; retry разумен.
 * - `unknown`     — ничего не сматчилось, fallback.
 */
export type ResponseErrorKind =
    | 'network'
    | 'aborted'
    | 'validation'
    | 'client'
    | 'server'
    | 'unknown'

/** Визуальный тон баннера. Совпадает с `tone` у `GrAlert`. */
export type ResponseErrorTone = 'info' | 'success' | 'warning' | 'danger' | 'slate' | 'azure' | 'primary' | 'neutral'

/** Ошибка по конкретному полю (Laravel-style / JSON:API pointer / RFC 7807 errors). */
export type ResponseErrorFieldError = {
  /** Имя поля. Для Laravel — ключ из `errors`. Для JSON:API — последний сегмент `source.pointer`. */
  field: string
  /** Сообщения, относящиеся к этому полю. */
  messages: string[]
}

/**
 * Готовая к показу структура. Это то, что баннер принимает в `error`-проп.
 */
export type ResponseErrorInfo = {
  kind: ResponseErrorKind
  /** HTTP-статус, если известен. */
  status?: number
  /** Основной заголовок-сообщение для пользователя. */
  message: string
  /** Плоский список дополнительных сообщений под `message`. */
  details?: string[]
  /** Структурированные ошибки по полям (если сервер вернул JSON-объект `errors`). */
  fieldErrors?: ResponseErrorFieldError[]
  /** Оригинальный объект ошибки/ответа (для логов/retry). */
  raw: unknown
  /** Произвольный контекст, переданный потребителем (например, `{ files }`). */
  meta?: Record<string, unknown>
}

/**
 * Нормализованный «сырой» результат запроса. Заполняется `normalizeError`
 * единообразно для axios / fetch / xhr / голого Error / строки.
 */
export type NormalizedRawError = {
  /** Оригинал, как пришёл от потребителя. */
  raw: unknown
  /** HTTP-статус (если был ответ). */
  status?: number
  /** Уже распарсенное тело ответа (JSON-объект, строка). */
  body?: unknown
  /** Заголовки ответа (lower-case keys). */
  headers?: Record<string, string>
  /** Признак отмены (`AbortError` / axios `isCancel`). */
  isAbort?: boolean
  /** Признак транспортной ошибки без ответа. */
  isNetwork?: boolean
}

/**
 * Контекст, который классификатор передаёт каждому парсеру.
 *
 * `raw` — исходный объект (для duck-typing).
 * `status/body/headers/isAbort/isNetwork` — нормализованные поля.
 * `meta` — произвольный пользовательский контекст (например, `{ files, formId }`).
 * `texts` — мёрджнутые тексты, парсер может использовать дефолты как fallback.
 */
export type ResponseErrorContext = NormalizedRawError & {
  meta: Record<string, unknown>
  texts: ResponseErrorTexts
}

/**
 * Результат работы парсера. Любое поле опционально — классификатор сливает
 * результаты по очереди (последний непустой выигрывает).
 *
 * `stop: true` — прервать цепочку, никакие следующие парсеры не вызовутся.
 */
export type ResponseErrorParserResult = {
  kind?: ResponseErrorKind
  status?: number
  message?: string
  details?: string[]
  fieldErrors?: ResponseErrorFieldError[]
  stop?: boolean
}

/** Сигнатура парсера. */
export type ResponseErrorParser = (
    ctx: ResponseErrorContext,
) => ResponseErrorParserResult | null | undefined

/**
 * Тексты-фолбэки для каждого `kind` + лейблы кнопок.
 * Все строки переопределяются через проп `texts` (частичный мердж).
 */
export type ResponseErrorTexts = {
  networkTitle: string
  networkMessage: string
  abortedTitle: string
  abortedMessage: string
  validationTitle: string
  validationMessage: string
  clientTitle: string
  clientMessage: string
  serverTitle: string
  serverMessage: string
  unknownTitle: string
  unknownMessage: string
  retryLabel: string
  dismissLabel: string
}
