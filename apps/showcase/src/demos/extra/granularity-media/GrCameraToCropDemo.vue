<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { GrAvatar, GrButton } from '@feugene/granularity'

/**
 * Путь целиком: камера отдаёт кадр как есть, кроп режет из него квадрат.
 * Разделение ответственности видно только так — на словах оно выглядит
 * придиркой.
 */
const shot = ref<Blob | null>(null)
const shotSize = ref('')
const avatar = ref<string | null>(null)
const cropper = useTemplateRef('cropper')

const step = computed(() => {
  if (!shot.value)
    return 1
  if (!avatar.value)
    return 2

  return 3
})

function onCapture(blob: Blob) {
  shot.value = blob
  shotSize.value = `${(blob.size / 1024).toFixed(0)} КБ`
  avatar.value = null
}

async function saveAvatar() {
  const blob = await cropper.value?.crop()
  if (!blob)
    return

  if (avatar.value)
    URL.revokeObjectURL(avatar.value)

  avatar.value = URL.createObjectURL(blob)
}

function again() {
  if (avatar.value)
    URL.revokeObjectURL(avatar.value)

  shot.value = null
  avatar.value = null
}
</script>

<template>
  <div class="grid gap-4">
    <ol class="showcase-demo-text flex flex-wrap gap-4 text-sm">
      <li :class="step === 1 ? 'font-600' : ''">
        1. Снимок
      </li>
      <li :class="step === 2 ? 'font-600' : ''">
        2. Кадр
      </li>
      <li :class="step === 3 ? 'font-600' : ''">
        3. Аватар
      </li>
    </ol>

    <div class="grid gap-4 lg:grid-cols-2">
      <GrCameraCapture v-if="!shot" @capture="onCapture" />

      <template v-else>
        <div class="grid gap-3">
          <GrImageCrop ref="cropper" :src="shot" shape="circle" :aspect-ratio="1" :output="{ width: 256 }" />
          <div class="flex gap-2">
            <GrButton size="sm" @click="saveAvatar">
              Сохранить аватар
            </GrButton>
            <GrButton size="sm" variant="outline" @click="again">
              Снять заново
            </GrButton>
          </div>
        </div>
      </template>

      <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
        <p v-if="!shot" class="showcase-demo-text text-sm">
          Камера снимает кадр целиком, в своих пропорциях — она не знает, что из него понадобится.
          Вырезать квадрат под аватар будет следующий шаг.
        </p>

        <template v-else>
          <p class="showcase-demo-text text-sm">
            Снимок: <strong>{{ shotSize }}</strong>. Теперь из него вырезается квадрат: тяните
            картинку под рамкой, меняйте увеличение.
          </p>

          <div v-if="avatar" class="flex items-center gap-3">
            <GrAvatar :src="avatar" size="lg" />
            <div>
              <p class="showcase-demo-text text-sm">
                Готово: 256 × 256, круглая маска — дело показа, файл прямоугольный.
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
