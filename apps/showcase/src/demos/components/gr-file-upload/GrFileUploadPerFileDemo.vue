<script setup lang="ts">
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
    throw new Error(`Server rejected ${file.name}`)
  }

  const result = { id: `${file.name}-${attempt}`, name: file.name }
  uploaded.value = [...uploaded.value, result]
  failed.value = failed.value.filter(name => name !== file.name)
  return result
}
</script>

<template>
  <div class="grid gap-3">
    <!-- `request` зовётся с массивом из одного файла: контракт тот же, что в
         батчевом режиме, поэтому загрузчик потребителя не переписывается.
         Тип ответа (`UploadedFile`) выводится из самого `request` — payload
         события `success` типизирован им же. -->
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
</template>
