<script setup lang="ts">
/**
 * GrPromptDialog — DS-примитив диалога ввода значения поверх `GrDialog`.
 *
 * Синхронизирован с `GrDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Поведение `required=true` (по умолчанию): пустое значение подсвечивается
 * ошибкой только после первого «касания» (blur или попытка confirm),
 * чтобы не шуметь при открытии.
 */
import { computed, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrDialog from '../GrDialog/GrDialog.vue'
import GrFormField from '../GrFormField/GrFormField.vue'
import GrInput from '../GrInput/GrInput.vue'
import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'

export interface GrPromptDialogProps {
  modelValue: boolean
  value: string
  title?: string
  description?: string
  label?: string
  placeholder?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  size?: GrDialogSize
  headerConfig?: GrDialogSectionConfig
  footerConfig?: GrDialogSectionConfig
  bodyConfig?: GrDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
  buttonSize?: GrButtonSize
  confirmText?: string
  cancelText?: string
  /** Текст ошибки для пустого значения при `required=true` (i18n). */
  requiredErrorText?: string
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  required?: boolean
}

const props = withDefaults(defineProps<GrPromptDialogProps>(), {
  title: 'Prompt',
  description: undefined,
  label: 'Value',
  placeholder: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showHeader: true,
  showCloseButton: true,
  size: 'md',
  headerConfig: undefined,
  footerConfig: undefined,
  bodyConfig: undefined,
  closeLabel: 'Close',
  buttonSize: undefined,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  requiredErrorText: 'Enter a value.',
  confirmVariant: 'primary',
  confirmTone: 'primary',
  required: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:value', value: string): void
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const valueModel = computed({
  get: () => props.value,
  set: (v: string) => emit('update:value', v),
})

const touched = ref(false)
const inputRef = ref<InstanceType<typeof GrInput> | null>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (v) touched.value = false
  },
)

const canConfirm = computed(() => {
  if (!props.required) return true
  return valueModel.value.trim().length > 0
})

const error = computed(() => {
  if (!props.required) return undefined
  if (!touched.value) return undefined
  return valueModel.value.trim().length > 0
    ? undefined
    : props.requiredErrorText
})

function onCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function onConfirm(): void {
  if (!canConfirm.value) {
    touched.value = true
    inputRef.value?.focus()
    return
  }

  emit('confirm', valueModel.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <GrDialog
    v-model="open"
    :title="title"
    :size="size"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-esc="closeOnEsc"
    :show-header="showHeader"
    :show-close-button="showCloseButton"
    :header-config="headerConfig"
    :footer-config="footerConfig"
    :body-config="bodyConfig"
    :close-label="closeLabel"
  >
    <div class="grid gap-4">
      <slot>
        <div v-if="description" class="text-[14px] text-[var(--muted-fg)]">
          {{ description }}
        </div>
      </slot>

      <GrFormField :label="label" :error="error" for-id="ds-prompt-input">
        <GrInput
          id="ds-prompt-input"
          ref="inputRef"
          v-model="valueModel"
          data-testid="ds-prompt-input"
          :placeholder="placeholder"
          :invalid="!!error"
          @blur="touched = true"
        />
      </GrFormField>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <GrButton data-testid="ds-prompt-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ cancelText }}
          </GrButton>
          <GrButton
            data-testid="ds-prompt-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :disabled="required && touched && !canConfirm"
            @click="onConfirm"
          >
            {{ confirmText }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
