import type { AppContext } from 'vue'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'
import type {
  ResponseErrorInfo,
  ResponseErrorParser,
  ResponseErrorParserPresets,
  ResponseErrorTexts,
} from '../GrResponseErrorBanner'

/** Действие, которым был закрыт диалог. */
export type DialogCloseAction = 'confirm' | 'cancel' | 'close'

/**
 * Конфигурация разбора серверных ошибок внутри `onConfirm`.
 *
 * По умолчанию используется универсальное «ядро» парсеров
 * (`coreResponseErrorParsers`) — безопасное для любого бэкенда. Подключение
 * серверо-специфичных парсеров (Laravel / RFC 7807 / JSON:API) — осознанное,
 * через `errorParsers`.
 */
export interface DialogErrorOptions {
  /**
   * Цепочка парсеров для классификации сырого ответа.
   * - не задано — `coreResponseErrorParsers`;
   * - массив — полная замена цепочки;
   * - `(presets) => ResponseErrorParser[]` — композиция из пресетов.
   */
  errorParsers?: ResponseErrorParser[] | ((presets: ResponseErrorParserPresets) => ResponseErrorParser[])
  /** Частичный override текстов-фолбэков баннера ошибок (i18n). */
  errorTexts?: Partial<ResponseErrorTexts>
  /** Имя поля основного сообщения в теле ответа (для `plainMessageParser`). */
  errorMessageKey?: string
  /** Человекочитаемые подписи полей для `fieldErrors`. */
  fieldLabels?: Record<string, string>
}

/**
 * Контекст, передаваемый в колбэк `onConfirm`. Позволяет управлять
 * жизненным циклом диалога во время асинхронной операции: показывать ошибки,
 * управлять лоадером, закрывать диалог.
 */
export interface DialogConfirmContext<V = unknown> {
  /** Введённое значение (для `prompt` — строка; для `confirm`/`alert` — `undefined`). */
  readonly value: V
  /** `AbortSignal`, прерывающийся при закрытии/отмене диалога. */
  readonly signal: AbortSignal

  /** Показать общую ошибку текстом. `null` — скрыть. */
  setError: (message: string | null) => void
  /**
   * Классифицировать «сырой» ответ (Response / axios / fetch error / Error /
   * строку / JSON) через цепочку парсеров: общий блок попадёт в баннер,
   * `fieldErrors` — на поля формы. Возвращает распознанную информацию.
   */
  setRawError: (raw: unknown, meta?: Record<string, unknown>) => Promise<ResponseErrorInfo | null>
  /** Привязать ошибку к конкретному полю (`prompt` — поле `value`). */
  setFieldError: (field: string, message: string | null) => void
  /** Сбросить все выставленные ошибки. */
  clearErrors: () => void

  /** Принудительно управлять состоянием загрузки кнопки Confirm. */
  setLoading: (loading: boolean) => void
  /** Закрыть диалог из колбэка. */
  close: (action?: DialogCloseAction) => void
}

/**
 * Колбэк, выполняемый при клике Confirm.
 *
 * Возврат:
 * - `resolved` / `true` / `void` — успех: диалог закрывается;
 * - `false` — оставить диалог открытым (без ошибки);
 * - `throw` / `rejected` — ошибка: диалог остаётся открытым, исключение
 *   автоматически прогоняется через `setRawError`.
 */
export type DialogOnConfirm<V = unknown> = (
  ctx: DialogConfirmContext<V>,
) => void | boolean | Promise<void | boolean>

/** Базовые опции, проксируемые в `GrDialog`/`GrModal`. */
export interface DialogBaseOptions extends DialogErrorOptions {
  title?: string
  /** Текст-сообщение в теле диалога. */
  message?: string
  description?: string
  size?: GrDialogSize
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  headerConfig?: GrDialogSectionConfig
  footerConfig?: GrDialogSectionConfig
  bodyConfig?: GrDialogSectionConfig
  closeLabel?: string
  buttonSize?: GrButtonSize
  confirmText?: string
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  /** Внешний `AbortSignal`: при abort диалог закрывается с `action: 'close'`. */
  signal?: AbortSignal
  /** Наследование контекста приложения (i18n / тема / `granular-provider`). */
  appContext?: AppContext | null
}

export interface DialogConfirmOptions extends DialogBaseOptions {
  cancelText?: string
  onConfirm?: DialogOnConfirm<undefined>
}

export interface DialogAlertOptions extends DialogBaseOptions {
  onConfirm?: DialogOnConfirm<undefined>
}

export interface DialogPromptOptions extends DialogBaseOptions {
  cancelText?: string
  /** Начальное значение поля ввода. */
  value?: string
  label?: string
  placeholder?: string
  required?: boolean
  requiredErrorText?: string
  onConfirm?: DialogOnConfirm<string>
}

/** Результат низкоуровневого `open()`. */
export interface DialogResult<V = unknown> {
  action: DialogCloseAction
  value?: V
}

/** Тип диалога. */
export type DialogKind = 'confirm' | 'alert' | 'prompt'

/** Промис вызова диалога с возможностью императивного закрытия. */
export type DialogPromise<T> = Promise<T> & {
  /** Закрыть диалог программно (как `action: 'close'`). */
  close: () => void
}

/** Дефолты сервиса, общие на приложение. */
export interface DialogServiceDefaults extends DialogErrorOptions {
  size?: GrDialogSize
  confirmText?: string
  cancelText?: string
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  buttonSize?: GrButtonSize
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}

/** Публичный API сервиса диалогов. */
export interface DialogService {
  confirm: (message: string, options?: DialogConfirmOptions) => DialogPromise<boolean>
  alert: (message: string, options?: DialogAlertOptions) => DialogPromise<void>
  prompt: (message: string, options?: DialogPromptOptions) => DialogPromise<string | null>
  open: <V = unknown>(kind: DialogKind, message: string, options?: DialogBaseOptions) => DialogPromise<DialogResult<V>>
  /** Закрыть все активные/ожидающие диалоги. */
  closeAll: () => void
  /** Явно зарегистрировать контекст приложения (для вызовов вне `setup`). */
  setAppContext: (ctx: AppContext | null) => void
}
