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

import type { GrFileUploadExtraData, GrFileUploadRequestCtx } from '@feugene/granularity'
import {
  GrFileUpload,
  acceptValidator,
  maxFileSize,
} from '@feugene/granularity'

const lastResult = ref('No uploads yet')

async function request(files: File[], ctx: GrFileUploadRequestCtx) {
  await new Promise(resolve => window.setTimeout(resolve, 250))

  return {
    count: files.length,
    names: files.map(file => file.name),
    extraData: ctx.extraData,
  }
}

function onSuccess(payload: { count: number; names: string[]; extraData?: GrFileUploadExtraData }) {
  const bucketValue = payload.extraData?.bucket
  const bucketLabel = typeof bucketValue === 'string' ? bucketValue : 'n/a'
  lastResult.value = \`uploaded \${payload.count} file(s): \${payload.names.join(', ') || '—'} · bucket=\${bucketLabel}\`
}

function onError(error: unknown) {
  lastResult.value = error instanceof Error ? error.message : String(error)
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload
      :request="request"
      :validators="[acceptValidator('image/*,.pdf'), maxFileSize({ mb: 2 })]"
      :upload-extra-data="() => ({ bucket: 'showcase' })"
      show-file-list
      @success="onSuccess"
      @error="onError"
    >
      <template #label>
        Upload a file for validation demo
      </template>

      <template #tip>
        image/* or .pdf · max 2 Mb
      </template>
    </GrFileUpload>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      {{ lastResult }}
    </div>
  </div>
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

type GrFileUploadInstance = InstanceType<typeof GrFileUpload>

const uploader = ref<GrFileUploadInstance | null>(null)
const files = ref<string[]>([])

async function request(selected: File[]) {
  files.value = selected.map(file => file.name)
  return { uploaded: selected.length }
}

function openFileDialog() {
  uploader.value?.openDialog()
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload ref="uploader" :request="request">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton type="button" @click="openFileDialog">
          Select files
        </GrButton>
        <span class="text-sm text-[var(--gr-muted-fg)]">
          {{ files.length ? files.join(', ') : 'No files selected yet' }}
        </span>
      </div>
    </GrFileUpload>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      В этом режиме библиотека отвечает за file-handling, а триггер можно строить из любых UI primitives пакета.
    </div>
  </div>
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

const message = ref('Try selecting more than one file in the active uploader')
const submitted = ref([new File(['contract'], 'contract.pdf', { type: 'application/pdf' })])

async function request(files: File[]) {
  message.value = \`Uploaded \${files.length} file(s)\`
  return { ok: true }
}

function onExceed(files: File[], limit: number) {
  message.value = \`Received \${files.length} files, limit is \${limit}\`
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Limit guard
      </div>
      <GrFileUpload
        :request="request"
        multiple
        :limit="1"
        :on-exceed="onExceed"
      >
        <template #tip>
          Limit is 1 file
        </template>
      </GrFileUpload>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Disabled state
      </div>
      <GrFileUpload disabled :request="request">
        <template #tip>
          Interactions are blocked in disabled mode
        </template>
      </GrFileUpload>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Readonly state
      </div>
      <GrFileUpload
        v-model="submitted"
        readonly
        show-file-list
        :request="request"
      >
        <template #tip>
          The set stays visible and reaches the form, but cannot be changed
        </template>
      </GrFileUpload>
    </div>

    <div class="lg:col-span-3 text-sm text-[var(--gr-muted-fg)]">
      {{ message }}
    </div>
  </div>
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
import type { GrFileUploadRequestCtx } from '@feugene/granularity'

const lastPercent = ref(0)
const phase = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')

/**
 * Имитация загрузки с реальным прогрессом: пользовательский \`request\` вызывает
 * \`ctx.onProgress\` так же, как это делает \`axios.onUploadProgress\` или \`xhr.upload.onprogress\`.
 */
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

function onProgress(percent: number) {
  lastPercent.value = percent
}

function onStateChange(state: { phase: 'idle' | 'uploading' | 'success' | 'error' }) {
  phase.value = state.phase
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload
      :request="request"
      multiple
      @progress="onProgress"
      @state-change="onStateChange"
    />

    <div class="text-sm text-[var(--gr-muted-fg)] tabular-nums">
      phase: <strong>{{ phase }}</strong> · last progress: <strong>{{ Math.round(lastPercent) }}%</strong>
    </div>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Дефолтный \`GrProgressBar\` рендерится в зарезервированной зоне — переключение
      \`idle ↔ uploading ↔ success\` не вызывает layout shift. Прогресс приходит из
      \`ctx.onProgress\`, который пользователь сам вызывает в своём \`request\`.
    </div>
  </div>
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
import type { GrFileUploadRequestCtx, GrUploadState } from '@feugene/granularity'

/**
 * Кастомный UI прогресса через scoped-слот \`progress\`.
 * Полностью отключаем дефолтный \`GrProgressBar\` через \`:show-progress="false"\`.
 */
async function request(files: File[], ctx: GrFileUploadRequestCtx) {
  const total = files.reduce((sum, file) => sum + file.size, 0) || 1
  let loaded = 0
  const step = Math.max(1, Math.floor(total / 25))

  while (loaded < total) {
    if (ctx.signal.aborted) throw new Error('aborted')
    await new Promise(resolve => setTimeout(resolve, 60))
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

function phaseLabel(state: GrUploadState): string {
  if (state.phase === 'uploading') return state.indeterminate ? 'Sending…' : 'Uploading'
  if (state.phase === 'success') return 'Done'
  if (state.phase === 'error') return 'Failed'
  return 'Idle'
}
</script>

<template>
  <GrFileUpload
    :request="request"
    :show-progress="false"
    multiple
  >
    <template #progress="{ percent, indeterminate, phase, abort }">
      <div
        v-if="phase !== 'idle'"
        class="mt-3 flex items-center gap-3 rounded-md border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3"
      >
        <div
          class="relative h-10 w-10 shrink-0 rounded-full"
          :style="{
            background: indeterminate
              ? 'conic-gradient(var(--gr-primary) 0 25%, var(--gr-muted) 0)'
              : \`conic-gradient(var(--gr-primary) 0 \${percent}%, var(--gr-muted) 0)\`,
            transition: 'background 120ms linear',
          }"
        >
          <div class="absolute inset-1 rounded-full bg-[var(--gr-bg)] grid place-items-center text-[10px] tabular-nums">
            {{ indeterminate ? '…' : \`\${Math.round(percent)}%\` }}
          </div>
        </div>

        <div class="flex-1 text-sm">
          <div class="font-medium">
            {{ phaseLabel({ phase, percent, indeterminate } as GrUploadState) }}
          </div>
          <div class="text-[var(--gr-muted-fg)]">
            Custom circular indicator via <code>#progress</code> slot
          </div>
        </div>

        <GrButton
          v-if="phase === 'uploading'"
          size="sm"
          variant="ghost"
          @click="abort"
        >
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
import { ref } from 'vue'

import { GrFileUpload } from '@feugene/granularity'
import type { GrUploadState } from '@feugene/granularity'

/**
 * Сценарий \`action\`: компонент сам шлёт POST \`multipart/form-data\` через XHR.
 * \`xhr.upload.onprogress\` даёт реальный процент без какого-либо кода со стороны
 * пользователя. Здесь используется публичный echo-endpoint — для просмотра
 * прогресса лучше загружать файлы потяжелее.
 */
const ENDPOINT = 'https://httpbin.org/post'

const phase = ref<GrUploadState['phase']>('idle')
const lastError = ref<string | null>(null)

function onStateChange(state: GrUploadState) {
  phase.value = state.phase
  if (state.phase !== 'error') lastError.value = null
}

function onError(error: unknown) {
  lastError.value = error instanceof Error ? error.message : String(error)
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload
      :action="ENDPOINT"
      name="file"
      multiple
      :upload-extra-data="() => ({ source: 'granularity-showcase' })"
      @state-change="onStateChange"
      @error="onError"
    />

    <div class="text-sm text-[var(--gr-muted-fg)] tabular-nums">
      phase: <strong>{{ phase }}</strong>
      <span v-if="lastError" class="text-[var(--danger)]"> · {{ lastError }}</span>
    </div>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Endpoint: <code>{{ ENDPOINT }}</code>. Прогресс приходит из
      <code>XMLHttpRequest.upload.onprogress</code>, отмена — через
      внутренний <code>AbortController</code>.
    </div>
  </div>
</template>`,
    note: 'Подтверждает миграцию с `fetch` на `XMLHttpRequest`: для action-режима теперь доступен реальный процент. Для просмотра прогресса используй файлы >1 МБ.',
  },
  {
    id: 'file-upload-sizes',
    title: 'Шкала размеров',
    description: 'Меняются поля дроп-зоны, плитка иконки и кегль подписей; вложенный `GrProgressBar` получает толщину из того же размера.',
    status: 'ready',
    previewKey: 'gr-file-upload-sizes',
    code: `<script setup lang="ts">
import { GrFileUpload } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrFileUpload :size="size" placeholder="Drag files here or click to select">
        <template #tip>
          PDF or PNG, up to 10 MB
        </template>
      </GrFileUpload>
    </div>
  </div>
</template>`,
  },
  {
    id: 'file-upload-retry',
    title: 'Accept, remove and retry',
    description: '`accept` фильтрует и диалог, и перетаскивание; набор файлов после ошибки остаётся, лишний убирается из списка, а `retry()` повторяет загрузку без повторного выбора.',
    status: 'ready',
    previewKey: 'gr-file-upload-retry',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFileUpload } from '@feugene/granularity'

type GrFileUploadInstance = InstanceType<typeof GrFileUpload>

const uploader = ref<GrFileUploadInstance>()
const failNext = ref(true)
const status = ref('—')

// Первая попытка падает намеренно: показываем, что после ошибки набор файлов
// остаётся и повторить можно без повторного выбора.
async function request(files: File[]): Promise<{ ok: true }> {
  await new Promise(resolve => setTimeout(resolve, 600))

  if (failNext.value) {
    failNext.value = false
    throw new Error(\`Server rejected \${files.length} file(s)\`)
  }

  return { ok: true }
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload
      ref="uploader"
      :request="request"
      accept="image/*,.pdf"
      multiple
      show-file-list
      @error="status = String($event)"
      @success="status = 'uploaded'"
    />

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" variant="outline" @click="uploader?.retry()">
        Retry upload
      </GrButton>
      <span class="text-sm text-[var(--gr-muted-fg)]">
        Status: <span class="font-semibold text-[var(--gr-fg)]">{{ status }}</span>
      </span>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      \`accept\` фильтрует и системный диалог, и перетаскивание. Лишний файл убирается крестиком в списке —
      повтор уйдёт уже без него.
    </div>
  </div>
</template>`,
  },
  {
    id: 'file-upload-per-file',
    title: 'Per-file upload with previews',
    description: '`uploadMode="per-file"` отправляет каждый файл своим запросом (`request` при этом зовётся с массивом из одного файла — контракт не меняется), `concurrency` ограничивает число одновременных соединений, а у строки появляются статус, процент, отмена и повтор именно её. `preview` рисует миниатюры для `image/*` и честно отзывает object URL при удалении и размонтировании.',
    status: 'ready',
    previewKey: 'gr-file-upload-per-file',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrFileUpload } from '@feugene/granularity'

type UploadedFile = { id: string, name: string }

const uploaded = ref<UploadedFile[]>([])
const failed = ref<string[]>([])

// Каждый второй файл падает с первой попытки: так видно, что повторяется
// именно упавшая строка, а соседние остаются загруженными.
const attempts = new Map<string, number>()

async function request(files: File[]): Promise<UploadedFile> {
  const file = files[0]
  const attempt = (attempts.get(file.name) ?? 0) + 1
  attempts.set(file.name, attempt)

  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 700))

  if (attempt === 1 && file.name.length % 2 === 0) {
    failed.value = [...new Set([...failed.value, file.name])]
    throw new Error(\`Server rejected \${file.name}\`)
  }

  const result = { id: \`\${file.name}-\${attempt}\`, name: file.name }
  uploaded.value = [...uploaded.value, result]
  failed.value = failed.value.filter(name => name !== file.name)
  return result
}
</script>

<template>
  <div class="grid gap-3">
    <!-- \`request\` зовётся с массивом из одного файла: контракт тот же, что в
         батчевом режиме, поэтому загрузчик потребителя не переписывается.
         Тип ответа (\`UploadedFile\`) выводится из самого \`request\` — payload
         события \`success\` типизирован им же. -->
    <GrFileUpload
      :request="request"
      upload-mode="per-file"
      :concurrency="2"
      accept="image/*"
      multiple
      preview
      show-file-list
    />

    <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--gr-muted-fg)]">
      <span>Загружено:</span>
      <GrBadge v-for="item in uploaded" :key="item.id" size="sm" tone="success">
        {{ item.name }}
      </GrBadge>
      <template v-if="failed.length">
        <span>· не прошли:</span>
        <GrBadge v-for="name in failed" :key="name" size="sm" tone="danger">
          {{ name }}
        </GrBadge>
      </template>
    </div>
  </div>
</template>`,
  },
]
