<script setup lang="ts">
import { GrFilePreview } from '@feugene/granularity'

// Картинка нарисована на месте, а не взята с внешнего хоста: демо снимается в
// визуальный эталон, и чужой сервер сделал бы снимок невоспроизводимым.
const thumbnail = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#dbeafe" />
    <path d="M0 150l60-50 45 38 40-30 55 42v50H0z" fill="#2563eb" opacity="0.3" />
    <circle cx="152" cy="52" r="22" fill="#2563eb" opacity="0.45" />
  </svg>
`)}`

// Ровно то, что отдаёт контроллер: варианты файла без фильтра по типу.
const files = [
  { name: 'receipt.png', mime: 'image/png', src: thumbnail },
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
