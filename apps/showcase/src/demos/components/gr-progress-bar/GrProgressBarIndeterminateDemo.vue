<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import { GrButton, GrProgressBar } from '@feugene/granularity'

const known = ref(false)
const progress = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

function start() {
  known.value = false
  progress.value = 0

  clearInterval(timer)
  timer = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(timer)
      return
    }

    // Ответ сервера пришёл — с этого момента размер известен, и полоса
    // перестаёт быть неопределённой.
    known.value = true
    progress.value = Math.min(100, progress.value + 7)
  }, 400)
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" @click="start">
        Запустить запрос
      </GrButton>
      <GrButton size="sm" variant="outline" @click="known = !known">
        {{ known ? 'Прогресс неизвестен' : 'Прогресс известен' }}
      </GrButton>
    </div>

    <div class="grid gap-2">
      <div class="text-sm">
        {{ known ? 'Загрузка идёт, размер известен' : 'Запрос отправлен, размер ответа неизвестен' }}
      </div>
      <GrProgressBar
        :value="progress"
        :indeterminate="!known"
        show-value
        aria-label="Import progress"
      />
    </div>
  </div>
</template>
