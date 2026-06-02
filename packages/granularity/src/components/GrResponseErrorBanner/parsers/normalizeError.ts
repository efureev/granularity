import type { NormalizedRawError } from '../responseError.types'

/**
 * Универсально приводит «сырой» вход к {@link NormalizedRawError}.
 *
 * Поддерживаемые источники:
 * - **axios** — `AxiosError` с `response.status`/`response.data`/`response.headers`,
 *   либо `request` без `response` + `code === 'ERR_NETWORK'`, либо `code === 'ERR_CANCELED'`.
 * - **fetch `Response`** — объект `Response` с `ok=false`. Тело читается через
 *   `clone().json()` (с фолбэком на `.text()`); поэтому функция асинхронная.
 * - **fetch `TypeError`** — `TypeError('Failed to fetch')` ⇒ `isNetwork=true`.
 * - **`{ response: Response, body: unknown }`** — если потребитель уже прочитал тело сам.
 * - **`XMLHttpRequest`** / `{ status, responseText, response }` — пара полей.
 * - **`AbortError` / `DOMException`** ⇒ `isAbort=true`.
 * - **`Error`/строка/произвольный объект** — кладётся в `body`/`raw` как есть.
 *
 * Цель — отделить «откуда пришла ошибка» от «как её классифицировать»: парсеры
 * работают только с нормализованным `ResponseErrorContext`, не зная о транспорте.
 */
export async function normalizeError(raw: unknown): Promise<NormalizedRawError> {
  // 1) Уже нормализованный вход (потребитель сам подготовил)
  if (isPlainNormalized(raw)) {
    return { ...(raw), raw }
  }

  // 2) `{ response: Response, body }` — уже прочитанное тело
  if (isResponseEnvelope(raw)) {
    const res = raw.response
    return {
      raw,
      status: res.status,
      body: raw.body,
      headers: readHeaders(res),
    }
  }

  // 3) Голый fetch Response
  if (isFetchResponse(raw)) {
    const body = await readFetchBody(raw)
    return {
      raw,
      status: raw.status,
      body,
      headers: readHeaders(raw),
    }
  }

  // 4) XMLHttpRequest
  if (isXhr(raw)) {
    const body = parseMaybeJson(raw.responseText) ?? raw.response
    return {
      raw,
      status: typeof raw.status === 'number' ? raw.status : undefined,
      body,
      isAbort: raw.status === 0 && raw.readyState === 4,
    }
  }

  // 5) axios error (есть `isAxiosError` или `response`/`request` + `code`)
  if (isAxiosLike(raw)) {
    const e = raw
    const status = e.response?.status
    const code = e.code
    const isAbort = code === 'ERR_CANCELED' || code === 'CANCELED' || (e as { __CANCEL__?: boolean }).__CANCEL__ === true
    const isNetwork = !e.response && (code === 'ERR_NETWORK' || code === 'ECONNABORTED')

    return {
      raw,
      status,
      body: e.response?.data,
      headers: normalizeHeaderRecord(e.response?.headers),
      isAbort,
      isNetwork,
    }
  }

  // 6) AbortError / DOMException
  if (isAbortError(raw)) {
    return { raw, isAbort: true }
  }

  // 7) Сетевой TypeError от fetch
  if (raw instanceof TypeError && /fetch|network/i.test(raw.message || '')) {
    return { raw, isNetwork: true }
  }

  // 8) Произвольный Error / строка / объект
  if (raw instanceof Error) {
    return { raw, body: { message: raw.message } }
  }

  if (typeof raw === 'string') {
    return { raw, body: { message: raw } }
  }

  if (raw && typeof raw === 'object') {
    return { raw, body: raw }
  }

  return { raw }
}

// ----------------- helpers -----------------

type AxiosLikeError = Error & {
  isAxiosError?: boolean
  code?: string
  response?: { status?: number, data?: unknown, headers?: unknown }
  request?: unknown
}

function isPlainNormalized(v: unknown): v is NormalizedRawError {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return 'raw' in o && (
    'status' in o || 'body' in o || 'isAbort' in o || 'isNetwork' in o || 'headers' in o
  )
}

function isResponseEnvelope(v: unknown): v is { response: Response, body: unknown } {
  return !!v && typeof v === 'object'
      && 'response' in (v)
      && isFetchResponse((v).response)
}

function isFetchResponse(v: unknown): v is Response {
  return typeof Response !== 'undefined' && v instanceof Response
}

function isXhr(v: unknown): v is XMLHttpRequest {
  return typeof XMLHttpRequest !== 'undefined' && v instanceof XMLHttpRequest
}

function isAxiosLike(v: unknown): v is AxiosLikeError {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return o.isAxiosError === true
      || ('response' in o && typeof o.response === 'object' && o.response !== null)
      || ('code' in o && typeof o.code === 'string')
}

function isAbortError(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const o = v as { name?: string, code?: string }
  return o.name === 'AbortError' || o.name === 'CanceledError' || o.code === 'ERR_CANCELED'
}

async function readFetchBody(res: Response): Promise<unknown> {
  if (res.bodyUsed) return undefined
  try {
    const clone = res.clone()
    const text = await clone.text()
    return parseMaybeJson(text) ?? text
  }
  catch {
    return undefined
  }
}

function readHeaders(res: Response): Record<string, string> {
  const out: Record<string, string> = {}
  res.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value
  })
  return out
}

function normalizeHeaderRecord(h: unknown): Record<string, string> | undefined {
  if (!h || typeof h !== 'object') return undefined
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    if (typeof v === 'string') out[k.toLowerCase()] = v
  }
  return out
}

function parseMaybeJson(text: string | undefined): unknown {
  if (typeof text !== 'string' || !text) return undefined
  try {
    return JSON.parse(text)
  }
  catch {
    return undefined
  }
}
