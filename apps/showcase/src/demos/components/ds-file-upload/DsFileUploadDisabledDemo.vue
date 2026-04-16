<script setup lang="ts">
import { ref } from 'vue'

import { DsFileUpload } from '@feugene/granularity'

const message = ref('Try selecting more than one file in the active uploader')

async function request(files: File[]) {
  message.value = `Uploaded ${files.length} file(s)`
  return { ok: true }
}

function onExceed(files: File[], limit: number) {
  message.value = `Received ${files.length} files, limit is ${limit}`
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Limit guard
      </div>
      <DsFileUpload
        :request="request"
        multiple
        :limit="1"
        :on-exceed="onExceed"
      >
        <template #tip>
          Limit is 1 file
        </template>
      </DsFileUpload>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Disabled state
      </div>
      <DsFileUpload disabled :request="request">
        <template #tip>
          Interactions are blocked in disabled mode
        </template>
      </DsFileUpload>
    </div>

    <div class="lg:col-span-2 text-sm text-[var(--muted-fg)]">
      {{ message }}
    </div>
  </div>
</template>