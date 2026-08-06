import type { ShowcaseComponentExampleDoc } from '../types'

export const grResponseErrorBannerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'response-error-banner-presets',
    title: 'Универсальный баннер — пресеты ошибок',
    description: 'Базовый сценарий: классификация и отображение разных типов ошибок (network, abort, Laravel/JSON:API validation, RFC 7807, client/server, file validation, plain string) через `useResponseError()`.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-presets',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import {
  GrButton,
  GrFormField,
  GrResponseErrorBanner,
  GrSelect,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

const { currentError, setRaw, dismiss, retry } = useResponseError()
const selectedPreset = ref('laravel-422')

async function trigger() {
  // build raw axios/fetch-like error per selectedPreset
  // и передать в setRaw(raw)
}

function onRetry(_info: ResponseErrorInfo) {
  retry(() => {
    // повтор запроса
  })
}
</script>

<template>
  <GrFormField label="Пресет ошибки">
    <GrSelect v-model="selectedPreset" :options="presetOptions" />
  </GrFormField>
  <GrButton size="sm" @click="trigger">Бросить ошибку</GrButton>
  <GrResponseErrorBanner :error="currentError" can-retry @retry="onRetry" @dismiss="dismiss" />
</template>`,
  },
  {
    id: 'response-error-banner-kind-filter',
    title: 'Фильтрация по `kind` — баннер реагирует только на нужные ошибки',
    description: 'Whitelist через `autoHideKinds`: разрешаем `network` и `validation` (включая Laravel 422 с `errors`). Остальные ошибки (`client`, `server`, `aborted`) тихо проглатываются — `setRaw()` возвращает `null` и баннер не рендерится. Чекбоксы в демо позволяют менять whitelist на лету.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-kind-filter',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrResponseErrorBanner,
  type ResponseErrorKind,
  useResponseError,
} from '@feugene/granularity'

const ALL_KINDS: ResponseErrorKind[] = ['network', 'aborted', 'validation', 'client', 'server', 'unknown']
const allowedKinds = ref<ResponseErrorKind[]>(['network', 'validation'])

const autoHideKinds = computed(() => ALL_KINDS.filter(k => !allowedKinds.value.includes(k)))

const { currentError, setRaw, dismiss } = useResponseError({
  autoHideKinds: () => autoHideKinds.value,
})

async function handle(raw: unknown) {
  const info = await setRaw(raw)
  // info === null  -> kind не в whitelist, баннер скрыт
  // info !== null  -> классифицирован и показан
}
</script>

<template>
  <GrResponseErrorBanner :error="currentError" can-retry @dismiss="dismiss" />
</template>`,
  },
  {
    id: 'response-error-banner-upload',
    title: 'GrUploadErrorBanner — пресет для загрузки файлов',
    description: 'Тонкая обёртка над `GrResponseErrorBanner` с текстами под «загрузка», `canRetry=true` и опциональным prop `files`, попадающим в payload события `retry`.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-upload',
    code: `<script setup lang="ts">
import { shallowRef } from 'vue'

import {
  GrUploadErrorBanner,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

const { classify } = useResponseError({ texts: () => ({ retryLabel: 'Загрузить снова' }) })
const error = shallowRef<ResponseErrorInfo | null>(null)

async function onUploadFailed(raw: unknown) {
  error.value = await classify(raw)
}
</script>

<template>
  <GrUploadErrorBanner
    :error="error"
    :files="[new File([], 'photo.heic')]"
    @retry="({ files }) => retryUpload(files)"
    @dismiss="error = null"
  />
</template>`,
  },
  {
    id: 'response-error-banner-form',
    title: 'GrFormErrorBanner — пресет для формы',
    description: 'Обёртка для формы: `showFieldLabels=true`, `canRetry=false`, validation tone = warning, `fieldLabels` для человекочитаемых подписей полей в списке ошибок.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-form',
    code: `<script setup lang="ts">
import { shallowRef } from 'vue'

import {
  GrFormErrorBanner,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

const { classify } = useResponseError()
const error = shallowRef<ResponseErrorInfo | null>(null)

async function onSubmitFailed(raw: unknown) {
  error.value = await classify(raw)
}
</script>

<template>
  <GrFormErrorBanner
    :error="error"
    :field-labels="{ email: 'E-mail', password: 'Пароль' }"
    @dismiss="error = null"
  />
</template>`,
  },
  {
    id: 'response-error-banner-fallback',
    title: 'Server message vs. classifier fallback',
    description: 'Сообщение подменяется переводом только тогда, когда его подставил сам классификатор (`isFallbackMessage`). Ответ сервера остаётся на экране, даже если его текст дословно совпал с дефолтным — прежнее опознание фолбэка сравнением строк выбрасывало такой ответ молча.',
    status: 'ready',
    previewKey: 'gr-response-error-banner-fallback',
    code: `<script setup lang="ts">
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
    super(\`Request failed with status \${status}\`)
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
</template>`,
  },
]
