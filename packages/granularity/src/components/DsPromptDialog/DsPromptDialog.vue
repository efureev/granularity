<script setup lang="ts">
/**
 * DsPromptDialog — DS-примитив диалога ввода значения поверх `DsDialog`.
 *
 * Синхронизирован с `DsDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Поведение `required=true` (по умолчанию): пустое значение подсвечивается
 * ошибкой только после первого «касания» (blur или попытка confirm),
 * чтобы не шуметь при открытии.
 */
import { computed, ref, watch } from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import DsDialog from '../DsDialog/DsDialog.vue'
import DsFormField from '../DsFormField/DsFormField.vue'
import DsInput from '../DsInput/DsInput.vue'
import type { DsButtonSize, DsButtonTone, DsButtonVariant } from '../DsButton'
import type { DsDialogSectionConfig, DsDialogSize } from '../DsDialog'

export interface DsPromptDialogProps {
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
  size?: DsDialogSize
  headerConfig?: DsDialogSectionConfig
  footerConfig?: DsDialogSectionConfig
  bodyConfig?: DsDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
  buttonSize?: DsButtonSize
  confirmText?: string
  cancelText?: string
  /** Текст ошибки для пустого значения при `required=true` (i18n). */
  requiredErrorText?: string
  confirmVariant?: DsButtonVariant
  confirmTone?: DsButtonTone
  required?: boolean
}

const props = withDefaults(defineProps<DsPromptDialogProps>(), {
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
const inputRef = ref<InstanceType<typeof DsInput> | null>(null)

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
  <DsDialog
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

      <DsFormField :label="label" :error="error" for-id="ds-prompt-input">
        <DsInput
          id="ds-prompt-input"
          ref="inputRef"
          v-model="valueModel"
          data-testid="ds-prompt-input"
          :placeholder="placeholder"
          :invalid="!!error"
          @blur="touched = true"
        />
      </DsFormField>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <DsButton data-testid="ds-prompt-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ cancelText }}
          </DsButton>
          <DsButton
            data-testid="ds-prompt-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :disabled="required && touched && !canConfirm"
            @click="onConfirm"
          >
            {{ confirmText }}
          </DsButton>
        </div>
      </slot>
    </template>
  </DsDialog>
</template>
