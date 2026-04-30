import type { ShowcaseComponentExampleDoc } from '../types'

export const grFileUploadExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'file-upload-validation',
    title: 'Validation bridge with upload request',
    description: 'Главный сценарий для `GrFileUpload`: validators, upload lifecycle и понятное отображение последнего результата загрузки.',
    status: 'ready',
    previewKey: 'ds-file-upload-validation',
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
    previewKey: 'ds-file-upload-custom-ui',
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
    previewKey: 'ds-file-upload-disabled-and-limit',
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
]
