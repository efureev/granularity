import type { ShowcaseComponentExampleDoc } from '../types'

export const grFileUploadExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'file-upload-validation',
    title: 'Validation bridge with upload request',
    description: 'Главный сценарий для `GrFileUpload`: validators, upload lifecycle и понятное отображение последнего результата загрузки.',
    status: 'ready',
    previewKey: 'gr-file-upload-validation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import {
  GrFileUpload,
  acceptValidator,
  maxSizeMbValidator,
} from '@feugene/granularity'

const lastResult = ref('No uploads yet')

async function request(files: File[], ctx: { extraData?: Record<string, string> }) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    count: files.length,
    names: files.map(file => file.name),
    extraData: ctx.extraData,
  }
}
</script>

<template>
  <GrFileUpload
    :request="request"
    :validators="[acceptValidator('image/*,.pdf'), maxSizeMbValidator(2)]"
    :upload-extra-data="() => ({ bucket: 'showcase' })"
    show-file-list
  />
</template>`,
    note: 'Покрывает основной integration-case между компонентом и utility-слоем `fileValidation`.',
  },
  {
    id: 'file-upload-custom-ui',
    title: 'Custom trigger UI',
    description: 'Показываем режим без стандартной dropzone-разметки: `GrFileUpload` остаётся orchestrator-слоем, а UI можно собрать из других компонентов пакета.',
    status: 'ready',
    previewKey: 'gr-file-upload-custom-ui',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFileUpload } from '@feugene/granularity'

const files = ref<string[]>([])

async function request(selected: File[]) {
  files.value = selected.map(file => file.name)
  return { uploaded: selected.length }
}
</script>

<template>
  <GrFileUpload :request="request">
    <template #default="{ openDialog }">
      <GrButton type="button" @click="openDialog">
        Select files
      </GrButton>
    </template>
  </GrFileUpload>
</template>`,
  },
  {
    id: 'file-upload-disabled-and-limit',
    title: 'Disabled and guarded states',
    description: 'Отдельно фиксируем не happy-path режимы: disabled, limit guard и обратную связь через `onExceed`.',
    status: 'ready',
    previewKey: 'gr-file-upload-disabled-and-limit',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFileUpload } from '@feugene/granularity'

const message = ref('Try selecting more than one file')

async function request(files: File[]) {
  message.value = 'Uploaded ' + files.length + ' file(s)'
  return { ok: true }
}

function onExceed(files: File[], limit: number) {
  message.value = 'Received ' + files.length + ' files, limit is ' + limit
}
</script>

<template>
  <GrFileUpload
    :request="request"
    :limit="1"
    :on-exceed="onExceed"
  />

  <GrFileUpload disabled :request="request" />
</template>`,
    note: 'Не-happy-path нужен отдельно, чтобы быстро проверить доступность, disable-state и защиту от превышения лимита.',
  },
  {
    id: 'file-upload-progress',
    title: 'Upload progress with default bar',
    description: 'Дефолтный `GrProgressBar` в зарезервированной зоне: переключение `idle ↔ uploading ↔ success` без layout shift. Прогресс приходит из `ctx.onProgress`, который вызывает пользовательский `request` — этот контракт совместим с `axios.onUploadProgress`.',
    status: 'ready',
    previewKey: 'gr-file-upload-progress',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFileUpload } from '@feugene/granularity'
import type { GrFileUploadRequestCtx, GrUploadState } from '@feugene/granularity'

const lastPercent = ref(0)
const phase = ref<GrUploadState['phase']>('idle')

async function request(files: File[], ctx: GrFileUploadRequestCtx) {
  const total = files.reduce((sum, file) => sum + file.size, 0) || 1
  let loaded = 0
  const step = Math.max(1, Math.floor(total / 20))

  while (loaded < total) {
    if (ctx.signal.aborted) throw new Error('aborted')
    await new Promise(resolve => setTimeout(resolve, 80))
    loaded = Math.min(total, loaded + step)
    ctx.onProgress?.({
      percent: (loaded / total) * 100,
      loaded,
      total,
      indeterminate: false,
    })
  }

  return { uploaded: files.length }
}
</script>

<template>
  <GrFileUpload
    :request="request"
    multiple
    @progress="(percent) => (lastPercent = percent)"
    @state-change="(state) => (phase = state.phase)"
  />
</template>`,
    note: 'Покрывает связку `ctx.onProgress` → `state-change` → дефолтный `GrProgressBar`. Без слотов.',
  },
  {
    id: 'file-upload-progress-slot',
    title: 'Custom progress via scoped slot',
    description: 'Кастомный круговой индикатор и кнопка отмены — через scoped-слот `progress`. Дефолтный бар выключен через `:show-progress="false"`.',
    status: 'ready',
    previewKey: 'gr-file-upload-progress-slot',
    code: `<script setup lang="ts">
import { GrButton, GrFileUpload } from '@feugene/granularity'
import type { GrFileUploadRequestCtx } from '@feugene/granularity'

async function request(files: File[], ctx: GrFileUploadRequestCtx) {
  // … вызывает ctx.onProgress(...) по мере загрузки
  return { ok: true }
}
</script>

<template>
  <GrFileUpload :request="request" :show-progress="false" multiple>
    <template #progress="{ percent, indeterminate, phase, abort }">
      <div v-if="phase !== 'idle'" class="flex items-center gap-3">
        <span class="tabular-nums">{{ indeterminate ? '…' : Math.round(percent) + '%' }}</span>
        <GrButton v-if="phase === 'uploading'" size="sm" variant="ghost" @click="abort">
          Cancel
        </GrButton>
      </div>
    </template>
  </GrFileUpload>
</template>`,
    note: 'Demonstrates `#progress` slot payload: `percent`, `indeterminate`, `phase`, `files`, `abort`, `state`.',
  },
  {
    id: 'file-upload-action-xhr',
    title: 'Action endpoint with real XHR progress',
    description: 'Сценарий `action`: компонент сам формирует `multipart/form-data` и отправляет POST через `XMLHttpRequest`, давая реальный `upload.onprogress` без какого-либо кода пользователя. Отмена — внутренний `AbortController`.',
    status: 'ready',
    previewKey: 'gr-file-upload-action-xhr',
    code: `<script setup lang="ts">
import { GrFileUpload } from '@feugene/granularity'
</script>

<template>
  <GrFileUpload
    action="https://httpbin.org/post"
    name="file"
    multiple
    :upload-extra-data="() => ({ source: 'granularity-showcase' })"
  />
</template>`,
    note: 'Подтверждает миграцию с `fetch` на `XMLHttpRequest`: для action-режима теперь доступен реальный процент. Для просмотра прогресса используй файлы >1 МБ.',
  },
]
