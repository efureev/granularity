<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSwitch } from '@feugene/granularity'
import type { GrCodeResult } from '@feugene/granularity-media'

const found = ref<GrCodeResult[]>([])
const continuous = ref(false)

function onDetect(codes: GrCodeResult[]) {
  // Свежие коды приходят пачкой: в кадр попадает и наклейка, и ценник рядом.
  found.value = [...codes, ...found.value].slice(0, 8)
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrCodeScanner :continuous="continuous" @detect="onDetect" />

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <GrSwitch v-model="continuous" size="sm">
        Сообщать повторы
      </GrSwitch>

      <p class="showcase-demo-text text-sm">
        Без этого один код в кадре даёт одно событие: камера отдаёт десятки кадров в секунду,
        и приложение оформило бы двадцать заказов вместо одного. На приёмке, где сканируют
        одинаковые упаковки подряд, повтор — законное второе событие.
      </p>

      <template v-if="found.length > 0">
        <p class="showcase-demo-text text-sm">
          Найдено:
        </p>
        <ul class="grid gap-2">
          <li v-for="code in found" :key="`${code.format}:${code.value}`" class="flex items-center gap-2">
            <GrBadge size="sm" tone="neutral">{{ code.format }}</GrBadge>
            <code class="showcase-demo-text text-sm">{{ code.value }}</code>
          </li>
        </ul>
      </template>
      <p v-else class="showcase-demo-text text-sm">
        Наведите камеру на QR или штрихкод — содержимое появится здесь.
      </p>
    </div>
  </div>
</template>
