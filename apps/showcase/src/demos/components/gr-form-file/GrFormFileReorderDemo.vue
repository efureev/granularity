<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormFile } from '@feugene/granularity'

/** Набор заполнен заранее: порядок показывать нечем, пока файлов нет. */
function seed(name: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type: 'image/png' })
}

const pages = ref<File[]>([
  seed('cover.png', 2048),
  seed('page-01.png', 5120),
  seed('page-02.png', 4096),
  seed('appendix.png', 1024),
])

const order = computed(() => pages.value.map(file => file.name).join(', '))
</script>

<template>
  <div class="grid gap-4">
    <GrFormFile
      v-model="pages"
      multiple
      reorderable
      accept=".png,.jpg"
      placeholder="Страницы буклета"
      upload-text="Добавить страницы"
      change-text="Добавить ещё"
      clear-all-text="Очистить"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Порядок уходит в модель: <code>{{ order }}</code>. Строка тянется за ручку, а с клавиатуры —
      <code>Space</code> берёт строку, стрелки двигают, <code>Esc</code> отменяет.
    </p>
  </div>
</template>
