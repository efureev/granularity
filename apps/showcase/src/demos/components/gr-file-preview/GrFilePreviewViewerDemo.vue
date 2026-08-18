<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFilePreview, GrImageViewer } from '@feugene/granularity'

// Картинки нарисованы на месте: демо попадает в визуальный эталон, а внешний
// хост сделал бы снимок зависящим от сети.
function receipt(hue: number): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="hsl(${hue} 90% 92%)" />
      <rect x="120" y="70" width="160" height="260" rx="8" fill="hsl(${hue} 70% 55%)" opacity="0.25" />
      <rect x="150" y="110" width="100" height="10" rx="5" fill="hsl(${hue} 70% 40%)" />
      <rect x="150" y="140" width="70" height="10" rx="5" fill="hsl(${hue} 70% 40%)" opacity="0.6" />
      <rect x="150" y="170" width="90" height="10" rx="5" fill="hsl(${hue} 70% 40%)" opacity="0.6" />
    </svg>
  `)}`
}

const files = [
  { name: 'receipt-01.jpg', mime: 'image/jpeg', src: receipt(210) },
  { name: 'receipt-02.jpg', mime: 'image/jpeg', src: receipt(150) },
  // Битая ссылка: превью исчезло с диска. Плитка деградирует в заглушку, а не
  // в сломанную картинку.
  { name: 'receipt-03.jpg', mime: 'image/jpeg', src: 'https://cdn.invalid/missing.jpg' },
  { name: 'act.pdf', mime: 'application/pdf', src: null },
]

// В просмотрщик уходят только картинки: у PDF смотреть нечего.
const images = computed(() => files.filter(file => file.mime?.startsWith('image/')))

const viewerOpen = ref(false)
const viewerIndex = ref(0)

function open(name: string): void {
  viewerIndex.value = Math.max(0, images.value.findIndex(file => file.name === name))
  viewerOpen.value = true
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <template v-for="file in files" :key="file.name">
      <!--
        Картинка открывает просмотрщик, остальное — ссылка на оригинал.
        Решение принимает потребитель: плитка только сообщает о клике.
      -->
      <GrFilePreview
        v-if="file.mime?.startsWith('image/')"
        :src="file.src"
        :mime="file.mime"
        :name="file.name"
        clickable
        :aria-label="`Открыть ${file.name}`"
        @click="open(file.name)"
      />
      <GrFilePreview
        v-else
        :mime="file.mime"
        :name="file.name"
        href="#"
      />
    </template>

    <GrImageViewer
      v-model="viewerOpen"
      :url-list="images.map(file => file.src)"
      :initial-index="viewerIndex"
    />
  </div>
</template>
