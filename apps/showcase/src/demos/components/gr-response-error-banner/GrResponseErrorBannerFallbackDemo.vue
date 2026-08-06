<script setup lang="ts">
import { ref, shallowRef } from 'vue'

import {
  GrButton,
  GrResponseErrorBanner,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

const { currentError, setRaw, dismiss } = useResponseError()
const source = ref('—')

// Русские тексты вместо английских дефолтов: на них и видно, что подменяется,
// а что нет.
const texts = {
  networkMessage: 'Нет связи с сервером — проверьте интернет.',
  serverMessage: 'Сервер не справился, попробуйте ещё раз.',
}

class FakeHttpError extends Error {
  isAxiosError = true
  response: { status: number, data: unknown }

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`)
    this.name = 'AxiosError'
    this.response = { status, data }
  }
}

async function showServerMessage() {
  source.value = 'Сообщение сервера'
  // Сервер вернул текст, дословно совпадающий с английским дефолтом пакета.
  await setRaw(new FakeHttpError(500, { message: 'A server error occurred. Please try again.' }))
}

async function showFallback() {
  source.value = 'Фолбэк классификатора'
  // Тела нет — сообщение подставит классификатор и пометит флагом.
  await setRaw(new FakeHttpError(500, null))
}

const lastInfo = shallowRef<ResponseErrorInfo | null>(null)
function onRetry(info: ResponseErrorInfo) {
  lastInfo.value = info
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton variant="outline" @click="showServerMessage">
        Ответ с сообщением
      </GrButton>
      <GrButton variant="outline" @click="showFallback">
        Ответ без сообщения
      </GrButton>
      <GrButton variant="ghost" @click="dismiss">
        Скрыть
      </GrButton>
    </div>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Источник текста: <span class="font-medium text-[var(--gr-fg)]">{{ source }}</span>
      <template v-if="currentError">
        · isFallbackMessage: {{ String(currentError.isFallbackMessage) }}
      </template>
    </div>

    <GrResponseErrorBanner
      :error="currentError"
      :texts="texts"
      can-retry
      @retry="onRetry"
      @dismiss="dismiss"
    />

    <div v-if="lastInfo" class="text-xs text-[var(--gr-muted-fg)]">
      Повтор запрошен для kind={{ lastInfo.kind }}
    </div>
  </div>
</template>
