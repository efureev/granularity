<script setup lang="ts">
/**
 * Тонкая обёртка над `GrResponseErrorBanner` с предсетами для сценария
 * «загрузка файлов»:
 *
 * - Включена кнопка «Повторить» по умолчанию (`canRetry=true`).
 * - Тексты сдвинуты под загрузку файлов.
 * - Опциональный prop `files` пробрасывает контекст наружу через `retry`.
 *
 * Парсеры/нормализация — те же, что у базового баннера. Если нужны кастомные
 * парсеры — используйте напрямую `GrResponseErrorBanner` + `useResponseError`.
 */
import { computed } from 'vue'

import GrResponseErrorBanner from './GrResponseErrorBanner.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type {
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorTexts,
  ResponseErrorTone,
} from './responseError.types'

const props = withDefaults(defineProps<{
  error: ResponseErrorInfo | null
  /** Файлы, которые пытались загрузить — пробрасываются в `retry` payload. */
  files?: File[]
  texts?: Partial<ResponseErrorTexts>
  tone?: ResponseErrorTone
  toneByKind?: Partial<Record<ResponseErrorKind, ResponseErrorTone>>
  canRetry?: boolean
  canDismiss?: boolean
  autoHideKinds?: ResponseErrorKind[]
  testIdPrefix?: string
}>(), {
  files: () => [],
  texts: () => ({}),
  tone: undefined,
  toneByKind: () => ({}),
  canRetry: true,
  canDismiss: true,
  autoHideKinds: () => [],
  testIdPrefix: 'upload-error',
})

const emit = defineEmits<{
  (e: 'retry', payload: { error: ResponseErrorInfo, files: File[] }): void
  (e: 'dismiss'): void
}>()

const { t } = useGranularityTranslations()

// Пресеты «под загрузку файлов» резолвятся через i18n (fallback — англ. строки), иначе
// перекрыли бы i18n базового баннера как `props.texts`.
const uploadTexts = computed<Partial<ResponseErrorTexts>>(() => ({
  networkTitle: t('gr.uploadErrorBanner.networkTitle', 'Failed to upload files'),
  networkMessage: t('gr.uploadErrorBanner.networkMessage', 'Check your connection and try again.'),
  validationTitle: t('gr.uploadErrorBanner.validationTitle', 'Files did not pass validation'),
  validationMessage: t('gr.uploadErrorBanner.validationMessage', 'Some of the files do not meet the requirements.'),
  serverTitle: t('gr.uploadErrorBanner.serverTitle', 'Upload error on the server'),
  serverMessage: t('gr.uploadErrorBanner.serverMessage', 'The server could not process the upload. Please try again.'),
}))

const mergedTexts = computed<Partial<ResponseErrorTexts>>(() => ({
  ...uploadTexts.value,
  ...props.texts,
}))

function onRetry(info: ResponseErrorInfo): void {
  emit('retry', { error: info, files: props.files })
}
</script>

<template>
  <GrResponseErrorBanner
    :error="props.error"
    :texts="mergedTexts"
    :tone="props.tone"
    :tone-by-kind="props.toneByKind"
    :can-retry="props.canRetry"
    :can-dismiss="props.canDismiss"
    :auto-hide-kinds="props.autoHideKinds"
    :test-id-prefix="props.testIdPrefix"
    @retry="onRetry"
    @dismiss="emit('dismiss')"
  />
</template>
