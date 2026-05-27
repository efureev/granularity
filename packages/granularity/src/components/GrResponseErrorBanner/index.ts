// Components
export { default } from './GrResponseErrorBanner.vue'
export { default as GrResponseErrorBanner } from './GrResponseErrorBanner.vue'
export { default as GrUploadErrorBanner } from './GrUploadErrorBanner.vue'
export { default as GrFormErrorBanner } from './GrFormErrorBanner.vue'

// Composable
export {
  DEFAULT_RESPONSE_ERROR_TEXTS,
  useResponseError,
} from './useResponseError'
export type {
  UseResponseErrorOptions,
  UseResponseErrorReturn,
} from './useResponseError'

// Defaults
export {
  DEFAULT_AUTO_HIDE_KINDS,
  DEFAULT_TONE_BY_KIND,
} from './responseError.defaults'

// Parsers & classifier
export {
  abortErrorParser,
  createResponseErrorClassifier,
  defaultResponseErrorParsers,
  extendDefaultParsers,
  fileValidationParser,
  httpStatusParser,
  jsonApiErrorParser,
  laravelValidationParser,
  networkErrorParser,
  normalizeError,
  plainMessageParser,
  problemDetailsParser,
  resolveResponseErrorTitle,
} from './parsers'
export type { CreateResponseErrorClassifierOptions } from './parsers'

// Types
export type {
  NormalizedRawError,
  ResponseErrorContext,
  ResponseErrorFieldError,
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorParser,
  ResponseErrorParserResult,
  ResponseErrorTexts,
  ResponseErrorTone,
} from './responseError.types'
