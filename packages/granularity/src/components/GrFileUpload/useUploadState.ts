import { reactive } from 'vue'

import { GR_UPLOAD_STATE_IDLE, type GrUploadState } from './uploadState'
import type { GrUploadProgressInfo } from './uploadViaXhr'

export interface UseUploadStateOptions {
  /** Компонент отчитывается о каждой смене фазы наружу. */
  onChange: (state: GrUploadState) => void
}

export interface UseUploadStateReturn {
  state: GrUploadState
  setIdle: () => void
  setUploading: (info?: GrUploadProgressInfo) => void
  setSuccess: (info: { loaded: number, total: number }) => void
  setError: (error: unknown) => void
  /** Прогресс не двигает состояние вне фазы `uploading`. */
  applyProgress: (info: GrUploadProgressInfo) => void
  assign: (next: GrUploadState) => void
  /** Отложенный переход `success` → `idle`. */
  scheduleIdle: (delayMs: number) => void
  clearScheduledIdle: () => void
}

/**
 * Сводное состояние загрузки: фаза, проценты и таймер скрытия успеха.
 *
 * Состояние — `reactive`-объект с меняющейся формой (у `error` есть поле
 * `error`, у `idle` его нет), поэтому при смене фазы старые ключи удаляются:
 * иначе `phase: 'idle'` тащил бы за собой `error` от прошлой попытки.
 */
export function useUploadState(options: UseUploadStateOptions): UseUploadStateReturn {
  const state = reactive<GrUploadState>({ ...GR_UPLOAD_STATE_IDLE }) as GrUploadState

  let idleTimer: ReturnType<typeof setTimeout> | null = null

  function clearScheduledIdle(): void {
    if (idleTimer === null) return

    clearTimeout(idleTimer)
    idleTimer = null
  }

  function assign(next: GrUploadState): void {
    // Форма состояния меняется вместе с фазой (`error` есть только у ошибки),
    // поэтому старые ключи снимаются: иначе `idle` тащил бы `error` прошлой
    // попытки.
    for (const key of Object.keys(state))
      delete (state as unknown as Record<string, unknown>)[key]

    Object.assign(state, next)
    options.onChange(state)
  }

  function setIdle(): void {
    assign({ ...GR_UPLOAD_STATE_IDLE })
  }

  function setUploading(info?: GrUploadProgressInfo): void {
    assign({
      phase: 'uploading',
      percent: info?.percent ?? 0,
      indeterminate: info?.indeterminate ?? true,
      loaded: info?.loaded ?? 0,
      total: info?.total ?? 0,
    })
  }

  function setSuccess(info: { loaded: number, total: number }): void {
    assign({
      phase: 'success',
      percent: 100,
      indeterminate: false,
      loaded: info.loaded,
      total: info.total,
    })
  }

  function setError(error: unknown): void {
    const prev = state
    assign({
      phase: 'error',
      percent: prev.phase === 'uploading' ? prev.percent : 0,
      indeterminate: false,
      loaded: prev.phase === 'uploading' ? prev.loaded : 0,
      total: prev.phase === 'uploading' ? prev.total : 0,
      error,
    })
  }

  function applyProgress(info: GrUploadProgressInfo): void {
    if (state.phase !== 'uploading') return

    assign({
      phase: 'uploading',
      percent: info.percent,
      indeterminate: info.indeterminate,
      loaded: info.loaded,
      total: info.total,
    })
  }

  function scheduleIdle(delayMs: number): void {
    clearScheduledIdle()
    idleTimer = setTimeout(() => {
      if (state.phase === 'success') setIdle()
      idleTimer = null
    }, delayMs)
  }

  return {
    state,
    setIdle,
    setUploading,
    setSuccess,
    setError,
    applyProgress,
    assign,
    scheduleIdle,
    clearScheduledIdle,
  }
}
