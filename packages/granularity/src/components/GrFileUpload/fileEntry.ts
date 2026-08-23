import type { GrUploadState } from './uploadState'

/**
 * Состояние одного файла в пофайловом режиме (`uploadMode="per-file"`).
 *
 * Батчевый режим по-прежнему знает только сводное `GrUploadState`: весь набор
 * уходит одним запросом, и говорить про отдельный файл там нечем.
 */
export type GrFileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface GrFileUploadEntry {
  file: File
  status: GrFileUploadStatus
  /** Процент `0..100`. У `pending` — 0, у `success` — 100. */
  percent: number
  /** Причина ошибки, если `status === 'error'`. */
  error?: unknown
}

export function createFileEntry(file: File): GrFileUploadEntry {
  return { file, status: 'pending', percent: 0 }
}

/**
 * Сводное состояние набора: грузимся, пока грузится хоть один; ошибка, если
 * после завершения есть хоть одна; успех — когда успешны все.
 *
 * Процент — среднее по файлам, а не по байтам: у пофайловых запросов размеры
 * разные, и «взвешенная» полоса дёргалась бы назад, когда большой файл
 * стартует после маленького.
 */
export function summarizeFileEntries(entries: GrFileUploadEntry[]): GrUploadState {
  if (!entries.length)
    return { phase: 'idle', percent: 0, indeterminate: false, loaded: 0, total: 0 }

  const total = entries.length
  const percent = Math.round(entries.reduce((sum, entry) => sum + entry.percent, 0) / total)
  const failed = entries.filter(entry => entry.status === 'error')
  const active = entries.some(entry => entry.status === 'uploading' || entry.status === 'pending')

  if (active) {
    return {
      phase: 'uploading',
      percent,
      // Неопределённым считаем только самое начало: пока ни один файл не
      // отчитался, полоса не должна притворяться, что что-то знает.
      indeterminate: percent === 0,
      loaded: 0,
      total: 0,
    }
  }

  if (failed.length) {
    return {
      phase: 'error',
      percent,
      indeterminate: false,
      loaded: 0,
      total: 0,
      error: failed[0].error,
    }
  }

  return { phase: 'success', percent: 100, indeterminate: false, loaded: 0, total: 0 }
}
