<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import IconUpload from '~icons/lucide/upload'
import IconX from '~icons/lucide/x'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import { vDropzone } from '../../directives'
import { acceptValidator, FileValidationError, runFileValidators } from '../../fileValidation'
import type { FileValidationIssue, FileValidator } from '../../fileValidation'
import { useGranularityTranslations } from '../../internal/granularityI18n'

defineOptions({
  name: 'GrFormFile',
})

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
  /** W3C `accept` для `<input type="file">` + sugar к `acceptValidator(...)`. */
  accept?: string
  validators?: FileValidator[]
  uploadText?: string
  changeText?: string
  removeText?: string
  clearAllText?: string
  placeholder?: string
  /** Дополнительная (кастомная) валидация на стороне потребителя. */
  validate?: (files: File[]) => GrFormFileError[] | Promise<GrFormFileError[]>
}

const props = withDefaults(
  defineProps<GrFormFileProps>(),
  {
    multiple: false,
    disabled: false,
    accept: undefined,
    uploadText: undefined,
    changeText: undefined,
    removeText: undefined,
    clearAllText: undefined,
    placeholder: undefined,
    validators: undefined,
    validate: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'change', value: File | File[] | null): void
  (e: 'clear'): void
  (e: 'validation', errors: GrFormFileError[]): void
  (e: 'update:errors', errors: GrFormFileError[]): void
}>()

const { t } = useGranularityTranslations()
const resolvedUploadText = computed(() => props.uploadText ?? t('gr.formFile.upload', 'Upload file'))
const resolvedChangeText = computed(() => props.changeText ?? t('gr.formFile.change', 'Change file'))
const resolvedRemoveText = computed(() => props.removeText ?? t('gr.formFile.remove', 'Remove'))
const resolvedClearAllText = computed(() => props.clearAllText ?? t('gr.formFile.clearAll', 'Clear all'))
const resolvedPlaceholder = computed(() => props.placeholder ?? t('gr.formFile.placeholder', 'No files selected'))

const inputRef = ref<HTMLInputElement | null>(null)
const localErrors = ref<GrFormFileError[]>([])

const files = computed<File[]>(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }

  return props.modelValue instanceof File ? [props.modelValue] : []
})

const hasFiles = computed(() => files.value.length > 0)

function clearInputValue() {
  if (!inputRef.value) return
  inputRef.value.value = ''
}

function setErrors(next: GrFormFileError[]) {
  localErrors.value = next
  emit('validation', next)
  emit('update:errors', next)
}

function clearErrors() {
  if (localErrors.value.length === 0) return
  setErrors([])
}

function openDialog() {
  if (props.disabled) return
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

  const customValidator: FileValidator | undefined = props.validate
    ? async ({ files }) => (await props.validate?.(files)) ?? []
    : undefined

  const validators: FileValidator[] = [
    acceptValidator(props.accept),
    ...(props.validators ?? []),
    ...(customValidator ? [customValidator] : []),
  ]

  const res = runFileValidators(nextFiles, validators, {
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
  if (props.disabled) return

  const target = event.target as HTMLInputElement | null
  const nextFiles = target?.files ? Array.prototype.slice.call(target.files) as File[] : []

  // Reset value so selecting the same file twice triggers change.
  if (target) target.value = ''
  await nextTick()

  await applyFiles(nextFiles)
}

function clearAll() {
  if (props.disabled) return
  clearErrors()
  clearInputValue()
  emit('clear')

  emit('update:modelValue', props.multiple ? [] : null)
  emit('change', props.multiple ? [] : null)
}

function removeAt(index: number) {
  if (props.disabled) return
  if (!props.multiple) {
    clearAll()
    return
  }

  const next = files.value.slice()
  next.splice(index, 1)

  emit('update:modelValue', next)
  emit('change', next)
}

function issueMessage(issue: GrFormFileError): string {
  if (issue.fileName) return `${issue.fileName}: ${issue.message}`
  return issue.message
}

const dropzone = computed(() => {
  const customValidator: FileValidator | undefined = props.validate
    ? async ({ files }) => (await props.validate?.(files)) ?? []
    : undefined

  const validators: FileValidator[] = [
    acceptValidator(props.accept),
    ...(props.validators ?? []),
    ...(customValidator ? [customValidator] : []),
  ]

  return {
    enabled: !props.disabled,
    multiple: props.multiple,
    validators,
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
    if (!inputRef.value) return

    if (!value || (Array.isArray(value) && value.length === 0)) {
      // Позволяет выбрать тот же файл снова после внешнего сброса.
      inputRef.value.value = ''
    }
  },
)
</script>

<template>
  <div
    v-dropzone="dropzone"
    data-gr-form-file
    class="rounded-[var(--gr-radius-md)]"
    :class="disabled ? 'opacity-60 cursor-not-allowed' : ''"
  >
    <input
      ref="inputRef"
      data-gr-form-file-input
      type="file"
      tabindex="-1"
      aria-hidden="true"
      class="absolute opacity-0 w-px h-px pointer-events-none"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      @change="onInputChange"
    >

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton
          variant="secondary"
          size="sm"
          data-gr-form-file-upload-btn
          :disabled="disabled"
          @click.prevent="openDialog"
        >
          <GrIcon size="sm" aria-hidden="true">
            <IconUpload />
          </GrIcon>
          <span class="ml-2">{{ hasFiles ? resolvedChangeText : resolvedUploadText }}</span>
        </GrButton>

        <GrButton
          v-if="hasFiles && !multiple"
          variant="secondary"
          size="sm"
          data-gr-form-file-clear-btn
          :disabled="disabled"
          @click.prevent="clearAll"
        >
          <GrIcon size="sm" aria-hidden="true">
            <IconX />
          </GrIcon>
          <span class="ml-2">{{ resolvedRemoveText }}</span>
        </GrButton>

        <GrButton
          v-if="multiple && hasFiles"
          variant="secondary"
          size="sm"
          data-gr-form-file-clear-all-btn
          :disabled="disabled"
          @click.prevent="clearAll"
        >
          <GrIcon size="sm" aria-hidden="true">
            <IconX />
          </GrIcon>
          <span class="ml-2">{{ resolvedClearAllText }}</span>
        </GrButton>

        <span
          v-if="!multiple && hasFiles"
          class="text-sm text-[var(--muted-fg)] truncate max-w-[240px]"
          data-gr-form-file-single-name
          :title="files[0]?.name"
        >
          {{ files[0]?.name }}
        </span>

        <span
          v-if="!hasFiles"
          class="text-sm text-[var(--muted-fg)]"
          data-gr-form-file-placeholder
        >
          {{ resolvedPlaceholder }}
        </span>
      </div>

      <div v-if="multiple && hasFiles" class="flex flex-col gap-2">
        <div
          v-for="(file, index) in files"
          :key="`${file.name}-${file.size}-${index}`"
          class="flex items-center gap-2"
          data-gr-form-file-item
        >
          <span
            class="text-sm text-[var(--muted-fg)] truncate max-w-[240px]"
            :title="file.name"
            data-gr-form-file-item-name
          >
            {{ file.name }}
          </span>

          <button
            type="button"
            class="text-xs text-[var(--muted-fg)] hover:text-[var(--fg)]"
            data-gr-form-file-item-remove
            :disabled="disabled"
            @click.prevent="removeAt(index)"
          >
            {{ removeText }}
          </button>
        </div>
      </div>

      <slot name="errors" :errors="localErrors">
        <div v-if="localErrors.length" class="text-sm text-[var(--gr-danger)]" data-gr-form-file-errors>
          <div v-for="(e, i) in localErrors" :key="i" data-gr-form-file-error>
            {{ issueMessage(e) }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
[data-gr-form-file].gr-dropzone--over {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
</style>
