<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFilePreview, GrImageViewer } from '@feugene/granularity'

const files = [
  { name: 'receipt-01.jpg', mime: 'image/jpeg', src: 'https://picsum.photos/id/1080/400/400' },
  { name: 'receipt-02.jpg', mime: 'image/jpeg', src: 'https://picsum.photos/id/1084/400/400' },
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
