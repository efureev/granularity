<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsFileUpload } from '@feugene/granularity'

const files = ref<string[]>([])

async function request(selected: File[]) {
  files.value = selected.map(file => file.name)
  return { uploaded: selected.length }
}
</script>

<template>
  <div class="grid gap-3">
    <DsFileUpload :request="request">
      <template #default="{ openDialog }">
        <div class="flex flex-wrap items-center gap-3">
          <DsButton type="button" @click="openDialog">
            Select files
          </DsButton>
          <span class="text-sm text-[var(--muted-fg)]">
            {{ files.length ? files.join(', ') : 'No files selected yet' }}
          </span>
        </div>
      </template>
    </DsFileUpload>

    <div class="text-sm text-[var(--muted-fg)]">
      В этом режиме библиотека отвечает за file-handling, а триггер можно строить из любых UI primitives пакета.
    </div>
  </div>
</template>