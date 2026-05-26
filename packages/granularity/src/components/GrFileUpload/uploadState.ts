/**
 * Состояние процесса загрузки в `GrFileUpload`.
 *
 * Используется как для внутреннего управления UI, так и пробрасывается наружу
 * через scoped-слоты (`progress`, `default`) и `defineExpose`.
 */

export type GrUploadPhase = 'idle' | 'uploading' | 'success' | 'error'

export interface GrUploadStateIdle {
  phase: 'idle'
  percent: 0
  indeterminate: false
  loaded: 0
  total: 0
}

export interface GrUploadStateUploading {
  phase: 'uploading'
  percent: number
  indeterminate: boolean
  loaded: number
  total: number
}

export interface GrUploadStateSuccess {
  phase: 'success'
  percent: 100
  indeterminate: false
  loaded: number
  total: number
}

export interface GrUploadStateError {
  phase: 'error'
  percent: number
  indeterminate: false
  loaded: number
  total: number
  error: unknown
}

export type GrUploadState =
  | GrUploadStateIdle
  | GrUploadStateUploading
  | GrUploadStateSuccess
  | GrUploadStateError

export const GR_UPLOAD_STATE_IDLE: GrUploadStateIdle = Object.freeze({
  phase: 'idle',
  percent: 0,
  indeterminate: false,
  loaded: 0,
  total: 0,
})
