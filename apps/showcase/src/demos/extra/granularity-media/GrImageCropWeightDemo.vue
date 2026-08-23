<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'

import { GrSegmented, GrSlider } from '@feugene/granularity'

/**
 * Сколько на самом деле весит результат.
 *
 * `output.type` и `output.quality` описанием пропа не объяснишь: разница между
 * webp и jpeg на одной картинке — это два числа, и увидеть их можно только
 * рядом. Заодно видно, что у png качество не спрашивают вовсе.
 */
const source = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000">
    <defs>
      <radialGradient id="g" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#fde68a" />
        <stop offset="55%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </radialGradient>
    </defs>
    <rect width="1400" height="1000" fill="url(#g)" />
    <circle cx="1050" cy="260" r="180" fill="#22d3ee" fill-opacity="0.55" />
    <circle cx="360" cy="760" r="220" fill="#a78bfa" fill-opacity="0.5" />
    <rect x="120" y="120" width="520" height="26" rx="13" fill="white" fill-opacity="0.75" />
  </svg>
`)}`

const format = ref<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp')
const quality = ref(0.8)
const weight = ref<number | null>(null)
const preview = ref<string | null>(null)
const cropper = useTemplateRef('cropper')

const formatOptions = [
  { value: 'image/webp', label: 'webp' },
  { value: 'image/jpeg', label: 'jpeg' },
  { value: 'image/png', label: 'png' },
] satisfies Array<{ value: 'image/webp' | 'image/jpeg' | 'image/png', label: string }>

let pending: ReturnType<typeof setTimeout> | null = null
/**
 * Номер запроса: кодирование асинхронно, и два вызова в полёте возвращаются в
 * произвольном порядке. Без этого счётчика вес png успевал перезаписаться
 * ответом от jpeg — на экране оставалось число от предыдущего формата.
 */
let request = 0

function scheduleMeasure() {
  if (pending)
    clearTimeout(pending)

  pending = setTimeout(async () => {
    const current = ++request
    const blob = await cropper.value?.crop()
    if (!blob || current !== request)
      return

    weight.value = blob.size

    if (preview.value)
      URL.revokeObjectURL(preview.value)

    preview.value = URL.createObjectURL(blob)
  }, 250)
}

watch([format, quality], scheduleMeasure)

onBeforeUnmount(() => {
  if (pending)
    clearTimeout(pending)
  if (preview.value)
    URL.revokeObjectURL(preview.value)
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-3">
      <GrImageCrop
        ref="cropper"
        :src="source"
        :aspect-ratio="4 / 3"
        :output="{ width: 1024, type: format, quality }"
        @change="scheduleMeasure"
        @load="scheduleMeasure"
      />
      <GrSegmented v-model="format" :options="formatOptions" size="sm" />

      <div class="grid gap-1">
        <label class="showcase-demo-text text-sm">
          Качество: {{ format === 'image/png' ? 'не применяется' : quality.toFixed(2) }}
        </label>
        <GrSlider
          v-model="quality"
          :min="0.3"
          :max="1"
          :step="0.05"
          size="sm"
          :disabled="format === 'image/png'"
          aria-label="Качество кодирования"
        />
      </div>
    </div>

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <p v-if="weight" class="text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-base)] font-600">
        {{ (weight / 1024).toFixed(1) }} КБ
      </p>
      <p class="showcase-demo-text text-sm">
        Кадр 1024 px по ширине. Один и тот же кадр в webp обычно вдвое легче jpeg того же
        качества, а png не сжимает с потерями вовсе — <code>quality</code> он игнорирует,
        поэтому ползунок для него выключен.
      </p>

      <img v-if="preview" :src="preview" alt="Результат кадрирования" class="w-full rounded-[var(--gr-radius-md)]">

      <p class="showcase-demo-text text-sm">
        Это и есть ответ на вопрос, что ставить в <code>output</code>: для фотографий — webp
        с качеством около 0.8, для скриншотов с текстом — png.
      </p>
    </div>
  </div>
</template>
