<script setup lang="ts">
import { computed } from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import DsDialog from '../DsDialog/DsDialog.vue'
import type { DsButtonSize, DsButtonTone, DsButtonVariant } from '../DsButton'
import type { DsDialogSectionConfig, DsDialogSize } from '../DsDialog'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    closeOnBackdrop?: boolean
    size?: DsDialogSize
    headerConfig?: DsDialogSectionConfig
    footerConfig?: DsDialogSectionConfig
    buttonSize?: DsButtonSize
    confirmText?: string
    cancelText?: string
    confirmVariant?: DsButtonVariant
    confirmTone?: DsButtonTone
  }>(),
  {
    title: undefined,
    description: undefined,
    closeOnBackdrop: true,
    size: 'md',
    headerConfig: undefined,
    footerConfig: undefined,
    buttonSize: undefined,
    confirmText: undefined,
    cancelText: undefined,
    confirmVariant: 'primary',
    confirmTone: 'primary',
  },
)

const titleText = computed(() => props.title ?? 'Confirm')
const confirmText = computed(() => props.confirmText ?? 'Confirm')
const cancelText = computed(() => props.cancelText ?? 'Cancel')

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function onCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function onConfirm(): void {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<template>
  <DsDialog
    v-model="open"
    :title="titleText"
    :size="props.size"
    :close-on-backdrop="props.closeOnBackdrop"
    :header-config="props.headerConfig"
    :footer-config="props.footerConfig"
  >
    <slot>
      <div v-if="props.description" class="text-[14px] text-[var(--muted-fg)]">
        {{ props.description }}
      </div>
    </slot>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <DsButton data-testid="ds-confirm-cancel" variant="outline" :size="props.buttonSize" @click="onCancel">
            {{ cancelText }}
          </DsButton>
          <DsButton
            data-testid="ds-confirm-confirm"
            :variant="props.confirmVariant"
            :tone="props.confirmTone"
            :size="props.buttonSize"
            @click="onConfirm"
          >
            {{ confirmText }}
          </DsButton>
        </div>
      </slot>
    </template>
  </DsDialog>
</template>