<script setup lang="ts">
import {computed, ref, watch} from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import DsDialog from '../DsDialog/DsDialog.vue'
import DsFormField from '../DsFormField/DsFormField.vue'
import DsInput from '../DsInput/DsInput.vue'
import type {DsButtonSize, DsButtonTone, DsButtonVariant} from '../DsButton'
import type {DsDialogSectionConfig, DsDialogSize} from '../DsDialog'

const props = withDefaults(
    defineProps<{
      modelValue: boolean
      value: string
      title?: string
      description?: string
      label?: string
      placeholder?: string
      closeOnBackdrop?: boolean
      size?: DsDialogSize
      headerConfig?: DsDialogSectionConfig
      footerConfig?: DsDialogSectionConfig
      buttonSize?: DsButtonSize
      confirmText?: string
      cancelText?: string
      confirmVariant?: DsButtonVariant
      confirmTone?: DsButtonTone
      required?: boolean
    }>(),
    {
      description: undefined,
      title: 'Prompt',
      label: 'Value',
      placeholder: undefined,
      closeOnBackdrop: true,
      size: 'md',
      headerConfig: undefined,
      footerConfig: undefined,
      buttonSize: undefined,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      confirmTone: 'primary',
      required: true,
    },
)

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
      if (v) {
        touched.value = false
      }
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
      : 'Enter a value.'
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
      :size="props.size"
      :close-on-backdrop="props.closeOnBackdrop"
      :header-config="props.headerConfig"
      :footer-config="props.footerConfig"
  >
    <div class="grid gap-4">
      <slot>
        <div v-if="props.description" class="text-[14px] text-[var(--muted-fg)]">
          {{ props.description }}
        </div>
      </slot>

      <DsFormField :label="label" :error="error" for-id="ds-prompt-input">
        <DsInput
            id="ds-prompt-input"
            ref="inputRef"
            v-model="valueModel"
            data-testid="ds-prompt-input"
            :placeholder="props.placeholder"
            :invalid="!!error"
            @blur="touched = true"
        />
      </DsFormField>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <DsButton data-testid="ds-prompt-cancel" variant="outline" :size="props.buttonSize" @click="onCancel">
            {{ cancelText }}
          </DsButton>
          <DsButton
              data-testid="ds-prompt-confirm"
              :variant="props.confirmVariant"
              :tone="props.confirmTone"
              :size="props.buttonSize"
              :disabled="props.required && touched && !canConfirm"
              @click="onConfirm"
          >
            {{ confirmText }}
          </DsButton>
        </div>
      </slot>
    </template>
  </DsDialog>
</template>
