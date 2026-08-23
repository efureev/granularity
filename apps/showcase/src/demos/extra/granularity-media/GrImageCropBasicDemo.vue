<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { GrButton, GrRadioGroup } from '@feugene/granularity'

/**
 * Картинка синтезированная: демо обязано работать без сети и без файла на
 * диске, а кадрировать нужно что-то заведомо не квадратное — иначе не видно,
 * что именно выбирает пользователь.
 */
const source = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#0f172a" />
    <circle cx="1180" cy="300" r="220" fill="#38bdf8" fill-opacity="0.5" />
    <circle cx="480" cy="620" r="160" fill="#f472b6" fill-opacity="0.55" />
    <rect x="120" y="140" width="520" height="26" rx="13" fill="white" fill-opacity="0.7" />
    <rect x="120" y="196" width="360" height="20" rx="10" fill="white" fill-opacity="0.4" />
    <text x="120" y="470" fill="white" font-size="128" font-family="Arial, sans-serif" font-weight="700">1600 × 900</text>
  </svg>
`)}`

const shape = ref<'circle' | 'rect'>('circle')
const zoom = ref(1)
const result = ref<string | null>(null)
const resultSize = ref(0)

const cropper = useTemplateRef('cropper')

const shapeOptions = [
  { value: 'circle', label: 'Круг' },
  { value: 'rect', label: 'Прямоугольник' },
] satisfies Array<{ value: 'circle' | 'rect', label: string }>

const weight = computed(() => `${(resultSize.value / 1024).toFixed(1)} КБ`)

async function takeFrame() {
  const blob = await cropper.value?.crop()
  if (!blob)
    return

  if (result.value)
    URL.revokeObjectURL(result.value)

  result.value = URL.createObjectURL(blob)
  resultSize.value = blob.size
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
    <div class="grid gap-3">
      <GrImageCrop
        ref="cropper"
        v-model:zoom="zoom"
        :src="source"
        :shape="shape"
        :aspect-ratio="1"
        :output="{ width: 256, height: 256, type: 'image/png' }"
      />

      <GrRadioGroup v-model="shape" :options="shapeOptions" variant="button" size="sm" />
      <GrButton size="sm" @click="takeFrame">
        Вырезать кадр
      </GrButton>
    </div>

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="showcase-demo-text text-sm">
        Рамка неподвижна: пользователь тянет картинку под ней и меняет увеличение.
        Клавиатурой — стрелки и <code>+</code>/<code>-</code>, <code>Home</code> сбрасывает.
      </p>

      <template v-if="result">
        <img :src="result" alt="Вырезанный кадр" class="h-32 w-32 rounded-[var(--gr-radius-full)] object-cover">
        <p class="showcase-demo-text text-sm">
          Результат: 256 × 256, {{ weight }}. Круг — это маска показа, а сам файл прямоугольный.
        </p>
      </template>
      <p v-else class="showcase-demo-text text-sm">
        Нажмите «Вырезать кадр» — здесь появится результат.
      </p>
    </div>
  </div>
</template>
