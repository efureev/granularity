<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { GrBadge } from '@feugene/granularity'
import type { GrCameraStatus } from '@feugene/granularity-media'

/**
 * Демо специально не включает камеру само: на странице документации это
 * означало бы запрос разрешения у каждого, кто зашёл почитать.
 */
const shot = ref<string | null>(null)
const shotSize = ref<{ width: number, height: number } | null>(null)
const status = ref<GrCameraStatus>('idle')
const camera = useTemplateRef('camera')

function onCapture(blob: Blob) {
  if (shot.value)
    URL.revokeObjectURL(shot.value)

  shot.value = URL.createObjectURL(blob)
}

function onShotLoad(event: Event) {
  const img = event.target as HTMLImageElement
  shotSize.value = { width: img.naturalWidth, height: img.naturalHeight }
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <!--
      Соотношение сторон не задано намеренно: рамка примет его от камеры.
      Зашитое число показало бы обрезанный кадр как настоящий — а камеры отдают
      то 4:3, то 16:9.
    -->
    <GrCameraCapture
      ref="camera"
      :output="{ width: 800, type: 'image/jpeg', quality: 0.9 }"
      @capture="onCapture"
      @status-change="(value: GrCameraStatus) => (status = value)"
    />

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="showcase-demo-text text-sm">
        Состояние: <GrBadge size="sm" tone="neutral">{{ status }}</GrBadge>
      </p>

      <p class="showcase-demo-text text-sm">
        Камера включается только по кнопке. Запрос разрешения, всплывший сам по себе,
        отклоняют не глядя — а второй раз браузер уже не спросит.
      </p>

      <template v-if="shot">
        <img
          :src="shot"
          alt="Снимок с камеры"
          class="w-full rounded-[var(--gr-radius-md)]"
          @load="onShotLoad"
        >
        <p v-if="shotSize" class="showcase-demo-text text-sm">
          Снимок: <strong>{{ shotSize.width }} × {{ shotSize.height }}</strong> — те же пропорции,
          что и у превью. Камеры отдают то 4:3, то 16:9, и кадр не подгоняется под окно: нужен
          ровно квадрат — это <code>GrImageCrop</code> следующим шагом.
        </p>
        <p class="showcase-demo-text text-sm">
          Превью фронтальной камеры зеркальное, а снимок — нет: иначе текст в кадре уехал бы
          в зазеркалье.
        </p>
      </template>
    </div>
  </div>
</template>
