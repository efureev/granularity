<script setup lang="ts">
import { GrButton, GrFileUpload } from '@feugene/granularity'
import type { GrFileUploadRequestCtx, GrUploadState } from '@feugene/granularity'

/**
 * Кастомный UI прогресса через scoped-слот `progress`.
 * Полностью отключаем дефолтный `GrProgressBar` через `:show-progress="false"`.
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
        class="mt-3 flex items-center gap-3 rounded-md border border-[var(--brd)] bg-[var(--muted)] p-3"
      >
        <div
          class="relative h-10 w-10 shrink-0 rounded-full"
          :style="{
            background: indeterminate
              ? 'conic-gradient(var(--primary) 0 25%, var(--muted) 0)'
              : `conic-gradient(var(--primary) 0 ${percent}%, var(--muted) 0)`,
            transition: 'background 120ms linear',
          }"
        >
          <div class="absolute inset-1 rounded-full bg-[var(--bg)] grid place-items-center text-[10px] tabular-nums">
            {{ indeterminate ? '…' : `${Math.round(percent)}%` }}
          </div>
        </div>

        <div class="flex-1 text-sm">
          <div class="font-medium">
            {{ phaseLabel({ phase, percent, indeterminate } as GrUploadState) }}
          </div>
          <div class="text-[var(--muted-fg)]">
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
</template>
