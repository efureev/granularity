import { ref, type Ref } from 'vue'

import { createFileEntry, summarizeFileEntries, type GrFileUploadEntry } from './fileEntry'
import type { GrUploadState } from './uploadState'
import { GrUploadAbortError, type GrUploadProgressInfo } from './uploadViaXhr'

export interface UsePerFileUploadOptions {
  /** Сколько файлов грузится одновременно. */
  concurrency: () => number
  /** Отправка одного файла. Контракт тот же, что у батча: всегда массив. */
  send: (files: File[], ctx: { signal: AbortSignal, onProgress: (info: GrUploadProgressInfo) => void }) => Promise<unknown>
  /** Сводное состояние пересчитывается из записей по файлам. */
  onSummary: (state: GrUploadState) => void
  onProgress: (info: GrUploadProgressInfo, file: File) => void
  onSuccess: (payload: unknown, file: File) => void
  onError: (error: unknown, file: File) => void
  onSetChange: (files: File[]) => void
}

export interface UsePerFileUploadReturn {
  entries: Ref<GrFileUploadEntry[]>
  entryOf: (file: File) => GrFileUploadEntry | undefined
  /** Загрузить набор пофайлово: у каждого файла свой запрос и свой статус. */
  run: (files: File[]) => Promise<void>
  /** Повторить один файл — соседей это не касается. */
  retryFile: (file: File) => Promise<void>
  /** Оборвать загрузку одного файла. */
  abortFile: (file: File) => void
  abortAll: () => void
  /** Убрать файл из набора записей и пересчитать сводное состояние. */
  dropEntry: (file: File) => void
  reset: () => void
}

/**
 * Пофайловый режим: у каждого файла свой запрос, свой контроллер и свой статус,
 * а сводное состояние выводится из них.
 */
export function usePerFileUpload(options: UsePerFileUploadOptions): UsePerFileUploadReturn {
  const entries = ref<GrFileUploadEntry[]>([])

  /** Контроллер на файл: `abortFile` обязан обрывать свой запрос, а не соседний. */
  const controllers = new Map<File, AbortController>()

  function syncSummary(): void {
    options.onSummary(summarizeFileEntries(entries.value))
  }

  function entryOf(file: File): GrFileUploadEntry | undefined {
    return entries.value.find(entry => entry.file === file)
  }

  function patch(file: File, next: Partial<GrFileUploadEntry>): void {
    const entry = entryOf(file)
    if (!entry) return

    Object.assign(entry, next)
    syncSummary()
  }

  async function uploadOne(file: File): Promise<void> {
    const controller = new AbortController()
    controllers.set(file, controller)
    patch(file, { status: 'uploading', percent: 0, error: undefined })

    const onProgress = (info: GrUploadProgressInfo): void => {
      patch(file, { percent: info.indeterminate ? 0 : info.percent })
      options.onProgress(info, file)
    }

    try {
      const payload = await options.send([file], { signal: controller.signal, onProgress })

      patch(file, { status: 'success', percent: 100, error: undefined })
      options.onSuccess(payload, file)
      options.onProgress({ percent: 100, loaded: 0, total: 0, indeterminate: false }, file)
    }
    catch (error) {
      // Отмена — не ошибка файла: строка возвращается в исходное состояние, а
      // пользователь решает, повторять её или убрать.
      if (error instanceof GrUploadAbortError || (error as { name?: string })?.name === 'AbortError')
        patch(file, { status: 'pending', percent: 0, error: undefined })
      else
        patch(file, { status: 'error', error })

      options.onError(error, file)
    }
    finally {
      controllers.delete(file)
    }
  }

  /**
   * Очередь с ограничением параллелизма. Без неё «пофайлово» означало бы «все
   * сразу»: сотня файлов открыла бы сотню соединений.
   */
  async function runWithConcurrency(files: File[]): Promise<void> {
    const limit = Math.max(1, Math.floor(options.concurrency()))
    const queue = [...files]

    const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) {
        const next = queue.shift()
        if (!next) return
        await uploadOne(next)
      }
    })

    await Promise.all(workers)
  }

  async function run(files: File[]): Promise<void> {
    entries.value = files.map(createFileEntry)
    syncSummary()

    await runWithConcurrency(files)
    options.onSetChange(files)
  }

  async function retryFile(file: File): Promise<void> {
    if (!entryOf(file)) return

    await uploadOne(file)
  }

  function abortFile(file: File): void {
    controllers.get(file)?.abort()
    controllers.delete(file)
  }

  function abortAll(): void {
    for (const controller of controllers.values()) controller.abort()
    controllers.clear()
  }

  function dropEntry(file: File): void {
    entries.value = entries.value.filter(entry => entry.file !== file)
  }

  function reset(): void {
    entries.value = []
  }

  return { entries, entryOf, run, retryFile, abortFile, abortAll, dropEntry, reset }
}
