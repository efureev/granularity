<script setup lang="ts">
/**
 * GrPromptDialog — GR-примитив диалога ввода значения поверх `GrDialog`.
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
import GrResponseErrorBanner from '../GrResponseErrorBanner/GrResponseErrorBanner.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

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
  /**
   * Структура ошибки ответа сервера для показа общим блоком в теле диалога
   * (через `GrResponseErrorBanner`). `null` — блок скрыт.
   */
  error?: ResponseErrorInfo | null
  /**
   * Внешняя ошибка поля ввода (например, серверная валидация). Имеет приоритет
   * над встроенной проверкой `required`. `null`/`undefined` — нет внешней ошибки.
   */
  fieldError?: string | null
  /** Состояние загрузки кнопки Confirm (async-`onConfirm` in-flight). */
  confirmLoading?: boolean
  /** Принудительно дизейблит кнопку Confirm. */
  confirmDisabled?: boolean
  /**
   * Закрывать ли диалог автоматически по клику Confirm. По умолчанию `true`.
   * `false` — отдаёт управление закрытием наружу (нужно `useDialogService`).
   */
  closeOnConfirm?: boolean
}

const props = withDefaults(defineProps<GrPromptDialogProps>(), {
  title: undefined,
  description: undefined,
  label: undefined,
  placeholder: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showHeader: true,
  showCloseButton: true,
  size: 'md',
  headerConfig: undefined,
  footerConfig: undefined,
  bodyConfig: undefined,
  closeLabel: undefined,
  buttonSize: undefined,
  confirmText: undefined,
  cancelText: undefined,
  requiredErrorText: undefined,
  confirmVariant: 'primary',
  confirmTone: 'primary',
  required: true,
  error: null,
  fieldError: null,
  confirmLoading: false,
  confirmDisabled: false,
  closeOnConfirm: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:value', value: string): void
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

// Дефолты берём из общего i18n-блока пакета (fallback — англ.), а не хардкодим.
const { t } = useGranularityTranslations()
const resolvedTitle = computed(() => props.title ?? t('gr.dialog.prompt.title', 'Prompt'))
const resolvedLabel = computed(() => props.label ?? t('gr.dialog.prompt.label', 'Value'))
const resolvedRequiredErrorText = computed(() => props.requiredErrorText ?? t('gr.dialog.prompt.required', 'Enter a value.'))
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.common.close', 'Close'))
const resolvedConfirmText = computed(() => props.confirmText ?? t('gr.common.confirm', 'Confirm'))
const resolvedCancelText = computed(() => props.cancelText ?? t('gr.common.cancel', 'Cancel'))

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

const validationError = computed(() => {
  if (!props.required) return undefined
  if (!touched.value) return undefined
  return valueModel.value.trim().length > 0
    ? undefined
    : resolvedRequiredErrorText.value
})

// Внешняя ошибка поля (серверная валидация) имеет приоритет над встроенной.
const fieldErrorMessage = computed(() => props.fieldError ?? validationError.value ?? undefined)

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
  if (props.closeOnConfirm)
    emit('update:modelValue', false)
}
</script>

<template>
  <GrDialog
    v-model="open"
    :title="resolvedTitle"
    :size="size"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-esc="closeOnEsc"
    :show-header="showHeader"
    :show-close-button="showCloseButton"
    :header-config="headerConfig"
    :footer-config="footerConfig"
    :body-config="bodyConfig"
    :close-label="resolvedCloseLabel"
  >
    <div class="grid gap-4">
      <slot>
        <div v-if="description" class="text-[14px] text-[var(--gr-muted-fg)]">
          {{ description }}
        </div>
      </slot>

      <GrFormField :label="resolvedLabel" :error="fieldErrorMessage" for-id="gr-prompt-input">
        <GrInput
          id="gr-prompt-input"
          ref="inputRef"
          v-model="valueModel"
          data-testid="gr-prompt-input"
          :placeholder="placeholder"
          :invalid="!!fieldErrorMessage"
          @blur="touched = true"
        />
      </GrFormField>

      <slot name="error" :error="error">
        <GrResponseErrorBanner v-if="error" :error="error" :can-dismiss="false" />
      </slot>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <GrButton data-testid="gr-prompt-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ resolvedCancelText }}
          </GrButton>
          <GrButton
            data-testid="gr-prompt-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :loading="confirmLoading"
            :disabled="confirmDisabled || (required && touched && !canConfirm)"
            @click="onConfirm"
          >
            {{ resolvedConfirmText }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
