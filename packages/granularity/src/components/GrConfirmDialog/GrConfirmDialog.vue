<script setup lang="ts">
/**
 * GrConfirmDialog — DS-примитив диалога подтверждения поверх `GrDialog`.
 *
 * Синхронизирован с `GrDialog`/`GrPromptDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Клик по «Confirm»/«Cancel» эмитит одноимённое событие и закрывает диалог
 * через `update:modelValue`.
 */
import { computed } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrDialog from '../GrDialog/GrDialog.vue'
import GrResponseErrorBanner from '../GrResponseErrorBanner/GrResponseErrorBanner.vue'
import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

export interface GrConfirmDialogProps {
  modelValue: boolean
  title?: string
  description?: string
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
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  /**
   * Структура ошибки ответа сервера для показа в теле диалога
   * (через `GrResponseErrorBanner`). Используется императивным
   * `useDialogService` для async-`onConfirm`. `null` — блок скрыт.
   */
  error?: ResponseErrorInfo | null
  /** Состояние загрузки кнопки Confirm (async-`onConfirm` in-flight). */
  confirmLoading?: boolean
  /** Принудительно дизейблит кнопку Confirm. */
  confirmDisabled?: boolean
  /**
   * Закрывать ли диалог автоматически по клику Confirm. По умолчанию `true`
   * (историческое поведение). `false` — отдаёт управление закрытием наружу
   * (нужно `useDialogService`, который ждёт результат async-`onConfirm`).
   */
  closeOnConfirm?: boolean
}

const props = withDefaults(defineProps<GrConfirmDialogProps>(), {
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
  error: null,
  confirmLoading: false,
  confirmDisabled: false,
  closeOnConfirm: true,
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
  if (props.closeOnConfirm)
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

      <slot name="error" :error="error">
        <GrResponseErrorBanner v-if="error" :error="error" :can-dismiss="false" />
      </slot>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <GrButton data-testid="ds-confirm-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ cancelText }}
          </GrButton>
          <GrButton
            data-testid="ds-confirm-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            @click="onConfirm"
          >
            {{ confirmText }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
