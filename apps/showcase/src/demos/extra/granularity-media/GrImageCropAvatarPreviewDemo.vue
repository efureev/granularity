<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'

import { GrAvatar, GrCard } from '@feugene/granularity'

/**
 * Живой предпросмотр в тех местах, где аватар потом и появится.
 *
 * Главное сомнение при кадрировании — «а как это будет смотреться маленьким»:
 * лицо, занимающее весь круг на превью 300 px, в строке списка превращается в
 * пятно. Ответ даёт только показ рядом, в настоящих размерах.
 */
const source = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#1e293b" />
    <circle cx="640" cy="380" r="180" fill="#fbbf24" />
    <rect x="470" y="560" width="340" height="340" rx="170" fill="#38bdf8" />
    <rect x="80" y="80" width="220" height="740" rx="24" fill="#34d399" fill-opacity="0.35" />
    <rect x="900" y="80" width="220" height="740" rx="24" fill="#f472b6" fill-opacity="0.35" />
  </svg>
`)}`

const preview = ref<string | null>(null)
const cropper = useTemplateRef('cropper')
const zoom = ref(1.4)

let pending: ReturnType<typeof setTimeout> | null = null
/** Номер запроса: поздний ответ не должен перетирать свежий предпросмотр. */
let request = 0

/**
 * Предпросмотр обновляется с задержкой: `crop()` рисует холст и кодирует файл,
 * и делать это на каждый пиксель перетаскивания значит греть процессор ради
 * кадров, которых никто не увидит.
 */
function schedulePreview() {
  if (pending)
    clearTimeout(pending)

  pending = setTimeout(async () => {
    const current = ++request
    const blob = await cropper.value?.crop()
    if (!blob || current !== request)
      return

    if (preview.value)
      URL.revokeObjectURL(preview.value)

    preview.value = URL.createObjectURL(blob)
  }, 250)
}

watch(zoom, schedulePreview)

onBeforeUnmount(() => {
  if (pending)
    clearTimeout(pending)
  if (preview.value)
    URL.revokeObjectURL(preview.value)
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
    <div class="grid gap-3">
      <GrImageCrop
        ref="cropper"
        v-model:zoom="zoom"
        :src="source"
        shape="circle"
        :aspect-ratio="1"
        :output="{ width: 256 }"
        @change="schedulePreview"
        @load="schedulePreview"
      />
      <p class="showcase-demo-text text-sm">
        Тяните картинку — предпросмотр справа меняется следом.
      </p>
    </div>

    <div class="grid content-start gap-4">
      <GrCard padding="md">
        <div class="flex items-center gap-3">
          <GrAvatar :src="preview ?? undefined" size="lg" />
          <div class="grid">
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">Иван Петров</span>
            <span class="showcase-demo-text text-xs">Шапка профиля — 40 px</span>
          </div>
        </div>
      </GrCard>

      <GrCard padding="md">
        <div class="grid gap-2">
          <div v-for="row in ['Отчёт за август', 'Договор №14', 'Заявка на отпуск']" :key="row" class="flex items-center gap-2">
            <GrAvatar :src="preview ?? undefined" size="xs" />
            <span class="showcase-demo-text text-sm">{{ row }}</span>
          </div>
          <span class="showcase-demo-text text-xs">Строка списка — 24 px: здесь видно, много ли лица осталось в кадре</span>
        </div>
      </GrCard>

      <GrCard padding="md">
        <div class="flex gap-3">
          <GrAvatar :src="preview ?? undefined" size="sm" />
          <div class="grid gap-1">
            <span class="showcase-demo-text text-sm">
              Согласовано. Приложил протокол — посмотрите пункт 4.
            </span>
            <span class="showcase-demo-text text-xs">Комментарий — 32 px</span>
          </div>
        </div>
      </GrCard>
    </div>
  </div>
</template>
