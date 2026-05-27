import type { ResponseErrorKind, ResponseErrorTexts, ResponseErrorTone } from './responseError.types'

/**
 * Default English texts. Any field can be overridden via the `texts` prop
 * on `GrResponseErrorBanner` or the `texts` option of `useResponseError`.
 */
export const DEFAULT_RESPONSE_ERROR_TEXTS: ResponseErrorTexts = {
  networkTitle: 'No connection to the server',
  networkMessage: 'Check your internet connection and try again.',
  abortedTitle: 'Request cancelled',
  abortedMessage: 'The request was cancelled.',
  validationTitle: 'Check the data',
  validationMessage: 'The server returned a validation error. Fix the fields and try again.',
  clientTitle: 'Request error',
  clientMessage: 'The server rejected the request.',
  serverTitle: 'Server error',
  serverMessage: 'A server error occurred. Please try again.',
  unknownTitle: 'Something went wrong',
  unknownMessage: 'The operation could not be completed. Please try again.',
  retryLabel: 'Retry',
  dismissLabel: 'Dismiss',
}

/**
 * Маппинг `kind` → `tone` по умолчанию. Применяется внутри баннера, если
 * пользователь не передал `tone` или `toneByKind`. Цель — визуально отделить
 * «исправь ввод» (warning) от «упало по сети/серверу» (danger).
 */
export const DEFAULT_TONE_BY_KIND: Record<ResponseErrorKind, ResponseErrorTone> = {
  network: 'danger',
  aborted: 'info',
  validation: 'warning',
  client: 'warning',
  server: 'danger',
  unknown: 'danger',
}

/**
 * `kind`'ы, которые по умолчанию не показываются (баннер скрыт).
 * Семантика: отмена пользователем — не «ошибка», UI обычно тихо проглатывает.
 * Пользователь может переопределить через `autoHideKinds: []`, чтобы показать info-плашку.
 */
export const DEFAULT_AUTO_HIDE_KINDS: ResponseErrorKind[] = []
