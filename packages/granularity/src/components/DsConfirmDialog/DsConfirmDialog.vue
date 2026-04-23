<script setup lang="ts">
/**
 * DsConfirmDialog — DS-примитив диалога подтверждения поверх `DsDialog`.
 *
 * Синхронизирован с `DsDialog`/`DsPromptDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Клик по «Confirm»/«Cancel» эмитит одноимённое событие и закрывает диалог
 * через `update:modelValue`.
 */
import { computed } from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import DsDialog from '../DsDialog/DsDialog.vue'
import type { DsButtonSize, DsButtonTone, DsButtonVariant } from '../DsButton'
import type { DsDialogSectionConfig, DsDialogSize } from '../DsDialog'

export interface DsConfirmDialogProps {
  modelValue: boolean
  title?: string
  description?: string
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
  confirmVariant?: DsButtonVariant
  confirmTone?: DsButtonTone
}

const props = withDefaults(defineProps<DsConfirmDialogProps>(), {
  title: 'Confirm',
  description: undefined,
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
  confirmVariant: 'primary',
  confirmTone: 'primary',
})

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
    <slot>
      <div v-if="description" class="text-[14px] text-[var(--muted-fg)]">
        {{ description }}
      </div>
    </slot>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <DsButton data-testid="ds-confirm-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ cancelText }}
          </DsButton>
          <DsButton
            data-testid="ds-confirm-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            @click="onConfirm"
          >
            {{ confirmText }}
          </DsButton>
        </div>
      </slot>
    </template>
  </DsDialog>
</template>
