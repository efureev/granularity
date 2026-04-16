<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import { vDropzone } from '../../directives/dropzone'
import { acceptValidator, FileValidationError, runFileValidators } from '../../fileValidation'
import type { FileValidationIssue, FileValidator } from '../../fileValidation'

defineOptions({
  name: 'DsFormFile',
})

export type DsFormFileError = FileValidationIssue

const props = withDefaults(
  defineProps<{
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
    validate?: (files: File[]) => DsFormFileError[] | Promise<DsFormFileError[]>
  }>(),
  {
    multiple: false,
    disabled: false,
    accept: undefined,
    uploadText: 'Upload file',
    changeText: 'Change file',
    removeText: 'Remove',
    clearAllText: 'Clear all',
    placeholder: 'No files selected',
    validators: undefined,
    validate: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'change', value: File | File[] | null): void
  (e: 'clear'): void
  (e: 'validation', errors: DsFormFileError[]): void
  (e: 'update:errors', errors: DsFormFileError[]): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localErrors = ref<DsFormFileError[]>([])

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

function setErrors(next: DsFormFileError[]) {
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

function issueMessage(issue: DsFormFileError): string {
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
            message: 'Failed to validate dropped files',
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
    data-ds-form-file
    class="rounded-[var(--ds-radius-md)]"
    :class="props.disabled ? 'opacity-60 cursor-not-allowed' : ''"
  >
    <input
      ref="inputRef"
      data-ds-form-file-input
      type="file"
      tabindex="-1"
      aria-hidden="true"
      class="absolute opacity-0 w-px h-px pointer-events-none"
      :multiple="props.multiple"
      :accept="props.accept"
      :disabled="props.disabled"
      @change="onInputChange"
    >

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <DsButton
          variant="secondary"
          size="sm"
          data-ds-form-file-upload-btn
          :disabled="props.disabled"
          @click.prevent="openDialog"
        >
          <span class="i-lucide-upload" aria-hidden="true" />
          <span class="ml-2">{{ hasFiles ? props.changeText : props.uploadText }}</span>
        </DsButton>

        <DsButton
          v-if="hasFiles && !props.multiple"
          variant="secondary"
          size="sm"
          data-ds-form-file-clear-btn
          :disabled="props.disabled"
          @click.prevent="clearAll"
        >
          <span class="i-lucide-x" aria-hidden="true" />
          <span class="ml-2">{{ props.removeText }}</span>
        </DsButton>

        <DsButton
          v-if="props.multiple && hasFiles"
          variant="secondary"
          size="sm"
          data-ds-form-file-clear-all-btn
          :disabled="props.disabled"
          @click.prevent="clearAll"
        >
          <span class="i-lucide-x" aria-hidden="true" />
          <span class="ml-2">{{ props.clearAllText }}</span>
        </DsButton>

        <span
          v-if="!props.multiple && hasFiles"
          class="text-sm text-[var(--muted-fg)] truncate max-w-[240px]"
          data-ds-form-file-single-name
          :title="files[0]?.name"
        >
          {{ files[0]?.name }}
        </span>

        <span
          v-if="!hasFiles"
          class="text-sm text-[var(--muted-fg)]"
          data-ds-form-file-placeholder
        >
          {{ props.placeholder }}
        </span>
      </div>

      <div v-if="props.multiple && hasFiles" class="flex flex-col gap-2">
        <div
          v-for="(file, index) in files"
          :key="`${file.name}-${file.size}-${index}`"
          class="flex items-center gap-2"
          data-ds-form-file-item
        >
          <span
            class="text-sm text-[var(--muted-fg)] truncate max-w-[240px]"
            :title="file.name"
            data-ds-form-file-item-name
          >
            {{ file.name }}
          </span>

          <button
            type="button"
            class="text-xs text-[var(--muted-fg)] hover:text-[var(--fg)]"
            data-ds-form-file-item-remove
            :disabled="props.disabled"
            @click.prevent="removeAt(index)"
          >
            {{ props.removeText }}
          </button>
        </div>
      </div>

      <slot name="errors" :errors="localErrors">
        <div v-if="localErrors.length" class="text-sm text-[var(--ds-danger)]" data-ds-form-file-errors>
          <div v-for="(e, i) in localErrors" :key="i" data-ds-form-file-error>
            {{ issueMessage(e) }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
[data-ds-form-file].ds-dropzone--over {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
</style>
