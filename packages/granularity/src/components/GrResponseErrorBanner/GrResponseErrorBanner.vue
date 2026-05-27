<script setup lang="ts">
import { computed } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrAlert from '../GrAlert/GrAlert.vue'
import GrButton from '../GrButton/GrButton.vue'

import { resolveResponseErrorTitle } from './parsers/createResponseErrorClassifier'
import {
  DEFAULT_AUTO_HIDE_KINDS,
  DEFAULT_RESPONSE_ERROR_TEXTS,
  DEFAULT_TONE_BY_KIND,
} from './responseError.defaults'
import type {
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorTexts,
  ResponseErrorTone,
} from './responseError.types'

export type {
  ResponseErrorInfo,
  ResponseErrorKind,
  ResponseErrorTexts,
  ResponseErrorTone,
} from './responseError.types'

const props = withDefaults(defineProps<{
  /** Готовая структура ошибки. Если `null` — баннер не рендерится. */
  error: ResponseErrorInfo | null
  /** Частичный override текстов. Мерджится с `DEFAULT_RESPONSE_ERROR_TEXTS`. */
  texts?: Partial<ResponseErrorTexts>
  /** Жёсткий оверрайд тона. Бьёт `toneByKind`. */
  tone?: ResponseErrorTone
  /** Маппинг `kind` → `tone`. Мерджится с `DEFAULT_TONE_BY_KIND`. */
  toneByKind?: Partial<Record<ResponseErrorKind, ResponseErrorTone>>
  /** Показывать ли блок `details`/`fieldErrors` под основным сообщением. */
  showDetails?: boolean
  /** Префиксить ли `field:` перед сообщениями по полям. */
  showFieldLabels?: boolean
  /** Человекочитаемые подписи полей (`{ file: 'Файл' }`). */
  fieldLabels?: Record<string, string>
  /** Удалять дубликаты сообщений между `message` и `details`. */
  dedupeDetails?: boolean
  /** Показывать ли кнопку «Повторить». */
  canRetry?: boolean
  /** Показывать ли кнопку «Скрыть». */
  canDismiss?: boolean
  /** Какие `kind` не рендерить вообще (баннер скрывается). */
  autoHideKinds?: ResponseErrorKind[]
  /** Показывать ли HTTP-status бейдж. */
  showStatus?: boolean
  /** Префикс `data-testid`. */
  testIdPrefix?: string
}>(), {
  texts: () => ({}),
  tone: undefined,
  toneByKind: () => ({}),
  showDetails: true,
  showFieldLabels: true,
  fieldLabels: () => ({}),
  dedupeDetails: true,
  canRetry: false,
  canDismiss: true,
  autoHideKinds: () => DEFAULT_AUTO_HIDE_KINDS,
  showStatus: true,
  testIdPrefix: 'response-error',
})

const emit = defineEmits<{
  (e: 'retry', error: ResponseErrorInfo): void
  (e: 'dismiss'): void
}>()

const { t } = useGranularityTranslations()

const i18nTexts = computed<ResponseErrorTexts>(() => {
  const out = {} as ResponseErrorTexts
  for (const key of Object.keys(DEFAULT_RESPONSE_ERROR_TEXTS) as (keyof ResponseErrorTexts)[]) {
    out[key] = t(`gr.responseError.${key}`, DEFAULT_RESPONSE_ERROR_TEXTS[key])
  }
  return out
})

const mergedTexts = computed<ResponseErrorTexts>(() => ({
  ...DEFAULT_RESPONSE_ERROR_TEXTS,
  ...i18nTexts.value,
  ...props.texts,
}))

const mergedToneByKind = computed<Record<ResponseErrorKind, ResponseErrorTone>>(() => ({
  ...DEFAULT_TONE_BY_KIND,
  ...props.toneByKind,
}))

const isHidden = computed(() => {
  if (!props.error) return true
  return props.autoHideKinds.includes(props.error.kind)
})

const tone = computed<ResponseErrorTone>(() => {
  if (props.tone) return props.tone
  if (!props.error) return 'danger'
  return mergedToneByKind.value[props.error.kind] ?? 'danger'
})

const title = computed(() => {
  if (!props.error) return ''
  return resolveResponseErrorTitle(props.error.kind, mergedTexts.value)
})

/**
 * Маппинг `kind` → ключ поля сообщения в `ResponseErrorTexts`.
 * Используется, чтобы подменить «дефолтное английское» fallback-сообщение
 * классификатора на i18n-перевод (или текущий `mergedTexts.<kind>Message`).
 */
const KIND_MESSAGE_KEY: Record<ResponseErrorKind, keyof ResponseErrorTexts> = {
  network: 'networkMessage',
  aborted: 'abortedMessage',
  validation: 'validationMessage',
  client: 'clientMessage',
  server: 'serverMessage',
  unknown: 'unknownMessage',
}

const DEFAULT_FALLBACK_MESSAGES = new Set<string>([
  DEFAULT_RESPONSE_ERROR_TEXTS.networkMessage,
  DEFAULT_RESPONSE_ERROR_TEXTS.abortedMessage,
  DEFAULT_RESPONSE_ERROR_TEXTS.validationMessage,
  DEFAULT_RESPONSE_ERROR_TEXTS.clientMessage,
  DEFAULT_RESPONSE_ERROR_TEXTS.serverMessage,
  DEFAULT_RESPONSE_ERROR_TEXTS.unknownMessage,
])

const message = computed(() => {
  const raw = props.error?.message ?? ''
  if (!props.error) return raw
  // Если в `ResponseErrorInfo.message` сидит англ. дефолт-фолбэк классификатора,
  // подменяем на i18n-перевод соответствующего kind.
  if (!raw || DEFAULT_FALLBACK_MESSAGES.has(raw)) {
    return mergedTexts.value[KIND_MESSAGE_KEY[props.error.kind]]
  }
  return raw
})

/**
 * Сводный список «деталей» под основным `message`.
 * Предпочитаем `fieldErrors` (поле → сообщения), затем — плоский `details`.
 * Дедуплицируем и убираем повтор с `message`.
 */
const detailEntries = computed<{ field?: string, text: string }[]>(() => {
  if (!props.error || !props.showDetails) return []

  const seen = new Set<string>()
  if (props.dedupeDetails) {
    const main = message.value.trim()
    if (main) seen.add(main)
  }

  const result: { field?: string, text: string }[] = []
  const fieldErrors = props.error.fieldErrors
  if (fieldErrors?.length) {
    for (const fe of fieldErrors) {
      for (const m of fe.messages) {
        const text = m.trim()
        if (!text || seen.has(text)) continue
        seen.add(text)
        result.push({ field: fe.field, text })
      }
    }
    if (result.length) return result
  }

  const details = props.error.details
  if (details?.length) {
    for (const d of details) {
      const text = (d ?? '').trim()
      if (!text || seen.has(text)) continue
      seen.add(text)
      result.push({ text })
    }
  }
  return result
})

function fieldLabel(field?: string): string | undefined {
  if (!field) return undefined
  return props.fieldLabels[field] ?? field
}

function onRetry(): void {
  if (props.error) emit('retry', props.error)
}

function onDismiss(): void {
  emit('dismiss')
}
</script>

<template>
  <GrAlert
    v-if="!isHidden && props.error"
    :tone="tone"
    :title="title"
    :closable="props.canDismiss"
    :data-testid="`${props.testIdPrefix}-banner`"
    :data-kind="props.error.kind"
    @close="onDismiss"
  >
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="props.showStatus && typeof props.error.status === 'number'"
          class="inline-flex items-center rounded-[var(--ds-radius-sm)] bg-[color-mix(in_srgb,currentColor_12%,transparent)] px-1.5 py-0.5 text-[11px] font-700 leading-none"
          :data-testid="`${props.testIdPrefix}-status`"
        >
          HTTP {{ props.error.status }}
        </span>
        <span
          class="text-[13px]"
          :data-testid="`${props.testIdPrefix}-message`"
        >
          {{ message }}
        </span>
      </div>

      <ul
        v-if="detailEntries.length"
        class="m-0 list-disc pl-5 text-[12px]"
        :data-testid="`${props.testIdPrefix}-details`"
      >
        <li
          v-for="(entry, idx) in detailEntries"
          :key="`${entry.field ?? ''}:${idx}`"
        >
          <template v-if="props.showFieldLabels && entry.field">
            <strong>{{ fieldLabel(entry.field) }}:</strong>&nbsp;
          </template>{{ entry.text }}
        </li>
      </ul>

      <div
        v-if="props.canRetry"
        class="mt-1 flex flex-wrap items-center gap-2"
      >
        <GrButton
          size="sm"
          variant="outline"
          :data-testid="`${props.testIdPrefix}-retry`"
          @click="onRetry"
        >
          {{ mergedTexts.retryLabel }}
        </GrButton>
      </div>
    </div>
  </GrAlert>
</template>
