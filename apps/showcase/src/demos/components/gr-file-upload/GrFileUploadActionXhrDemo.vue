<script setup lang="ts">
import { ref } from 'vue'

import { GrFileUpload } from '@feugene/granularity'
import type { GrUploadState } from '@feugene/granularity'

/**
 * Сценарий `action`: компонент сам шлёт POST `multipart/form-data` через XHR.
 * `xhr.upload.onprogress` даёт реальный процент без какого-либо кода со стороны
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

    <div class="text-sm text-[var(--muted-fg)] tabular-nums">
      phase: <strong>{{ phase }}</strong>
      <span v-if="lastError" class="text-[var(--danger)]"> · {{ lastError }}</span>
    </div>

    <div class="text-sm text-[var(--muted-fg)]">
      Endpoint: <code>{{ ENDPOINT }}</code>. Прогресс приходит из
      <code>XMLHttpRequest.upload.onprogress</code>, отмена — через
      внутренний <code>AbortController</code>.
    </div>
  </div>
</template>
