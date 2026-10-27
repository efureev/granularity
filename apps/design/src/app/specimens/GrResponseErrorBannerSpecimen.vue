<script setup lang="ts">
import { ref } from 'vue'

import type { ResponseErrorInfo } from '@feugene/granularity'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const FIELD_LABELS = { inn: 'ИНН', due_date: 'Срок оплаты' }

function validationError(): ResponseErrorInfo {
  return {
    kind: 'validation',
    status: 422,
    message: 'Счёт не сохранён: исправьте поля и отправьте ещё раз.',
    fieldErrors: [
      { field: 'inn', messages: ['ИНН должен состоять из 10 или 12 цифр.'] },
      { field: 'due_date', messages: ['Срок оплаты не может быть раньше даты счёта.'] },
    ],
    raw: {
      status: 422,
      body: {
        message: 'The given data was invalid.',
        errors: {
          inn: ['ИНН должен состоять из 10 или 12 цифр.'],
          due_date: ['Срок оплаты не может быть раньше даты счёта.'],
        },
      },
    },
  }
}

function serverError(): ResponseErrorInfo {
  return {
    kind: 'server',
    status: 503,
    message: 'Сервис отчётов временно недоступен.',
    details: ['Данные не потеряны — повторите запрос через минуту.'],
    raw: { status: 503, body: { message: 'Service Unavailable' } },
  }
}

// Ответа не было вовсе: сообщение подставил классификатор, и баннер берёт перевод из словаря.
function networkError(): ResponseErrorInfo {
  return {
    kind: 'network',
    message: 'Check your internet connection and try again.',
    isFallbackMessage: true,
    raw: new TypeError('Failed to fetch'),
  }
}

const previewError = ref<ResponseErrorInfo | null>(serverError())

const invoiceError = ref<ResponseErrorInfo | null>(validationError())
const reportError = ref<ResponseErrorInfo | null>(serverError())
const reportLoaded = ref(false)
const syncError = ref<ResponseErrorInfo | null>(networkError())

function retryReport(): void {
  reportError.value = null
  reportLoaded.value = true
}

function failReport(): void {
  reportLoaded.value = false
  reportError.value = serverError()
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrResponseErrorBanner
      :error="previewError"
      :show-details="false"
      @dismiss="previewError = null"
    />
    <div v-if="!previewError">
      <GrButton size="sm" variant="ghost" tone="neutral" @click="previewError = serverError()">
        Показать ошибку снова
      </GrButton>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ошибки полей · 422" note="Ошибки по полям — списком с подписями полей; validation — тон warning.">
      <GrResponseErrorBanner
        :error="invoiceError"
        :field-labels="FIELD_LABELS"
        @dismiss="invoiceError = null"
      />
      <div v-if="!invoiceError">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="invoiceError = validationError()">
          Показать ошибку снова
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Сбой сервера · 503" note="canRetry даёт повтор: кнопка берёт тон баннера, статус HTTP — для поддержки.">
      <GrResponseErrorBanner
        :error="reportError"
        can-retry
        @retry="retryReport"
        @dismiss="reportError = null"
      />
      <div v-if="!reportError">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="failReport">
          Показать ошибку снова
        </GrButton>
      </div>
      <!-- Регион живёт постоянно: вставленный вместе с текстом, он объявляется не всеми дикторами. -->
      <p role="status" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        {{ reportLoaded ? 'Сервис ответил со второй попытки — отчёт загружен.' : '' }}
      </p>
    </Specimen>

    <Specimen title="Нет связи" note="Без статуса бейджа нет; заголовок и текст — из словаря по виду ошибки, а не из ответа транспорта.">
      <GrResponseErrorBanner
        :error="syncError"
        can-retry
        @retry="syncError = null"
        @dismiss="syncError = null"
      />
      <div v-if="!syncError">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="syncError = networkError()">
          Показать ошибку снова
        </GrButton>
      </div>
    </Specimen>
  </div>
</template>
