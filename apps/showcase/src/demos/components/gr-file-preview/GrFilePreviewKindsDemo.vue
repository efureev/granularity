<script setup lang="ts">
import { GrFilePreview } from '@feugene/granularity'

// Ровно то, что отдаёт контроллер: варианты файла без фильтра по типу.
const files = [
  { name: 'receipt.png', mime: 'image/png', src: 'https://picsum.photos/id/1062/200/200' },
  { name: 'contract.pdf', mime: 'application/pdf', src: null },
  { name: 'report.xlsx', mime: 'application/vnd.ms-excel', src: null },
  { name: 'sources.zip', mime: 'application/zip', src: null },
  { name: 'notes.txt', mime: 'text/plain', src: null },
  // Тип бэкенд не проставил — обычное состояние строки в БД.
  { name: 'export.dat', mime: null, src: null },
]
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <GrFilePreview
      v-for="file in files"
      :key="file.name"
      :src="file.src"
      :mime="file.mime"
      :name="file.name"
      tile-size="lg"
    />
  </div>
</template>
