<script setup lang="ts">
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
    throw new Error(`Server rejected ${files.length} file(s)`)
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
      `accept` фильтрует и системный диалог, и перетаскивание. Лишний файл убирается крестиком в списке —
      повтор уйдёт уже без него.
    </div>
  </div>
</template>
