<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import IconUpload from '~icons/lucide/upload'
import IconX from '~icons/lucide/x'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import { useGrComponentSize } from '../GrConfigProvider/context'
import {
  type GrFormFileSize,
  buttonSizes,
  iconOffsets,
  iconSizes,
  previewBaseClass,
  previewSizes,
  removeTextSizes,
  rowGaps,
  stackGaps,
  textSizes,
} from './grFormFileStyles'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useFilePreviews } from '../../composables/internal/useFilePreviews'
import { vDropzone } from '../../directives'
import { acceptValidator, FileValidationError, maxCountValidator, resolveFileValidationMessage, runFileValidators } from '../../fileValidation'
import type { FileValidationIssue, FileValidator } from '../../fileValidation'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export type GrFormFileError = FileValidationIssue

/**
 * Пропы `GrFormFile` — форма-поле для выбора файлов с встроенной валидацией,
 * drag&drop (через `v-dropzone`) и списком выбранных файлов.
 *
 * Все `*Text`/`placeholder` — i18n-friendly, принимают готовые строки локали.
 */
export interface GrFormFileProps {
  modelValue: File | File[] | null
  multiple?: boolean
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  /** W3C `accept` для `<input type="file">` + sugar к `acceptValidator(...)`. */
  accept?: string
  validators?: FileValidator[]
  /** Максимум файлов в наборе. Лишние не обрезаются молча — набор отбивается ошибкой. */
  limit?: number
  uploadText?: string
  changeText?: string
  removeText?: string
  clearAllText?: string
  placeholder?: string
  /** Размер кнопок, иконок и подписей. */
  size?: GrFormFileSize
  /** Миниатюры для картинок в наборе. Файлы других типов остаются строкой. */
  preview?: boolean
  /** Дополнительная (кастомная) валидация на стороне потребителя. */
  validate?: (files: File[]) => GrFormFileError[] | Promise<GrFormFileError[]>
  /**
   * Контролируемый список ошибок: `v-model:errors`. Задан — показывается он, и
   * внутренняя валидация его не перетирает. Сюда же кладутся ошибки, пришедшие
   * с сервера. Не задан — компонент держит свои ошибки сам.
   */
  errors?: GrFormFileError[]
}

export interface GrFormFileEmits {
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'change', value: File | File[] | null): void
  (e: 'clear'): void
  /** Результат валидации. Канал один: `validation` дублировал эту же нагрузку. */
  (e: 'update:errors', errors: GrFormFileError[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(
  defineProps<GrFormFileProps>(),
  {
    multiple: false,
    preview: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    accept: undefined,
    limit: undefined,
    uploadText: undefined,
    changeText: undefined,
    removeText: undefined,
    clearAllText: undefined,
    placeholder: undefined,
    size: undefined,
    validators: undefined,
    validate: undefined,
    errors: undefined,
  },
)

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrFormFile' })

const rowClass = computed(() => rowGaps[resolvedSize.value])
const stackClass = computed(() => stackGaps[resolvedSize.value])
const textClass = computed(() => textSizes[resolvedSize.value])
const removeTextClass = computed(() => removeTextSizes[resolvedSize.value])
const iconOffsetClass = computed(() => iconOffsets[resolvedSize.value])
const buttonSize = computed(() => buttonSizes[resolvedSize.value])
const iconSize = computed(() => iconSizes[resolvedSize.value])
const previewClass = computed(() => [previewSizes[resolvedSize.value], previewBaseClass])

const emit = defineEmits<GrFormFileEmits>()
defineSlots<{
  /** Собственный вывод ошибок вместо списка по умолчанию. */
  error?: (props: { errors: GrFormFileError[] }) => any
}>()

const { t } = useGranularityTranslations()

// Контекст `GrFormField`. Виджет здесь — кнопка выбора файла, а не нативный
// `<input type="file">`: он `aria-hidden` и вне таб-порядка, id на нём увёл бы
// `<label for>` в невидимый элемент.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
  // `locked` — «ввод не принимается»: `disabled` или `readonly`. Набор в
  // `readonly` виден и уходит в форму, но поменять его нельзя ни диалогом, ни
  // перетаскиванием, ни удалением.
  locked: isLocked,
} = useGrFormControl(() => props)
const resolvedUploadText = computed(() => props.uploadText ?? t('gr.formFile.upload', 'Upload file'))
const resolvedChangeText = computed(() => props.changeText ?? t('gr.formFile.change', 'Change file'))
const resolvedRemoveText = computed(() => props.removeText ?? t('gr.formFile.remove', 'Remove'))
const resolvedClearAllText = computed(() => props.clearAllText ?? t('gr.formFile.clearAll', 'Clear all'))
const resolvedPlaceholder = computed(() => props.placeholder ?? t('gr.formFile.placeholder', 'No files selected'))

const inputRef = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

// Внутри зоны фокус ходит между нативным input'ом и кнопками: без границы
// каждое перемещение давало бы потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})
const localErrors = ref<GrFormFileError[]>([])
const uploadBtnEl = ref<HTMLElement | null>(null)

// Собственные ошибки компонент обязан и объявить (`role="alert"`), и связать с
// контролом: до этого «уронил файл не того типа» для скринридера выглядело как
// «ничего не произошло». Ошибка поля из `GrFormField` при этом остаётся —
// `aria-describedby` держит оба id.
const errorsId = useId()
// Контролируемый список сильнее внутреннего — как `sortKey` у `GrDataTable`.
const displayedErrors = computed(() => props.errors ?? localErrors.value)
const hasLocalErrors = computed(() => displayedErrors.value.length > 0)

/**
 * `aria-required` и `aria-readonly` роль `button` не поддерживает — axe роняет
 * это как critical `aria-allowed-attr`. Состояния уходят в описание кнопки:
 * иначе они пропали бы для диктора совсем (маркер `*` у `GrFormField`
 * декоративен и скрыт).
 */
const stateHintId = useId()
const stateHint = computed(() => [
  isRequired.value ? t('gr.form.required', 'This field is required') : undefined,
  isReadonly.value ? t('gr.form.readonly', 'Read only') : undefined,
].filter(Boolean).join('. ') || undefined)

const describedByIds = computed(() => {
  return [
    field?.describedById.value,
    hasLocalErrors.value ? errorsId : undefined,
    stateHint.value ? stateHintId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined
})

const showsInvalid = computed(() => isInvalid.value || hasLocalErrors.value)

function focus(): void {
  uploadBtnEl.value?.focus()
}

function blur(): void {
  uploadBtnEl.value?.blur()
}

defineExpose({ focus, blur })

const files = computed<File[]>(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }

  return props.modelValue instanceof File ? [props.modelValue] : []
})

const hasFiles = computed(() => files.value.length > 0)

const { fileKey, previewUrl, revokePreview, revokeAllPreviews } = useFilePreviews({
  enabled: () => props.preview,
})

/**
 * Отзыв `object URL` привязан к самому набору, а не к местам, где его меняют.
 * Файл уходит из набора десятком путей — кнопка строки, «очистить всё», новый
 * выбор, внешний сброс `v-model`, — и точечные вызовы разъехались бы с первой
 * же новой веткой; blob при этом висел бы в памяти вкладки до перезагрузки.
 */
watch(files, (next, prev) => {
  for (const file of prev ?? []) {
    if (!next.includes(file))
      revokePreview(file)
  }
})

onBeforeUnmount(revokeAllPreviews)

/**
 * Один набор валидаторов на оба пути ввода. Собери его отдельно в `applyFiles`
 * и в `dropzone` — копии разъедутся при первой же правке, и выбор через диалог
 * начнёт вести себя иначе, чем перетаскивание.
 */
const effectiveValidators = computed<FileValidator[]>(() => {
  const customValidator: FileValidator | undefined = props.validate
    ? async ({ files }) => (await props.validate?.(files)) ?? []
    : undefined

  return [
    acceptValidator(props.accept),
    maxCountValidator(props.limit),
    ...(props.validators ?? []),
    ...(customValidator ? [customValidator] : []),
  ]
})

function clearInputValue() {
  if (!inputRef.value)
    return
  inputRef.value.value = ''
}

function setErrors(next: GrFormFileError[]) {
  localErrors.value = next
  emit('update:errors', next)
}

function clearErrors() {
  if (displayedErrors.value.length === 0)
    return
  setErrors([])
}

function openDialog() {
  if (isLocked.value)
    return
  inputRef.value?.click()
}

function emitModel(nextFiles: File[]) {
  const value: File | File[] | null = props.multiple
    ? nextFiles
    : (nextFiles[0] ?? null)

  emit('update:modelValue', value)
  emit('change', value)
}

async function applyFiles(nextFiles: File[]) {
  const isPromiseLike = (value: unknown): value is PromiseLike<any> => {
    return !!value && typeof (value as any).then === 'function'
  }

  const res = runFileValidators(nextFiles, effectiveValidators.value, {
    source: 'input',
    multiple: props.multiple,
  })

  const { files: picked, issues } = isPromiseLike(res) ? await res : res

  if (issues.length > 0) {
    setErrors(issues)
    clearInputValue()
    await nextTick()
    return
  }

  clearErrors()
  emitModel(picked)
  clearInputValue()
  await nextTick()
}

async function onInputChange(event: Event) {
  if (isLocked.value)
    return

  const target = event.target as HTMLInputElement | null
  const nextFiles = target?.files ? Array.prototype.slice.call(target.files) as File[] : []

  // Reset value so selecting the same file twice triggers change.
  if (target)
    target.value = ''
  await nextTick()

  await applyFiles(nextFiles)
}

function clearAll() {
  if (isLocked.value)
    return
  clearErrors()
  clearInputValue()
  emit('clear')

  emit('update:modelValue', props.multiple ? [] : null)
  emit('change', props.multiple ? [] : null)
}

function removeAt(index: number) {
  if (isLocked.value)
    return
  if (!props.multiple) {
    clearAll()
    return
  }

  const next = files.value.slice()
  next.splice(index, 1)

  emit('update:modelValue', next)
  emit('change', next)
}

/** Размер файла в строке списка — как в `GrFileUpload`: без него список не отвечает «сколько». */
function formatFileSize(file: File): string {
  return `${Math.ceil(file.size / 1024)} KB`
}

function issueMessage(issue: GrFormFileError): string {
  const text = resolveFileValidationMessage(issue, t)

  // Префикс с именем файла нужен только тем сообщениям, которые сами его не
  // называют, — то есть валидаторам потребителя. Встроенные передают `fileName`
  // параметром и подставляют его в текст, и приписка давала бы «photo.png:
  // Файл «photo.png» …». Признак — наличие параметра, а не поиск подстроки.
  if (issue.fileName && issue.i18nParams?.fileName === undefined)
    return `${issue.fileName}: ${text}`

  return text
}

const dropzone = computed(() => {
  return {
    enabled: !isLocked.value,
    multiple: props.multiple,
    validators: effectiveValidators.value,
    onFiles: async (dropped: File[]) => {
      // `v-dropzone` уже выполнил валидаторы и нормализацию по `multiple`.
      clearErrors()
      emitModel(dropped)
      clearInputValue()
      await nextTick()
    },
    onError: (error: unknown) => {
      if (error instanceof FileValidationError) {
        setErrors(error.issues)
      }
      else {
        setErrors([
          {
            code: 'accept',
            message: t('gr.formFile.validateError', 'Failed to validate dropped files'),
          },
        ])
      }
    },
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (!inputRef.value)
      return

    if (!value || (Array.isArray(value) && value.length === 0)) {
      // Позволяет выбрать тот же файл снова после внешнего сброса.
      inputRef.value.value = ''
    }
  },
)
</script>

<template>
  <div
    ref="rootEl"
    v-dropzone="dropzone"
    data-gr-form-file
    class="rounded-[var(--gr-radius-md)]"
    :class="isDisabled ? 'cursor-not-allowed' : ''"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <span v-if="stateHint" :id="stateHintId" class="sr-only">{{ stateHint }}</span>

    <input
      ref="inputRef"
      data-gr-form-file-input
      type="file"
      tabindex="-1"
      aria-hidden="true"
      class="absolute opacity-0 w-px h-px pointer-events-none"
      :multiple="multiple"
      :accept="accept"
      :disabled="isDisabled"
      @change="onInputChange"
    >

    <div class="flex flex-col" :class="stackClass">
      <div class="flex flex-wrap items-center" :class="rowClass">
        <GrButton
          :id="fieldId"
          ref="uploadBtnEl"
          variant="secondary"
          :size="buttonSize"
          data-gr-form-file-upload-btn
          :aria-describedby="describedByIds"
          :aria-invalid="showsInvalid ? 'true' : undefined"
          :aria-label="ariaLabel"
          :disabled="isDisabled"
          @click.prevent="openDialog"
        >
          <GrIcon :size="iconSize">
            <IconUpload />
          </GrIcon>
          <span :class="iconOffsetClass">{{ hasFiles ? resolvedChangeText : resolvedUploadText }}</span>
        </GrButton>

        <GrButton
          v-if="hasFiles && !multiple && !isReadonly"
          variant="secondary"
          :size="buttonSize"
          data-gr-form-file-clear-btn
          :disabled="isDisabled"
          @click.prevent="clearAll"
        >
          <GrIcon :size="iconSize">
            <IconX />
          </GrIcon>
          <span :class="iconOffsetClass">{{ resolvedRemoveText }}</span>
        </GrButton>

        <GrButton
          v-if="multiple && hasFiles && !isReadonly"
          variant="secondary"
          :size="buttonSize"
          data-gr-form-file-clear-all-btn
          :disabled="isDisabled"
          @click.prevent="clearAll"
        >
          <GrIcon :size="iconSize">
            <IconX />
          </GrIcon>
          <span :class="iconOffsetClass">{{ resolvedClearAllText }}</span>
        </GrButton>

        <img
          v-if="!multiple && hasFiles && previewUrl(files[0]!)"
          data-gr-form-file-preview
          :src="previewUrl(files[0]!)"
          alt=""
          :class="previewClass"
        >

        <span
          v-if="!multiple && hasFiles"
          class="text-[var(--gr-muted-fg)] truncate max-w-[240px]"
          :class="textClass"
          data-gr-form-file-single-name
          :title="files[0]?.name"
        >
          {{ files[0]?.name }}
        </span>

        <span
          v-if="!hasFiles"
          class="text-[var(--gr-muted-fg)]"
          :class="textClass"
          data-gr-form-file-placeholder
        >
          {{ resolvedPlaceholder }}
        </span>
      </div>

      <div v-if="multiple && hasFiles" class="flex flex-col" :class="stackClass">
        <div
          v-for="(file, index) in files"
          :key="fileKey(file)"
          class="flex items-center gap-2"
          data-gr-form-file-item
        >
          <img
            v-if="previewUrl(file)"
            data-gr-form-file-preview
            :src="previewUrl(file)"
            alt=""
            :class="previewClass"
          >

          <span
            class="text-[var(--gr-muted-fg)] truncate max-w-[240px]"
            :class="textClass"
            :title="file.name"
            data-gr-form-file-item-name
          >
            {{ file.name }}
          </span>

          <span
            class="text-[var(--gr-muted-fg)] shrink-0"
            :class="removeTextClass"
            data-gr-form-file-item-size
          >{{ formatFileSize(file) }}</span>

          <button
            v-if="!isReadonly"
            type="button"
            class="text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]"
            :class="removeTextClass"
            data-gr-form-file-item-remove
            :disabled="isDisabled"
            :aria-label="t('gr.formFile.removeFile', 'Remove {fileName}', { fileName: file.name })"
            @click.prevent="removeAt(index)"
          >
            {{ resolvedRemoveText }}
          </button>
        </div>
      </div>

      <slot name="error" :errors="displayedErrors">
        <div
          v-if="hasLocalErrors"
          :id="errorsId"
          class="text-[var(--gr-danger-text)]"
          :class="textClass"
          data-gr-form-file-errors
          role="alert"
        >
          <div v-for="(e, i) in displayedErrors" :key="i" data-gr-form-file-error>
            {{ issueMessage(e) }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
[data-gr-form-file].gr-dropzone--over {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}
</style>
