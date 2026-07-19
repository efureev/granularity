<script setup lang="ts">
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
        <span class="text-sm text-[var(--muted-fg)]">
          {{ files.length ? files.join(', ') : 'No files selected yet' }}
        </span>
      </div>
    </GrFileUpload>

    <div class="text-sm text-[var(--muted-fg)]">
      В этом режиме библиотека отвечает за file-handling, а триггер можно строить из любых UI primitives пакета.
    </div>
  </div>
</template>
