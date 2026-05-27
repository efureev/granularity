import type { ShowcaseComponentExampleDoc } from '../types'

export const grResponseErrorBannerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'response-error-banner-presets',
    title: 'Универсальный баннер — пресеты ошибок',
    description: 'Базовый сценарий: классификация и отображение разных типов ошибок (network, abort, Laravel/JSON:API validation, RFC 7807, client/server, file validation, plain string) через `useResponseError()`.',
    status: 'ready',
    previewKey: 'ds-response-error-banner-presets',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import {
  GrButton,
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
  <GrSelect v-model="selectedPreset" :options="presetOptions" />
  <GrButton size="sm" @click="trigger">Бросить ошибку</GrButton>
  <GrResponseErrorBanner :error="currentError" can-retry @retry="onRetry" @dismiss="dismiss" />
</template>`,
  },
  {
    id: 'response-error-banner-kind-filter',
    title: 'Фильтрация по `kind` — баннер реагирует только на нужные ошибки',
    description: 'Whitelist через `autoHideKinds`: разрешаем `network` и `validation` (включая Laravel 422 с `errors`). Остальные ошибки (`client`, `server`, `aborted`) тихо проглатываются — `setRaw()` возвращает `null` и баннер не рендерится. Чекбоксы в демо позволяют менять whitelist на лету.',
    status: 'ready',
    previewKey: 'ds-response-error-banner-kind-filter',
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
  // info === null  → kind не в whitelist, баннер скрыт
  // info !== null  → классифицирован и показан
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
    previewKey: 'ds-response-error-banner-upload',
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
    previewKey: 'ds-response-error-banner-form',
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
]
