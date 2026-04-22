<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsFileUpload } from '@feugene/granularity'

type DsFileUploadInstance = InstanceType<typeof DsFileUpload>

const uploader = ref<DsFileUploadInstance | null>(null)
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
    <DsFileUpload ref="uploader" :request="request">
      <div class="flex flex-wrap items-center gap-3">
        <DsButton type="button" @click="openFileDialog">
          Select files
        </DsButton>
        <span class="text-sm text-[var(--muted-fg)]">
          {{ files.length ? files.join(', ') : 'No files selected yet' }}
        </span>
      </div>
    </DsFileUpload>

    <div class="text-sm text-[var(--muted-fg)]">
      В этом режиме библиотека отвечает за file-handling, а триггер можно строить из любых UI primitives пакета.
    </div>
  </div>
</template>
