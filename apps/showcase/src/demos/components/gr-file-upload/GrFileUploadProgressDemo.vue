<script setup lang="ts">
import { ref } from 'vue'

import { GrFileUpload } from '@feugene/granularity'
import type { GrFileUploadRequestCtx } from '@feugene/granularity'

const lastPercent = ref(0)
const phase = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')

/**
 * Имитация загрузки с реальным прогрессом: пользовательский `request` вызывает
 * `ctx.onProgress` так же, как это делает `axios.onUploadProgress` или `xhr.upload.onprogress`.
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

    <div class="text-sm text-[var(--muted-fg)] tabular-nums">
      phase: <strong>{{ phase }}</strong> · last progress: <strong>{{ Math.round(lastPercent) }}%</strong>
    </div>

    <div class="text-sm text-[var(--muted-fg)]">
      Дефолтный `GrProgressBar` рендерится в зарезервированной зоне — переключение
      `idle ↔ uploading ↔ success` не вызывает layout shift. Прогресс приходит из
      `ctx.onProgress`, который пользователь сам вызывает в своём `request`.
    </div>
  </div>
</template>
