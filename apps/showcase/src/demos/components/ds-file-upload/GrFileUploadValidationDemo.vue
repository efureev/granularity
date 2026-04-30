<script setup lang="ts">
import { ref } from 'vue'

import type { GrFileUploadExtraData, GrFileUploadRequestCtx } from '@feugene/granularity'
import {
  GrFileUpload,
  acceptValidator,
  maxSizeMbValidator,
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
  lastResult.value = `uploaded ${payload.count} file(s): ${payload.names.join(', ') || '—'} · bucket=${bucketLabel}`
}

function onError(error: unknown) {
  lastResult.value = error instanceof Error ? error.message : String(error)
}
</script>

<template>
  <div class="grid gap-3">
    <GrFileUpload
      :request="request"
      :validators="[acceptValidator('image/*,.pdf'), maxSizeMbValidator(2)]"
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

    <div class="text-sm text-[var(--muted-fg)]">
      {{ lastResult }}
    </div>
  </div>
</template>