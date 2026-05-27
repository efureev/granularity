<script setup lang="ts">
/**
 * Тонкая обёртка над `GrResponseErrorBanner` с предсетами для сценария
 * «валидация формы»:
 *
 * - `showFieldLabels=true` — рисуются подписи `field:` перед каждой строкой.
 * - `canRetry=false` — обычно пользователь правит поля сам, retry не нужен.
 * - `toneByKind.validation = 'warning'` — визуально «исправь», не «упало».
 * - Тексты сдвинуты под формы.
 *
 * Для кастомных парсеров используйте напрямую `GrResponseErrorBanner` +
 * `useResponseError({ parsers: () => extendDefaultParsers([myParser]) })`.
 */
import { computed } from 'vue'

import GrResponseErrorBanner from './GrResponseErrorBanner.vue'
import type {
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorTexts,
  ResponseErrorTone,
} from './responseError.types'

const props = withDefaults(defineProps<{
  error: ResponseErrorInfo | null
  fieldLabels?: Record<string, string>
  texts?: Partial<ResponseErrorTexts>
  tone?: ResponseErrorTone
  toneByKind?: Partial<Record<ResponseErrorKind, ResponseErrorTone>>
  canRetry?: boolean
  canDismiss?: boolean
  autoHideKinds?: ResponseErrorKind[]
  testIdPrefix?: string
}>(), {
  fieldLabels: () => ({}),
  texts: () => ({}),
  tone: undefined,
  toneByKind: () => ({ validation: 'warning' }),
  canRetry: false,
  canDismiss: true,
  autoHideKinds: () => [],
  testIdPrefix: 'form-error',
})

const emit = defineEmits<{
  (e: 'retry', error: ResponseErrorInfo): void
  (e: 'dismiss'): void
}>()

const FORM_TEXTS: Partial<ResponseErrorTexts> = {
  validationTitle: 'Check the form fields',
  validationMessage: 'The server rejected the data. Fix the highlighted fields and try again.',
  clientTitle: 'Failed to save',
  serverTitle: 'Save error',
  serverMessage: 'Could not save the data. Please try again later.',
}

const mergedTexts = computed<Partial<ResponseErrorTexts>>(() => ({
  ...FORM_TEXTS,
  ...props.texts,
}))
</script>

<template>
  <GrResponseErrorBanner
    :error="props.error"
    :texts="mergedTexts"
    :tone="props.tone"
    :tone-by-kind="props.toneByKind"
    :field-labels="props.fieldLabels"
    show-field-labels
    :can-retry="props.canRetry"
    :can-dismiss="props.canDismiss"
    :auto-hide-kinds="props.autoHideKinds"
    :test-id-prefix="props.testIdPrefix"
    @retry="(info) => emit('retry', info)"
    @dismiss="emit('dismiss')"
  />
</template>
