<script setup lang="ts" generic="TResponse = unknown">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, Text, useSlots, watch, type VNode } from 'vue'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconClose from '~icons/lucide/x'

import GrIcon from '../GrIcon/GrIcon.vue'
import GrProgressBar from '../GrProgressBar/GrProgressBar.vue'
import type { GrProgressBarTone } from '../GrProgressBar/grStyle'
import type { FileValidator, FileValidatorSource } from '../../fileValidation'
import type { GrUploadProgressInfo } from './uploadViaXhr'
import type { GrUploadState } from './uploadState'
import { summarizeFileEntries, type GrFileUploadEntry } from './fileEntry'
import { useDropZone } from './useDropZone'
import { useFilePreviews } from '../../composables/internal/useFilePreviews'
import { usePerFileUpload } from './usePerFileUpload'
import { useUploadState } from './useUploadState'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { flattenSlotNodes, meaningfulSlotNodes } from '../shared/slotNodes'
import {
  type GrFileUploadSize,
  grFileUploadZoneClass,
  hintSizes,
  iconGlyphSizes,
  iconTileSizes,
  labelSizes,
  progressBarSizes,
  progressTextSizes,
  zoneGaps,
} from './grFileUploadStyles'
import { acceptValidator, FileValidationError, runFileValidators } from '../../fileValidation'
import { GrUploadAbortError, uploadViaXhr } from './uploadViaXhr'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export type GrFileUploadMode = 'batch' | 'per-file'

export type GrFileUploadExtraDataValue = string | Blob

export type GrFileUploadExtraData = Record<string, GrFileUploadExtraDataValue | GrFileUploadExtraDataValue[]>

export type GrFileUploadRequestCtx = {
  signal: AbortSignal
  extraData?: GrFileUploadExtraData
  /**
   * Колбэк прогресса аплоада. Пользовательский `request` (например, axios)
   * должен вызывать его из `onUploadProgress`, чтобы `GrFileUpload` отображал
   * прогресс через слот `progress` / дефолтный `GrProgressBar`.
   */
  onProgress?: (info: GrUploadProgressInfo) => void
}

export type GrFileUploadRequest<TResponse = unknown> = (
  files: File[],
  ctx: GrFileUploadRequestCtx,
) => Promise<TResponse>

/**
 * Пропы `GrFileUpload`.
 *
 * Либо `action` (URL для POST multipart/form-data), либо `request` — кастомный
 * загрузчик (например, через axios). Если переданы оба — приоритет у `request`.
 *
 * `placeholder` — надпись в дефолтном UI-варианте (без слота default).
 */
export interface GrFileUploadProps<TResponse = unknown> {
  /**
   * Набор файлов — тот, что показан в списке и уйдёт в `retry`.
   *
   * Проп **необязателен**: без него компонент держит набор сам. Передан —
   * набор следует за ним, и потребитель может очистить или подменить список
   * снаружи.
   */
  modelValue?: File[]
  action?: string
  request?: GrFileUploadRequest<TResponse>
  name?: string
  multiple?: boolean
  limit?: number
  /**
   * Guard перед отправкой. Остаётся пропом, а не эмитом, осознанно: эмит не
   * возвращает значения, а этот колбэк обязан ответить «пускать или нет».
   * Уведомления — `exceed`, `success`, `error`, `progress` — эмиты.
   */
  beforeUpload?: (file: File) => boolean | Promise<unknown>
  validators?: FileValidator[]
  /**
   * W3C `accept` для `<input type="file">` — и sugar к `acceptValidator(...)`.
   *
   * Только атрибута мало: он фильтрует системный диалог, но не drag&drop —
   * перетащить можно что угодно. Поэтому то же значение уходит и в валидаторы,
   * как в `GrFormFile`.
   */
  accept?: string
  /** `capture` для мобильной камеры/микрофона. */
  capture?: 'user' | 'environment'
  /** Выбор каталога целиком (`webkitdirectory`). Поддержка — Chromium и Safari. */
  directory?: boolean
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  headers?: Record<string, string>
  withCredentials?: boolean
  showFileList?: boolean
  uploadExtraData?: (files: File[]) => GrFileUploadExtraData | undefined
  /** i18n: надпись-подсказка в дефолтном UI. */
  placeholder?: string
  /** Показывать дефолтный прогресс-бар (если не используется слот `progress`). */
  showProgress?: boolean
  /** Цветовой тон полосы прогресса в фазе `uploading`. */
  progressTone?: GrProgressBarTone
  /** aria-label для прогресс-бара. */
  progressLabel?: string
  /** Через сколько мс после `success` скрыть прогресс-бар. `0` — не скрывать. */
  hideProgressOnSuccess?: number
  /** Размер дефолтного UI: поля дроп-зоны, плитка иконки, кегль подписей. */
  size?: GrFileUploadSize
  /**
   * Как уходит набор файлов:
   *
   * - `batch` (по умолчанию) — весь набор одним запросом. Про отдельный файл
   *   сказать нечего, поэтому и статуса у него нет;
   * - `per-file` — на каждый файл свой запрос (`request` зовётся с массивом из
   *   одного файла, контракт не меняется). Появляются статус и процент строки,
   *   `retryFile` и `abortFile`.
   */
  uploadMode?: GrFileUploadMode
  /** Сколько файлов грузится одновременно в режиме `per-file`. */
  concurrency?: number
  /** Миниатюры для `image/*` в списке файлов. */
  preview?: boolean
}

export interface GrFileUploadEmits<TResponse = unknown> {
  /** Набор файлов сменился: новый выбор или удаление. Не путать с `change`. */
  (e: 'update:modelValue', files: File[]): void
  /** Выбрано больше файлов, чем разрешает `limit`. Загрузка не стартует. */
  (e: 'exceed', files: File[], limit: number): void
  /** `file` приходит только в режиме `per-file`: в батче отчитываться нечем. */
  (e: 'success', payload: TResponse, file?: File): void
  (e: 'error', error: unknown, file?: File): void
  (e: 'progress', percent: number, info?: GrUploadProgressInfo, file?: File): void
  (e: 'change', files: File[]): void
  (e: 'stateChange', state: GrUploadState): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(
  defineProps<GrFileUploadProps<TResponse>>(),
  {
    modelValue: undefined,
    action: undefined,
    request: undefined,
    name: 'file',
    multiple: false,
    limit: undefined,
    beforeUpload: undefined,
    validators: undefined,
    accept: undefined,
    capture: undefined,
    directory: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    headers: undefined,
    withCredentials: false,
    showFileList: false,
    uploadExtraData: undefined,
    placeholder: undefined,
    showProgress: true,
    progressTone: 'primary',
    progressLabel: undefined,
    hideProgressOnSuccess: 800,
    size: undefined,
    uploadMode: 'batch',
    concurrency: 3,
    preview: false,
  },
)

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrFileUpload' })

const zoneGapClass = computed(() => zoneGaps[resolvedSize.value])
const iconTileClass = computed(() => iconTileSizes[resolvedSize.value])
const iconGlyphSize = computed(() => iconGlyphSizes[resolvedSize.value])
const labelClass = computed(() => labelSizes[resolvedSize.value])
const hintClass = computed(() => hintSizes[resolvedSize.value])
const progressTextClass = computed(() => progressTextSizes[resolvedSize.value])
const progressBarSize = computed(() => progressBarSizes[resolvedSize.value])

const emit = defineEmits<GrFileUploadEmits<TResponse>>()
defineSlots<{
  /** Полностью своя зона загрузки: контрол отдаёт наружу всё своё состояние. */
  default?: (props: {
    openDialog: () => void
    abort: () => void
    disabled: boolean
    files: File[]
    isOver: boolean
    state: GrUploadState
    retry: () => Promise<void>
    removeFile: (file: File) => void
    fileEntries: GrFileUploadEntry[]
    retryFile: (file: File) => Promise<void>
    abortFile: (file: File) => void
  }) => any
  /** Заголовок зоны вместо `placeholder`. */
  label?: () => any
  /** Подпись под заголовком: ограничения по типу и размеру. */
  tip?: () => any
  /** Свой индикатор прогресса вместо встроенного. */
  progress?: (props: {
    state: GrUploadState
    percent: number
    indeterminate: boolean
    phase: GrUploadState['phase']
    files: File[]
    abort: () => void
    retry: () => Promise<void>
    fileEntries: GrFileUploadEntry[]
    retryFile: (file: File) => Promise<void>
    abortFile: (file: File) => void
  }) => any
}>()


const slots = useSlots()

const { t } = useGranularityTranslations()

// Контекст `GrFormField`: доступным контролом служит сам нативный
// `<input type="file">` — он и остаётся целью `<label for>`.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  readonly: isReadonly,
  invalid: isInvalid,
  required: isRequired,
  // `locked` — «ввод не принимается»: `disabled` или `readonly`. Набор в
  // `readonly` виден и уходит в форму, но поменять его нельзя.
  locked: isLocked,
} = useGrFormControl(() => props)
const resolvedPlaceholder = computed(() => props.placeholder ?? t('gr.fileUpload.placeholder', 'Drag files here or click to select'))
const resolvedProgressLabel = computed(() => props.progressLabel ?? t('gr.fileUpload.progress', 'Upload progress'))

function slotIsTextOnly(nodes: VNode[]): boolean {
  const meaningful = meaningfulSlotNodes(nodes)

  if (meaningful.length === 0) return true

  for (const node of meaningful) {
    if (node.type !== Text) return false
  }

  return true
}

const defaultSlotNodes = computed(() => {
  return slots.default ? flattenSlotNodes(slots.default({} as any)) : []
})

const hasCustomUi = computed(() => {
  return !!slots.default && !slotIsTextOnly(defaultSlotNodes.value)
})

const inputRef = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

// Внутри зоны фокус ходит между нативным input'ом и кнопками списка файлов:
// без границы каждое перемещение давало бы потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

const lastFiles = ref<File[]>(props.modelValue ? [...props.modelValue] : [])

/**
 * Набор меняется только здесь: иначе `update:modelValue` рано или поздно
 * разошёлся бы с тем, что показано в списке.
 */
function setFiles(next: File[]): void {
  lastFiles.value = next
  emit('update:modelValue', next)
}

// Контролируемый режим: проп задан — он и есть источник истины.
watch(() => props.modelValue, (next) => {
  if (next === undefined) return
  if (next === lastFiles.value) return

  lastFiles.value = [...next]
}, { deep: false })

const {
  state,
  setIdle: setStateIdle,
  setUploading: setStateUploading,
  setSuccess: setStateSuccess,
  setError: setStateError,
  applyProgress,
  assign: assignState,
  scheduleIdle,
  clearScheduledIdle,
} = useUploadState({ onChange: next => emit('stateChange', next) })

let activeController: AbortController | null = null

function handleProgress(info: GrUploadProgressInfo) {
  applyProgress(info)
  emit('progress', info.percent, info)
}

const { fileKey, previewUrl, revokePreview, revokeAllPreviews } = useFilePreviews({
  enabled: () => props.preview,
})

/**
 * `extraData` считается один раз на набор и не меняется между файлами, поэтому
 * живёт рядом с очередью, а не путешествует через её контракт.
 */
let perFileExtraData: GrFileUploadExtraData | undefined

const perFile = usePerFileUpload({
  concurrency: () => props.concurrency,
  send: (files, ctx) => (props.request
    ? props.request(files, { signal: ctx.signal, extraData: perFileExtraData, onProgress: ctx.onProgress })
    : uploadViaXhr({
        url: props.action ?? '',
        files,
        name: props.name,
        headers: props.headers,
        withCredentials: props.withCredentials,
        extraData: perFileExtraData,
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      })),
  onSummary: assignState,
  onProgress: (info, file) => emit('progress', info.percent, info, file),
  onSuccess: (payload, file) => emit('success', payload as TResponse, file),
  onError: (error, file) => emit('error', error, file),
  onSetChange: files => emit('change', files),
})

const fileEntries = perFile.entries
const { retryFile, abortFile } = perFile

const dropZone = useDropZone({
  locked: () => isLocked.value,
  inactive: () => hasCustomUi.value,
  onDrop: files => void handleFiles(files, 'drop'),
})
const isOver = dropZone.isOver

/**
 * Дефолтный слот вызывается из двух мест — как своя зона целиком и как подпись
 * внутри стандартной. Набор пропов у него один: две копии разъехались бы.
 */
const defaultSlotProps = computed(() => ({
  openDialog,
  abort,
  disabled: isDisabled.value,
  files: lastFiles.value,
  isOver: isOver.value,
  state,
  retry,
  removeFile,
  fileEntries: fileEntries.value,
  retryFile,
  abortFile,
}))


const zoneClass = computed(() => grFileUploadZoneClass({
  size: resolvedSize.value,
  disabled: isDisabled.value,
  readonly: isReadonly.value,
  over: isOver.value,
}))

const hiddenInputStyle = {
  position: 'fixed',
  top: '-9999px',
  left: '-9999px',
  width: '1px',
  height: '1px',
  opacity: '0',
  overflow: 'hidden',
  pointerEvents: 'none',
} as const satisfies Record<string, string>

function openDialog() {
  if (isLocked.value) return
  inputRef.value?.click()
}

function abort() {
  activeController?.abort()
  activeController = null
}

function totalSizeOf(files: File[]): number {
  return files.reduce((sum, file) => sum + file.size, 0)
}

function normalizeLimit(limit: number | undefined): number | undefined {
  if (typeof limit !== 'number') return undefined
  if (!Number.isFinite(limit)) return undefined
  if (limit <= 0) return undefined
  return Math.floor(limit)
}


async function uploadViaAction(files: File[], signal: AbortSignal, extraData: GrFileUploadExtraData | undefined) {
  if (!props.action) throw new Error('GrFileUpload: either `action` or `request` must be provided')

  return uploadViaXhr({
    url: props.action,
    files,
    name: props.name,
    headers: props.headers,
    withCredentials: props.withCredentials,
    extraData,
    signal,
    onProgress: handleProgress,
  })
}

async function runBeforeUpload(files: File[]): Promise<'ok' | { aborted: true; reason: unknown }> {
  if (!props.beforeUpload) return 'ok'

  for (const file of files) {
    try {
      const result = props.beforeUpload(file)

      if (result === false) {
        return { aborted: true, reason: new Error('Upload aborted by beforeUpload') }
      }

      if (result && typeof (result as any).then === 'function')
        await result
    } catch (error) {
      return { aborted: true, reason: error }
    }
  }

  return 'ok'
}

/**
 * `accept` идёт первым валидатором: атрибут на input фильтрует только диалог,
 * а drop мимо него проходит.
 */
function effectiveValidators(): FileValidator[] {
  return [acceptValidator(props.accept), ...(props.validators ?? [])]
}

/**
 * Номер запуска. Валидация и `beforeUpload` асинхронны, поэтому два быстрых
 * выбора подряд идут внахлёст: без номера «побеждал» тот, чьи валидаторы
 * отработали позже, — он же обрывал уже стартовавшую загрузку соседа.
 * Актуален всегда последний выбор, остальные тихо сходят с дистанции.
 */
let runCounter = 0

async function handleFiles(files: File[], source: FileValidatorSource = 'input') {
  if (isLocked.value) return
  if (!files.length) return

  runCounter += 1
  const runId = runCounter
  const isStale = (): boolean => runId !== runCounter

  const normalizedLimit = normalizeLimit(props.limit)
  if (props.multiple && normalizedLimit && files.length > normalizedLimit) {
    emit('exceed', files, normalizedLimit)
    emit('error', new Error(`Too many files selected, limit=${normalizedLimit}`))
    return
  }

  const { files: valid, issues } = await runFileValidators(files, effectiveValidators(), {
    source,
    multiple: props.multiple,
  })

  if (isStale()) return

  if (issues.length > 0) {
    emit('error', new FileValidationError(issues, valid))
    return
  }

  if (!valid.length) return

  // Набор сменился — миниатюры прежнего больше не нужны.
  revokeAllPreviews()
  setFiles(valid)

  const before = await runBeforeUpload(valid)
  if (isStale()) return

  if (before !== 'ok') {
    emit('error', before.reason)
    return
  }

  let extraData: GrFileUploadExtraData | undefined
  try {
    extraData = props.uploadExtraData?.(valid)
  } catch (error) {
    emit('error', error)
    return
  }

  abort()
  clearScheduledIdle()

  if (props.uploadMode === 'per-file') {
    perFileExtraData = extraData
    await perFile.run(valid)
    return
  }

  const controller = new AbortController()
  activeController = controller

  // Батч: пофайловых записей нет, показываем набор без статусов.
  perFile.reset()

  setStateUploading()
  emit('progress', 0, { percent: 0, loaded: 0, total: 0, indeterminate: true })

  try {
    // `action`-ветка отдаёт разобранный ответ сервера: типом его знает только
    // потребитель, поэтому приводим к его же `TResponse`.
    const payload = (props.request
      ? await props.request(valid, { signal: controller.signal, extraData, onProgress: handleProgress })
      : await uploadViaAction(valid, controller.signal, extraData)) as TResponse

    // Кастомный `request` не обязан звать `onProgress` — тогда байты неизвестны.
    // Сумма размеров выбранных файлов честнее нуля: «100%» при `total: 0`
    // потребитель прочитает как «загружено ноль».
    const measured = state.phase === 'uploading' ? state.total || state.loaded : 0
    const finalLoaded = measured || totalSizeOf(valid)
    setStateSuccess({ loaded: finalLoaded, total: finalLoaded })
    emit('success', payload)
    emit('change', valid)
    emit('progress', 100, { percent: 100, loaded: finalLoaded, total: finalLoaded, indeterminate: false })

    if (props.hideProgressOnSuccess && props.hideProgressOnSuccess > 0)
      scheduleIdle(props.hideProgressOnSuccess)
  } catch (error) {
    if (error instanceof GrUploadAbortError) {
      setStateIdle()
    } else {
      setStateError(error)
    }
    emit('error', error)
  } finally {
    if (activeController === controller) activeController = null
  }
}

/**
 * `<input type="file">` не понимает `readonly` — атрибута для него в HTML нет.
 * Поэтому системный диалог гасим отменой действия по умолчанию: input остаётся
 * в порядке `Tab` и объявляется как «только чтение», но нового файла не примет.
 */
function onInputClick(event: MouseEvent) {
  if (isReadonly.value && !isDisabled.value) event.preventDefault()
}

async function onInputChange(event: Event) {
  if (isLocked.value) return

  const target = event.target as HTMLInputElement | null
  const files = target?.files ? Array.prototype.slice.call(target.files) as File[] : []

  if (target) target.value = ''

  await nextTick()
  await handleFiles(files, 'input')
}

// Клавиатуры на зоне нет: Enter/Space обрабатывает сам file-input, на котором и
// стоит фокус. Собственный обработчик здесь только дублировал бы нативный и
// открывал диалог дважды.
function onRootClick(event: MouseEvent) {
  if (hasCustomUi.value) return
  // `openDialog` кликает по input программно, и этот клик всплывает обратно сюда.
  // Без отсечки зона открывала бы диалог по кругу.
  if (event.target === inputRef.value) return

  openDialog()
}

const effectiveProgressTone = computed<GrProgressBarTone>(() => {
  if (state.phase === 'error') return 'danger'
  if (state.phase === 'success') return 'success'
  return props.progressTone
})

/**
 * Живой регион существует с первого рендера и пуст, пока объявлять нечего:
 * регион, появляющийся сразу с текстом, часть AT не объявляет вовсе. Прогресс
 * в процентах сюда не идёт — диктор захлебнётся; объявляются только фазы.
 */
const liveMessage = computed(() => {
  if (state.phase === 'uploading') return t('gr.fileUpload.uploading', 'Uploading…')
  if (state.phase === 'success') return t('gr.fileUpload.success', 'Upload complete')
  if (state.phase === 'error') return t('gr.fileUpload.error', 'Upload failed')
  return ''
})

const progressVisible = computed(() => state.phase !== 'idle')
const progressIndeterminate = computed(() => state.phase === 'uploading' && state.indeterminate)
const progressPercent = computed(() => (progressIndeterminate.value ? 0 : state.percent))
const progressText = computed(() => {
  if (progressIndeterminate.value) return ''
  return `${Math.round(progressPercent.value)}%`
})

const isPerFile = computed(() => props.uploadMode === 'per-file')

const statusTextByStatus = computed<Record<string, string>>(() => ({
  pending: t('gr.fileUpload.statusPending', 'Pending'),
  uploading: t('gr.fileUpload.statusUploading', 'Uploading'),
  success: t('gr.fileUpload.statusSuccess', 'Uploaded'),
  error: t('gr.fileUpload.statusError', 'Failed'),
}))

/** Запись файла для разметки: в батчевом режиме её нет — и статуса тоже. */
function entryFor(file: File): GrFileUploadEntry | undefined {
  return isPerFile.value ? perFile.entryOf(file) : undefined
}

/** Повторить загрузку текущего набора — после ошибки выбирать файлы заново незачем. */
async function retry(): Promise<void> {
  if (!lastFiles.value.length) return

  await handleFiles([...lastFiles.value], 'input')
}

/**
 * Убрать файл из набора. Идущая загрузка при этом обрывается: она была про
 * прежний набор, и её результат к новому отношения не имеет.
 */
function removeFile(file: File): void {
  const next = lastFiles.value.filter(item => item !== file)
  if (next.length === lastFiles.value.length) return

  abortFile(file)
  abort()
  clearScheduledIdle()
  revokePreview(file)
  setFiles(next)
  perFile.dropEntry(file)

  // В пофайловом режиме остальные файлы своих статусов не теряют: удалили один
  // — сводное состояние просто пересчитывается по оставшимся.
  if (props.uploadMode === 'per-file' && fileEntries.value.length) assignState(summarizeFileEntries(fileEntries.value))
  else if (state.phase !== 'idle') setStateIdle()
}

function focus(): void {
  inputRef.value?.focus()
}

function blur(): void {
  inputRef.value?.blur()
}

// Ни `action`, ни `request` — загружать некуда, и узнать об этом на первом же
// выборе файла поздно. Выразить требование типом нельзя: `defineProps` в SFC
// принимает объектный тип или интерфейс, но не discriminated union.
onMounted(() => {
  if (process.env.NODE_ENV === 'production') return
  if (props.action || props.request) return

  console.warn('[GrFileUpload] не задан ни `action`, ни `request`: отправлять файлы некуда.')
})

// Хвосты, переживающие размонтирование: незавершённый XHR продолжает качать
// файл, а таймер скрытия успеха дёргает `setStateIdle()` на уничтоженном
// инстансе. Сценарий обычный — успешная загрузка и уход со страницы сразу после.
onBeforeUnmount(() => {
  clearScheduledIdle()
  abort()
  perFile.abortAll()
  revokeAllPreviews()
})

defineExpose({
  focus,
  blur,
  uploadFiles: handleFiles,
  abort,
  openDialog,
  state,
  /** Текущий набор файлов — тот, что показан в списке и уйдёт в `retry`. */
  files: lastFiles,
  retry,
  removeFile,
  /** Записи по файлам — пусты в батчевом режиме. */
  fileEntries,
  retryFile,
  abortFile,
})
</script>

<template>
  <!-- Drop-zone намеренно БЕЗ `role="button"` и `tabindex`: доступным контролом
       служит сам нативный `<input type="file">`. Роль-виджет объявляет потомков
       презентационными, поэтому input внутри неё теряется для скринридеров и
       падает в axe на `nested-interactive`; а обёртывать его в собственный
       «button» — значит вручную переизобретать то, что file-input уже умеет
       нативно (открытие диалога с клавиатуры, объявление «кнопка выбора файла»).
       Зона остаётся кликабельной и принимает drag&drop, фокус input'а показывает
       через `focus-within`. -->
  <div
    ref="rootEl"
    data-gr-file-upload
    :class="hasCustomUi ? 'inline-block' : zoneClass"
    @click="onRootClick"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @dragenter="dropZone.onDragEnter"
    @dragover="dropZone.onDragOver"
    @dragleave="dropZone.onDragLeave"
    @drop="dropZone.onDropFiles"
  >
    <!-- В custom-UI контрол рисует слот (он и вызывает `openDialog`), поэтому там
         input прячется и от таба, и от дерева доступности — иначе получим два
         контрола на один смысл. -->
    <input
      :id="fieldId"
      ref="inputRef"
      data-gr-file-upload-input
      :style="hiddenInputStyle"
      type="file"
      :tabindex="hasCustomUi || isDisabled ? -1 : 0"
      :aria-hidden="hasCustomUi ? 'true' : undefined"
      :aria-label="ariaLabel ?? (hasCustomUi ? undefined : resolvedPlaceholder)"
      :aria-describedby="describedBy"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :name="name"
      :accept="accept"
      :capture="capture"
      :webkitdirectory="directory || undefined"
      :multiple="multiple"
      :disabled="isDisabled"
      @click="onInputClick"
      @change="onInputChange"
    >

    <span
      data-gr-file-upload-live
      class="sr-only"
      role="status"
      aria-live="polite"
    >{{ liveMessage }}</span>

    <slot v-if="hasCustomUi" v-bind="defaultSlotProps" />

    <div v-else class="flex items-start" :class="zoneGapClass">
      <div
        data-gr-file-upload-icon
        class="shrink-0 bg-[var(--gr-muted)] border border-[var(--gr-brd)] flex items-center justify-center"
        :class="iconTileClass"
        aria-hidden="true"
      >
        <GrIcon class="text-[var(--gr-muted-fg)]" :size="iconGlyphSize">
          <IconArrowUp />
        </GrIcon>
      </div>

      <div class="min-w-0">
        <div data-gr-file-upload-label class="font-700" :class="labelClass">
          <slot name="label">
            <slot v-bind="defaultSlotProps">
              {{ resolvedPlaceholder }}
            </slot>
          </slot>
        </div>

        <div v-if="$slots.tip" data-gr-file-upload-tip class="mt-1 text-[var(--gr-muted-fg)]" :class="hintClass">
          <slot name="tip" />
        </div>
        <div v-else class="mt-1 text-[var(--gr-muted-fg)]" :class="hintClass" />

        <ul v-if="showFileList && lastFiles.length" data-gr-file-upload-list class="mt-3 space-y-1">
          <li
            v-for="file in lastFiles"
            :key="fileKey(file)"
            data-gr-file-upload-item
            class="flex items-center gap-2"
            :class="hintClass"
          >
            <img
              v-if="previewUrl(file)"
              data-gr-file-upload-preview
              :src="previewUrl(file)"
              alt=""
              class="h-8 w-8 shrink-0 rounded-[var(--gr-radius-sm)] object-cover border border-[var(--gr-brd)]"
            >
            <span class="font-600">{{ file.name }}</span>
            <span class="text-[var(--gr-muted-fg)]"> · {{ Math.ceil(file.size / 1024) }} KB</span>

            <template v-if="entryFor(file)">
              <span
                data-gr-file-upload-status
                :data-status="entryFor(file)!.status"
                class="text-[var(--gr-muted-fg)]"
              >· {{ statusTextByStatus[entryFor(file)!.status] }}<template
                v-if="entryFor(file)!.status === 'uploading'"
              >&nbsp;{{ Math.round(entryFor(file)!.percent) }}%</template></span>

              <button
                v-if="entryFor(file)!.status === 'uploading'"
                data-gr-file-upload-abort-file
                type="button"
                class="ml-auto text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded-[var(--gr-radius-sm)]"
                :aria-label="t('gr.fileUpload.abortFile', 'Cancel upload of {fileName}', { fileName: file.name })"
                @click.stop="abortFile(file)"
              >
                <GrIcon :size="iconGlyphSize">
                  <IconClose />
                </GrIcon>
              </button>

              <button
                v-else-if="entryFor(file)!.status === 'error' && !isDisabled && !isReadonly"
                data-gr-file-upload-retry-file
                type="button"
                class="ml-auto text-[var(--gr-danger-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded-[var(--gr-radius-sm)] underline"
                :aria-label="t('gr.fileUpload.retryFile', 'Retry {fileName}', { fileName: file.name })"
                @click.stop="retryFile(file)"
              >
                {{ t('gr.fileUpload.retry', 'Retry upload') }}
              </button>
            </template>

            <button
              v-if="!isDisabled && !isReadonly"
              data-gr-file-upload-remove
              type="button"
              class="ml-auto text-[var(--gr-muted-fg)] hover:text-[var(--gr-danger-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded-[var(--gr-radius-sm)]"
              :aria-label="t('gr.fileUpload.remove', 'Remove {fileName}', { fileName: file.name })"
              @click.stop="removeFile(file)"
            >
              <GrIcon :size="iconGlyphSize">
                <IconClose />
              </GrIcon>
            </button>
          </li>
        </ul>

        <slot
          v-if="showProgress || $slots.progress"
          name="progress"
          :state="state"
          :percent="state.percent"
          :indeterminate="state.phase === 'uploading' && state.indeterminate"
          :phase="state.phase"
          :files="lastFiles"
          :abort="abort"
          :retry="retry"
          :file-entries="fileEntries"
          :retry-file="retryFile"
          :abort-file="abortFile"
        >
          <div
            v-if="showProgress"
            data-gr-file-upload-progress
            class="mt-3 transition-opacity duration-[var(--gr-duration-fast)]"
            :class="progressVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            :aria-hidden="!progressVisible"
          >
            <div class="flex items-center gap-2">
              <GrProgressBar
                :value="progressPercent"
                :indeterminate="progressIndeterminate"
                :tone="effectiveProgressTone"
                :size="progressBarSize"
                :aria-label="resolvedProgressLabel"
              />
              <span
                data-gr-file-upload-progress-text
                class="text-[var(--gr-muted-fg)] tabular-nums min-w-[3ch] text-right"
                :class="progressTextClass"
              >{{ progressText }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>