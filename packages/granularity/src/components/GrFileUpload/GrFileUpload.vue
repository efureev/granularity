<script setup lang="ts">
import { Comment, computed, Fragment, nextTick, reactive, ref, Text, useSlots, type VNode } from 'vue'

import IconArrowUp from '~icons/lucide/arrow-up'

import GrIcon from '../GrIcon/GrIcon.vue'
import GrProgressBar from '../GrProgressBar/GrProgressBar.vue'
import type { GrProgressBarTone } from '../GrProgressBar/grStyle'
import type { FileValidator, FileValidatorSource } from '../../fileValidation'
import type { GrUploadProgressInfo } from './uploadViaXhr'
import type { GrUploadState } from './uploadState'

import { FileValidationError, runFileValidators } from '../../fileValidation'
import { GrUploadAbortError, uploadViaXhr } from './uploadViaXhr'
import { GR_UPLOAD_STATE_IDLE } from './uploadState'

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

export type GrFileUploadRequest = (files: File[], ctx: GrFileUploadRequestCtx) => Promise<any>

/**
 * Пропы `GrFileUpload`.
 *
 * Либо `action` (URL для POST multipart/form-data), либо `request` — кастомный
 * загрузчик (например, через axios). Если переданы оба — приоритет у `request`.
 *
 * `placeholder` — надпись в дефолтном UI-варианте (без слота default).
 */
export interface GrFileUploadProps {
  action?: string
  request?: GrFileUploadRequest
  name?: string
  multiple?: boolean
  limit?: number
  onExceed?: (files: File[], limit: number) => void
  beforeUpload?: (file: File) => boolean | Promise<unknown>
  validators?: FileValidator[]
  disabled?: boolean
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
}

const props = withDefaults(
  defineProps<GrFileUploadProps>(),
  {
    action: undefined,
    request: undefined,
    name: 'file',
    multiple: false,
    limit: undefined,
    onExceed: undefined,
    beforeUpload: undefined,
    validators: undefined,
    disabled: false,
    headers: undefined,
    withCredentials: false,
    showFileList: false,
    uploadExtraData: undefined,
    placeholder: 'Drag files here or click to select',
    showProgress: true,
    progressTone: 'primary',
    progressLabel: 'Upload progress',
    hideProgressOnSuccess: 800,
  },
)

const emit = defineEmits<{
  (e: 'success', payload: any): void
  (e: 'error', error: unknown): void
  (e: 'progress', percent: number, info?: GrUploadProgressInfo): void
  (e: 'change', files: File[]): void
  (e: 'stateChange', state: GrUploadState): void
}>()

const slots = useSlots()

function flattenSlotNodes(nodes: VNode[]): VNode[] {
  const out: VNode[] = []

  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...flattenSlotNodes(node.children as VNode[]))
      continue
    }

    out.push(node)
  }

  return out
}

function isWhitespaceTextNode(node: VNode): boolean {
  if (node.type !== Text) return false
  return typeof node.children === 'string' && node.children.trim().length === 0
}

function slotIsTextOnly(nodes: VNode[]): boolean {
  const flat = flattenSlotNodes(nodes)
  const meaningful = flat.filter(node => node.type !== Comment && !isWhitespaceTextNode(node))

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

const tabIndex = computed(() => (props.disabled ? -1 : 0))

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

async function handleFiles(files: File[], source: FileValidatorSource = 'input') {
  if (props.disabled) return
  if (!files.length) return

  const normalizedLimit = normalizeLimit(props.limit)
  if (props.multiple && normalizedLimit && files.length > normalizedLimit) {
    props.onExceed?.(files, normalizedLimit)
    emit('error', new Error(`Too many files selected, limit=${normalizedLimit}`))
    return
  }

  const { files: valid, issues } = await runFileValidators(files, props.validators ?? [], {
    source,
    multiple: props.multiple,
  })

  if (issues.length > 0) {
    emit('error', new FileValidationError(issues, valid))
    return
  }

  if (!valid.length) return

  lastFiles.value = valid

  const before = await runBeforeUpload(valid)
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

  const controller = new AbortController()
  activeController = controller

  setStateUploading()
  emit('progress', 0, { percent: 0, loaded: 0, total: 0, indeterminate: true })

  try {
    const payload = props.request
      ? await props.request(valid, { signal: controller.signal, extraData, onProgress: handleProgress })
      : await uploadViaAction(valid, controller.signal, extraData)

    const finalLoaded = state.phase === 'uploading' ? state.total || state.loaded : 0
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

function onKeydown(event: KeyboardEvent) {
  if (hasCustomUi.value) return
  if (props.disabled) return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openDialog()
  }
}

function onRootClick() {
  if (hasCustomUi.value) return
  openDialog()
}

function onRootKeydown(event: KeyboardEvent) {
  if (hasCustomUi.value) return
  onKeydown(event)
}

const effectiveProgressTone = computed<GrProgressBarTone>(() => {
  if (state.phase === 'error') return 'danger'
  if (state.phase === 'success') return 'success'
  return props.progressTone
})

const progressVisible = computed(() => state.phase !== 'idle')
const progressPercent = computed(() => (state.phase === 'uploading' && state.indeterminate ? 0 : state.percent))
const progressText = computed(() => {
  if (state.phase === 'uploading' && state.indeterminate) return ''
  return `${Math.round(progressPercent.value)}%`
})

defineExpose({
  uploadFiles: handleFiles,
  abort,
  openDialog,
  state,
})
</script>

<template>
  <div
    data-ds-file-upload
    :role="hasCustomUi ? undefined : 'button'"
    :tabindex="hasCustomUi ? undefined : tabIndex"
    :aria-disabled="hasCustomUi ? undefined : disabled ? 'true' : 'false'"
    :class="
      hasCustomUi
        ? 'inline-block'
        : [
            'relative w-full rounded-[var(--ds-radius-lg)] border border-dashed border-[var(--brd)] bg-[var(--card)] px-5 py-6 outline-none transition',
            disabled
              ? 'opacity-60 cursor-not-allowed'
              : 'cursor-pointer hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
            isOver && !disabled ? 'border-[var(--ring)] bg-[var(--muted)]' : '',
          ]
    "
    @click="onRootClick"
    @keydown="onRootKeydown"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      ref="inputRef"
      data-ds-file-upload-input
      :style="hiddenInputStyle"
      type="file"
      tabindex="-1"
      aria-hidden="true"
      :name="name"
      :multiple="multiple"
      :disabled="disabled"
      @change="onInputChange"
    >

    <slot
      v-if="hasCustomUi"
      :open-dialog="openDialog"
      :abort="abort"
      :disabled="disabled"
      :files="lastFiles"
      :is-over="isOver"
      :state="state"
    />

    <div v-else class="flex items-start gap-4">
      <div
        data-ds-file-upload-icon
        class="h-12 w-12 shrink-0 rounded-[12px] bg-[var(--muted)] border border-[var(--brd)] flex items-center justify-center"
        aria-hidden="true"
      >
        <GrIcon class="h-6 w-6 text-[var(--muted-fg)]">
          <IconArrowUp />
        </GrIcon>
      </div>

      <div class="min-w-0">
        <div data-ds-file-upload-label class="text-[14px] font-700">
          <slot name="label">
            <slot>
              {{ placeholder }}
            </slot>
          </slot>
        </div>

        <div v-if="$slots.tip" data-ds-file-upload-tip class="mt-1 text-[13px] text-[var(--muted-fg)]">
          <slot name="tip" />
        </div>
        <div v-else class="mt-1 text-[13px] text-[var(--muted-fg)]" />

        <ul v-if="showFileList && lastFiles.length" data-ds-file-upload-list class="mt-3 space-y-1">
          <li
            v-for="file in lastFiles"
            :key="file.name"
            data-ds-file-upload-item
            class="text-[13px]"
          >
            <span class="font-600">{{ file.name }}</span>
            <span class="text-[var(--muted-fg)]"> · {{ Math.ceil(file.size / 1024) }} KB</span>
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
        >
          <div
            v-if="showProgress"
            data-ds-file-upload-progress
            class="mt-3 transition-opacity duration-150"
            :class="progressVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            :aria-hidden="!progressVisible"
          >
            <div class="flex items-center gap-2">
              <GrProgressBar
                :value="progressPercent"
                :tone="effectiveProgressTone"
                :aria-label="progressLabel"
              />
              <span
                data-ds-file-upload-progress-text
                class="text-[12px] text-[var(--muted-fg)] tabular-nums min-w-[3ch] text-right"
              >{{ progressText }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>