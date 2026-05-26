/**
 * Загрузка файлов через `XMLHttpRequest` с поддержкой прогресса аплоада и
 * отмены по `AbortSignal`. Используется в `GrFileUpload` для ветки `action`,
 * а также может применяться пользователем напрямую в `request`-загрузчике.
 */

export type GrUploadExtraDataValue = string | Blob

export type GrUploadExtraData = Record<string, GrUploadExtraDataValue | GrUploadExtraDataValue[]>

export interface GrUploadProgressInfo {
  /** Процент `0..100`. Для запросов без `lengthComputable` значение `0` и `indeterminate = true`. */
  percent: number
  loaded: number
  total: number
  indeterminate: boolean
}

export interface UploadViaXhrOptions {
  url: string
  files: File[]
  name: string
  headers?: Record<string, string>
  withCredentials?: boolean
  extraData?: GrUploadExtraData
  signal: AbortSignal
  onProgress?: (info: GrUploadProgressInfo) => void
}

export class GrUploadAbortError extends Error {
  constructor(message = 'Upload aborted') {
    super(message)
    this.name = 'GrUploadAbortError'
  }
}

export class GrUploadHttpError extends Error {
  status: number
  payload: unknown

  constructor(status: number, payload: unknown) {
    super(`Upload failed with status ${status}`)
    this.name = 'GrUploadHttpError'
    this.status = status
    this.payload = payload
  }
}

function appendExtraFormData(body: FormData, extraData: GrUploadExtraData | undefined) {
  if (!extraData) return

  for (const [key, value] of Object.entries(extraData)) {
    if (Array.isArray(value)) {
      for (const entry of value) body.append(key, entry)
      continue
    }

    body.append(key, value)
  }
}

function parseResponse(xhr: XMLHttpRequest): unknown {
  const contentType = xhr.getResponseHeader('content-type') ?? ''
  const raw = xhr.responseText

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }

  return raw
}

export function uploadViaXhr(options: UploadViaXhrOptions): Promise<unknown> {
  const { url, files, name, headers, withCredentials, extraData, signal, onProgress } = options

  return new Promise<unknown>((resolve, reject) => {
    if (signal.aborted) {
      reject(new GrUploadAbortError())
      return
    }

    const body = new FormData()
    for (const file of files) body.append(name, file)
    appendExtraFormData(body, extraData)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.withCredentials = !!withCredentials

    if (headers) {
      for (const [key, value] of Object.entries(headers))
        xhr.setRequestHeader(key, value)
    }

    const onAbort = () => {
      try {
        xhr.abort()
      } catch {
        /* ignore */
      }
    }

    signal.addEventListener('abort', onAbort)

    const cleanup = () => {
      signal.removeEventListener('abort', onAbort)
    }

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        const indeterminate = !event.lengthComputable
        const total = indeterminate ? 0 : event.total
        const loaded = indeterminate ? 0 : event.loaded
        const percent = indeterminate || total === 0 ? 0 : Math.min(100, (loaded / total) * 100)
        onProgress({ percent, loaded, total, indeterminate })
      })
    }

    xhr.addEventListener('load', () => {
      cleanup()
      const payload = parseResponse(xhr)
      const status = xhr.status

      if (status >= 200 && status < 300) {
        if (onProgress) onProgress({ percent: 100, loaded: 1, total: 1, indeterminate: false })
        resolve(payload)
        return
      }

      reject(new GrUploadHttpError(status, payload))
    })

    xhr.addEventListener('error', () => {
      cleanup()
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      cleanup()
      reject(new GrUploadAbortError())
    })

    xhr.send(body)
  })
}
