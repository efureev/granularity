<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'

import { GrAvatar, GrCard } from '@feugene/granularity'

/**
 * Один кадр — три файла, и каждый показан там, где он потом и появится.
 *
 * Приложения хранят аватар не одной картинкой: в шапку идёт крупный, в строку
 * списка — мелкий, и отдавать 256 px туда, где рисуется 24, значит возить лишние
 * килобайты на каждой строке. Размер задаёт `output`, а кадр остаётся тем же.
 *
 * Второе, что видно только так: главное сомнение при кадрировании — «а как это
 * будет смотреться маленьким». В кружке 24 px сразу заметно, что в кадр попало
 * лишнее.
 */
const source = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#1e293b" />
    <circle cx="640" cy="380" r="180" fill="#fbbf24" />
    <rect x="470" y="560" width="340" height="340" rx="170" fill="#38bdf8" />
    <rect x="80" y="80" width="220" height="740" rx="24" fill="#34d399" fill-opacity="0.35" />
    <rect x="900" y="80" width="220" height="740" rx="24" fill="#f472b6" fill-opacity="0.35" />
  </svg>
`)}`

interface Variant {
  key: 'large' | 'medium' | 'small'
  label: string
  px: number
  url: string | null
  weight: number
}

const variants = ref<Variant[]>([
  { key: 'large', label: 'Крупный', px: 256, url: null, weight: 0 },
  { key: 'medium', label: 'Средний', px: 96, url: null, weight: 0 },
  { key: 'small', label: 'Мелкий', px: 32, url: null, weight: 0 },
])

const outputWidth = ref(256)
const cropper = useTemplateRef('cropper')

let pending: ReturnType<typeof setTimeout> | null = null
/** Номер запроса: поздний ответ не должен перетирать свежие варианты. */
let request = 0

function urlFor(key: Variant['key']): string | undefined {
  return variants.value.find(item => item.key === key)?.url ?? undefined
}

/**
 * Варианты пересобираются с задержкой: три `crop()` подряд рисуют холст и
 * кодируют файл, и делать это на каждый пиксель перетаскивания значит греть
 * процессор ради кадров, которых никто не увидит.
 */
function scheduleVariants() {
  if (pending)
    clearTimeout(pending)

  pending = setTimeout(async () => {
    const current = ++request

    for (const variant of variants.value) {
      // Размер задаётся пропом — тем же способом, что и в приложении.
      outputWidth.value = variant.px
      await nextTick()

      const blob = await cropper.value?.crop()
      if (!blob || current !== request)
        return

      if (variant.url)
        URL.revokeObjectURL(variant.url)

      variant.url = URL.createObjectURL(blob)
      variant.weight = blob.size
    }
  }, 300)
}

onBeforeUnmount(() => {
  if (pending)
    clearTimeout(pending)

  for (const variant of variants.value) {
    if (variant.url)
      URL.revokeObjectURL(variant.url)
  }
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
    <div class="grid gap-3">
      <GrImageCrop
        ref="cropper"
        :src="source"
        shape="circle"
        :aspect-ratio="1"
        :output="{ width: outputWidth }"
        @change="scheduleVariants"
        @load="scheduleVariants"
      />
      <p class="showcase-demo-text text-sm">
        Тяните картинку и меняйте увеличение — три файла справа пересобираются следом.
      </p>
    </div>

    <div class="grid content-start gap-4">
      <GrCard padding="md">
        <div class="flex flex-wrap items-end gap-4">
          <div v-for="variant in variants" :key="variant.key" class="grid justify-items-center gap-1">
            <img
              v-if="variant.url"
              :src="variant.url"
              :alt="`${variant.label} вариант`"
              class="rounded-[var(--gr-radius-full)] object-cover"
              :style="{ width: `${Math.min(variant.px, 96)}px`, height: `${Math.min(variant.px, 96)}px` }"
            >
            <span class="showcase-demo-text text-xs">
              {{ variant.label }} · {{ variant.px }} px
            </span>
            <span class="showcase-demo-text text-xs">
              {{ (variant.weight / 1024).toFixed(1) }} КБ
            </span>
          </div>
        </div>
      </GrCard>

      <GrCard padding="md">
        <div class="flex items-center gap-3">
          <GrAvatar :src="urlFor('medium')" size="lg" />
          <div class="grid">
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">Иван Петров</span>
            <span class="showcase-demo-text text-xs">Шапка профиля — сюда идёт средний</span>
          </div>
        </div>
      </GrCard>

      <GrCard padding="md">
        <div class="grid gap-2">
          <div v-for="row in ['Отчёт за август', 'Договор №14', 'Заявка на отпуск']" :key="row" class="flex items-center gap-2">
            <GrAvatar :src="urlFor('small')" size="xs" />
            <span class="showcase-demo-text text-sm">{{ row }}</span>
          </div>
          <span class="showcase-demo-text text-xs">
            Строка списка — мелкий: 256 px здесь означал бы лишние килобайты на каждой строке
          </span>
        </div>
      </GrCard>
    </div>
  </div>
</template>
