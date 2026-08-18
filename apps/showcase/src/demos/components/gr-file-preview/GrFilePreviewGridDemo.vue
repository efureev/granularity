<script setup lang="ts">
import { GrFilePreview } from '@feugene/granularity'

// Лента вложений к заявке: одна ссылка на файл, ничего больше. Картинки
// нарисованы на месте, а не взяты с внешнего хоста: демо снимается в визуальный
// эталон, и чужой сервер сделал бы снимок зависящим от сети.
function scan(index: number): string {
  const hue = (index * 29) % 360

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="hsl(${hue} 85% 90%)" />
      <path d="M0 120l45-38 34 29 30-23 51 32v40H0z" fill="hsl(${hue} 70% 45%)" opacity="0.35" />
      <circle cx="120" cy="42" r="16" fill="hsl(${hue} 70% 45%)" opacity="0.5" />
    </svg>
  `)}`
}

const attachments = Array.from({ length: 12 }, (_, index) => ({
  name: `scan-${String(index + 1).padStart(2, '0')}.jpg`,
  mime: 'image/jpeg',
  src: scan(index),
}))
</script>

<template>
  <!--
    Пока картинка не доехала, плитка показывает скелет, а не пустой фон:
    «ещё грузится» и «у файла нет превью» — разные сообщения, и на дюжине
    плиток сразу видно, какое из них правда.
  -->
  <div class="flex flex-wrap gap-2">
    <GrFilePreview
      v-for="file in attachments"
      :key="file.name"
      :src="file.src"
      :mime="file.mime"
      :name="file.name"
      tile-size="xs"
      ratio="1:1"
    />
  </div>
</template>
