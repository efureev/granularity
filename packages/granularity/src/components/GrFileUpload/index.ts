export { default } from './GrFileUpload.vue'
export { default as GrFileUpload } from './GrFileUpload.vue'
export type {
  GrFileUploadExtraData,
  GrFileUploadExtraDataValue,
  GrFileUploadProps,
  GrFileUploadRequest,
  GrFileUploadRequestCtx,
} from './GrFileUpload.vue'
export { grFileUploadConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrFileUploadConfigurableProps } from './defaults'
export type { GrFileUploadSize } from './grFileUploadStyles'
export { grFileUploadSafelist } from './safelist'
export type { GrUploadProgressInfo } from './uploadViaXhr'
export { GrUploadAbortError, GrUploadHttpError } from './uploadViaXhr'
export type {
  GrUploadPhase,
  GrUploadState,
  GrUploadStateError,
  GrUploadStateIdle,
  GrUploadStateSuccess,
  GrUploadStateUploading,
} from './uploadState'
export { GR_UPLOAD_STATE_IDLE } from './uploadState'
export * from '../../fileValidation'
