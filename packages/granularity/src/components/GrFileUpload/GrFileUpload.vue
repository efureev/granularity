<script setup lang="ts" generic="TResponse = unknown">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, Text, useSlots, type VNode } from 'vue'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconClose from '~icons/lucide/x'

import GrIcon from '../GrIcon/GrIcon.vue'
import GrProgressBar from '../GrProgressBar/GrProgressBar.vue'
import type { GrProgressBarTone } from '../GrProgressBar/grStyle'
import type { FileValidator, FileValidatorSource } from '../../fileValidation'
import type { GrUploadProgressInfo } from './uploadViaXhr'
import type { GrUploadState } from './uploadState'
import { createFileEntry, summarizeFileEntries, type GrFileUploadEntry } from './fileEntry'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { flattenSlotNodes, meaningfulSlotNodes } from '../shared/slotNodes'
import {
  type GrFileUploadSize,
  hintSizes,
  iconGlyphSizes,
  iconTileSizes,
  labelSizes,
  progressBarSizes,
  progressTextSizes,
  zoneGaps,
  zonePaddings,
} from './grFileUploadStyles'
import { acceptValidator, FileValidationError, runFileValidators } from '../../fileValidation'
import { GrUploadAbortError, uploadViaXhr } from './uploadViaXhr'
import { GR_UPLOAD_STATE_IDLE } from './uploadState'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
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

const props = withDefaults(
  defineProps<GrFileUploadProps<TResponse>>(),
  {
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

const zoneClass = computed(() => zonePaddings[resolvedSize.value])
const zoneGapClass = computed(() => zoneGaps[resolvedSize.value])
const iconTileClass = computed(() => iconTileSizes[resolvedSize.value])
const iconGlyphSize = computed(() => iconGlyphSizes[resolvedSize.value])
const labelClass = computed(() => labelSizes[resolvedSize.value])
const hintClass = computed(() => hintSizes[resolvedSize.value])
const progressTextClass = computed(() => progressTextSizes[resolvedSize.value])
const progressBarSize = computed(() => progressBarSizes[resolvedSize.value])

const emit = defineEmits<{
  /** Выбрано больше файлов, чем разрешает `limit`. Загрузка не стартует. */
  (e: 'exceed', files: File[], limit: number): void
  /** `file` приходит только в режиме `per-file`: в батче отчитываться нечем. */
  (e: 'success', payload: TResponse, file?: File): void
  (e: 'error', error: unknown, file?: File): void
  (e: 'progress', percent: number, info?: GrUploadProgressInfo, file?: File): void
  (e: 'change', files: File[]): void
  (e: 'stateChange', state: GrUploadState): void
}>()

const slots = useSlots()

const { t } = useGranularityTranslations()

// Контекст `GrFormField`: доступным контролом служит сам нативный
// `<input type="file">` — он и остаётся целью `<label for>`.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const { invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)
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
const isOver = ref(false)

let overCounter = 0

const lastFiles = ref<File[]>([])

const state = reactive<GrUploadState>({ ...GR_UPLOAD_STATE_IDLE }) as GrUploadState

/**
 * Состояние по файлам — только для `per-file`. В батче набор уходит одним
 * запросом, и статуса у отдельного файла не существует.
 */
const fileEntries = ref<GrFileUploadEntry[]>([])

/** Контроллер на файл: `abortFile` обязан обрывать свой запрос, а не соседний. */
const fileControllers = new Map<File, AbortController>()

let activeController: AbortController | null = null
let hideSuccessTimer: ReturnType<typeof setTimeout> | null = null

function clearHideSuccessTimer() {
  if (hideSuccessTimer !== null) {
    clearTimeout(hideSuccessTimer)
    hideSuccessTimer = null
  }
}

function assignState(next: GrUploadState) {
  // мутируем через Object.assign, чтобы сохранить reactive ссылку
  for (const key of Object.keys(state) as (keyof GrUploadState)[])
    delete (state as any)[key]
  Object.assign(state, next)
  emit('stateChange', state as GrUploadState)
}

function setStateIdle() {
  assignState({ ...GR_UPLOAD_STATE_IDLE })
}

function setStateUploading(info?: GrUploadProgressInfo) {
  assignState({
    phase: 'uploading',
    percent: info?.percent ?? 0,
    indeterminate: info?.indeterminate ?? true,
    loaded: info?.loaded ?? 0,
    total: info?.total ?? 0,
  })
}

function setStateSuccess(info: { loaded: number, total: number }) {
  assignState({
    phase: 'success',
    percent: 100,
    indeterminate: false,
    loaded: info.loaded,
    total: info.total,
  })
}

function setStateError(error: unknown) {
  const prev = state
  assignState({
    phase: 'error',
    percent: prev.phase === 'uploading' ? prev.percent : 0,
    indeterminate: false,
    loaded: prev.phase === 'uploading' ? prev.loaded : 0,
    total: prev.phase === 'uploading' ? prev.total : 0,
    error,
  })
}

function handleProgress(info: GrUploadProgressInfo) {
  if (state.phase !== 'uploading') return
  assignState({
    phase: 'uploading',
    percent: info.percent,
    indeterminate: info.indeterminate,
    loaded: info.loaded,
    total: info.total,
  })
  emit('progress', info.percent, info)
}

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

function setOver(next: boolean) {
  if (isOver.value === next) return
  isOver.value = next
}

function openDialog() {
  if (props.disabled) return
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
  if (props.disabled) return
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
  lastFiles.value = valid

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
  clearHideSuccessTimer()

  if (props.uploadMode === 'per-file') {
    await uploadPerFile(valid, extraData)
    return
  }

  const controller = new AbortController()
  activeController = controller

  // Батч: пофайловых записей нет, показываем набор без статусов.
  fileEntries.value = []

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

    if (props.hideProgressOnSuccess && props.hideProgressOnSuccess > 0) {
      hideSuccessTimer = setTimeout(() => {
        if (state.phase === 'success') setStateIdle()
        hideSuccessTimer = null
      }, props.hideProgressOnSuccess)
    }
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

/** Пересчитать сводное состояние из пофайловых записей. */
function syncStateFromEntries(): void {
  assignState(summarizeFileEntries(fileEntries.value))
}

function entryOf(file: File): GrFileUploadEntry | undefined {
  return fileEntries.value.find(entry => entry.file === file)
}

function patchEntry(file: File, patch: Partial<GrFileUploadEntry>): void {
  const entry = entryOf(file)
  if (!entry) return

  Object.assign(entry, patch)
  syncStateFromEntries()
}

/** Загрузка одного файла: свой контроллер, свой прогресс, свой статус. */
async function uploadSingleFile(file: File, extraData: GrFileUploadExtraData | undefined): Promise<void> {
  const controller = new AbortController()
  fileControllers.set(file, controller)
  patchEntry(file, { status: 'uploading', percent: 0, error: undefined })

  const onProgress = (info: GrUploadProgressInfo): void => {
    patchEntry(file, { percent: info.indeterminate ? 0 : info.percent })
    emit('progress', info.percent, info, file)
  }

  try {
    const payload = props.request
      ? await props.request([file], { signal: controller.signal, extraData, onProgress })
      : await uploadViaXhr({
          url: props.action ?? '',
          files: [file],
          name: props.name,
          headers: props.headers,
          withCredentials: props.withCredentials,
          extraData,
          signal: controller.signal,
          onProgress,
        }) as TResponse

    patchEntry(file, { status: 'success', percent: 100, error: undefined })
    emit('success', payload, file)
    emit('progress', 100, { percent: 100, loaded: 0, total: 0, indeterminate: false }, file)
  }
  catch (error) {
    // Отмена — не ошибка файла: строка возвращается в исходное состояние, а
    // пользователь решает, повторять её или убрать.
    if (error instanceof GrUploadAbortError || (error as { name?: string })?.name === 'AbortError') {
      patchEntry(file, { status: 'pending', percent: 0, error: undefined })
    }
    else {
      patchEntry(file, { status: 'error', error })
    }
    emit('error', error, file)
  }
  finally {
    fileControllers.delete(file)
  }
}

/**
 * Очередь с ограничением параллелизма. Без неё «пофайлово» означало бы «все
 * сразу»: сотня файлов открыла бы сотню соединений.
 */
async function runWithConcurrency(files: File[], extraData: GrFileUploadExtraData | undefined): Promise<void> {
  const limit = Math.max(1, Math.floor(props.concurrency))
  const queue = [...files]

  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const next = queue.shift()
      if (!next) return
      await uploadSingleFile(next, extraData)
    }
  })

  await Promise.all(workers)
}

async function uploadPerFile(files: File[], extraData: GrFileUploadExtraData | undefined): Promise<void> {
  fileEntries.value = files.map(createFileEntry)
  syncStateFromEntries()

  await runWithConcurrency(files, extraData)
  emit('change', files)
}

/** Повторить один файл — соседей это не касается. */
async function retryFile(file: File): Promise<void> {
  if (props.uploadMode !== 'per-file') return
  if (!entryOf(file)) return

  let extraData: GrFileUploadExtraData | undefined
  try {
    extraData = props.uploadExtraData?.([file])
  }
  catch (error) {
    emit('error', error, file)
    return
  }

  await uploadSingleFile(file, extraData)
}

/** Оборвать загрузку одного файла. */
function abortFile(file: File): void {
  fileControllers.get(file)?.abort()
  fileControllers.delete(file)
}

function onDragEnter(event: DragEvent) {
  if (hasCustomUi.value) return
  if (props.disabled) return
  event.preventDefault()
  overCounter += 1
  setOver(true)
}

function onDragOver(event: DragEvent) {
  if (hasCustomUi.value) return
  if (props.disabled) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function onDragLeave(event: DragEvent) {
  if (hasCustomUi.value) return
  if (props.disabled) return
  event.preventDefault()
  overCounter = Math.max(0, overCounter - 1)
  if (overCounter === 0) setOver(false)
}

function onDrop(event: DragEvent) {
  if (hasCustomUi.value) return
  if (props.disabled) return
  event.preventDefault()
  overCounter = 0
  setOver(false)

  const files = event.dataTransfer?.files ? Array.prototype.slice.call(event.dataTransfer.files) as File[] : []
  void handleFiles(files, 'drop')
}

async function onInputChange(event: Event) {
  if (props.disabled) return

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
const progressPercent = computed(() => (state.phase === 'uploading' && state.indeterminate ? 0 : state.percent))
const progressText = computed(() => {
  if (state.phase === 'uploading' && state.indeterminate) return ''
  return `${Math.round(progressPercent.value)}%`
})

/**
 * Стабильный ключ файла для списка. По имени ключ дублировался: два
 * одноимённых файла из разных папок ломали переиспользование `<li>` — заметно
 * стало ровно тогда, когда в строке появилась кнопка удаления.
 */
const fileKeys = new WeakMap<File, string>()
let fileKeyCounter = 0

function fileKey(file: File): string {
  const existing = fileKeys.get(file)
  if (existing !== undefined) return existing

  fileKeyCounter += 1
  const key = `gr-file-${fileKeyCounter}`
  fileKeys.set(file, key)
  return key
}

/**
 * Миниатюры превью: `object URL` живёт ровно столько, сколько файл в наборе.
 * Без отзыва blob висит в памяти вкладки до перезагрузки — утечка тем заметнее,
 * чем чаще пользователь перевыбирает файлы.
 */
const previewUrls = new Map<File, string>()

function previewUrl(file: File): string | undefined {
  if (!props.preview || !file.type.startsWith('image/')) return undefined

  const existing = previewUrls.get(file)
  if (existing) return existing

  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return undefined

  const url = URL.createObjectURL(file)
  previewUrls.set(file, url)
  return url
}

function revokePreview(file: File): void {
  const url = previewUrls.get(file)
  if (!url) return

  URL.revokeObjectURL(url)
  previewUrls.delete(file)
}

function revokeAllPreviews(): void {
  for (const file of [...previewUrls.keys()]) revokePreview(file)
}

const isPerFile = computed(() => props.uploadMode === 'per-file')

const statusTextByStatus = computed<Record<string, string>>(() => ({
  pending: t('gr.fileUpload.statusPending', 'Pending'),
  uploading: t('gr.fileUpload.statusUploading', 'Uploading'),
  success: t('gr.fileUpload.statusSuccess', 'Uploaded'),
  error: t('gr.fileUpload.statusError', 'Failed'),
}))

/** Запись файла для разметки: в батчевом режиме её нет — и статуса тоже. */
function entryFor(file: File): GrFileUploadEntry | undefined {
  return isPerFile.value ? entryOf(file) : undefined
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
  clearHideSuccessTimer()
  revokePreview(file)
  lastFiles.value = next
  fileEntries.value = fileEntries.value.filter(entry => entry.file !== file)

  // В пофайловом режиме остальные файлы своих статусов не теряют: удалили один
  // — сводное состояние просто пересчитывается по оставшимся.
  if (props.uploadMode === 'per-file' && fileEntries.value.length) syncStateFromEntries()
  else if (state.phase !== 'idle') setStateIdle()
}

function focus(): void {
  inputRef.value?.focus()
}

function blur(): void {
  inputRef.value?.blur()
}

// Незакрытые хвосты компонента: XHR продолжал качать файл, а таймер скрытия
// успеха — дёргать `setStateIdle()` уже на уничтоженном инстансе. Классический
// сценарий: успешная загрузка и уход со страницы сразу после неё.
// Ни `action`, ни `request` — загружать некуда, и узнать об этом на первом же
// выборе файла поздно. Выразить требование типом нельзя: `defineProps` в SFC
// принимает объектный тип или интерфейс, но не discriminated union.
onMounted(() => {
  if (process.env.NODE_ENV === 'production') return
  if (props.action || props.request) return

  console.warn('[GrFileUpload] не задан ни `action`, ни `request`: отправлять файлы некуда.')
})

onBeforeUnmount(() => {
  clearHideSuccessTimer()
  abort()
  for (const controller of fileControllers.values()) controller.abort()
  fileControllers.clear()
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
       презентационными, поэтому input внутри неё терялся для скринридеров и падал
       в axe на `nested-interactive`; а обёртывать его в собственный «button» —
       значит вручную переизобретать то, что file-input уже умеет нативно
       (открытие диалога с клавиатуры, объявление «кнопка выбора файла»).
       Зона остаётся кликабельной и принимает drag&drop, фокус input'а показывает
       через `focus-within`.

       Disabled показываем фоном, а не `opacity`: прозрачность разбавляет выверенные
       на AA токены текста и роняет контраст (та же грабля, что с
       `--showcase-text-subtle` в ANALYSIS §54). Раньше это пряталось за ролью-виджетом:
       axe не проверяет содержимое презентационных потомков. -->
  <div
    data-gr-file-upload
    :class="
      hasCustomUi
        ? 'inline-block'
        : [
            'relative w-full rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] outline-none transition',
            zoneClass,
            disabled
              ? 'bg-[var(--gr-muted)] cursor-not-allowed'
              : 'bg-[var(--gr-card)] cursor-pointer hover:bg-[var(--gr-muted)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--gr-bg)]',
            isOver && !disabled ? 'border-[var(--gr-ring)] bg-[var(--gr-muted)]' : '',
          ]
    "
    @click="onRootClick"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
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
      :tabindex="hasCustomUi || disabled ? -1 : 0"
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
      :disabled="disabled"
      @change="onInputChange"
    >

    <span
      data-gr-file-upload-live
      class="sr-only"
      role="status"
      aria-live="polite"
    >{{ liveMessage }}</span>

    <slot
      v-if="hasCustomUi"
      :open-dialog="openDialog"
      :abort="abort"
      :disabled="disabled"
      :files="lastFiles"
      :is-over="isOver"
      :state="state"
      :retry="retry"
      :remove-file="removeFile"
      :file-entries="fileEntries"
      :retry-file="retryFile"
      :abort-file="abortFile"
    />

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
            <slot>
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
              class="h-8 w-8 shrink-0 rounded object-cover border border-[var(--gr-brd)]"
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
                class="ml-auto text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded"
                :aria-label="t('gr.fileUpload.abortFile', 'Cancel upload of {fileName}', { fileName: file.name })"
                @click.stop="abortFile(file)"
              >
                <GrIcon :size="iconGlyphSize" aria-hidden="true">
                  <IconClose />
                </GrIcon>
              </button>

              <button
                v-else-if="entryFor(file)!.status === 'error' && !disabled && !isReadonly"
                data-gr-file-upload-retry-file
                type="button"
                class="ml-auto text-[var(--gr-danger-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded underline"
                :aria-label="t('gr.fileUpload.retryFile', 'Retry {fileName}', { fileName: file.name })"
                @click.stop="retryFile(file)"
              >
                {{ t('gr.fileUpload.retry', 'Retry upload') }}
              </button>
            </template>

            <button
              v-if="!disabled && !isReadonly"
              data-gr-file-upload-remove
              type="button"
              class="ml-auto text-[var(--gr-muted-fg)] hover:text-[var(--gr-danger-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded"
              :aria-label="t('gr.fileUpload.remove', 'Remove {fileName}', { fileName: file.name })"
              @click.stop="removeFile(file)"
            >
              <GrIcon :size="iconGlyphSize" aria-hidden="true">
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
            class="mt-3 transition-opacity duration-150"
            :class="progressVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            :aria-hidden="!progressVisible"
          >
            <div class="flex items-center gap-2">
              <GrProgressBar
                :value="progressPercent"
                :tone="effectiveProgressTone"
                :size="progressBarSize"
                :aria-label="resolvedProgressLabel"
              />
              <span
                data-gr-file-upload-progress-text
                class="text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums] min-w-[3ch] text-right"
                :class="progressTextClass"
              >{{ progressText }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>