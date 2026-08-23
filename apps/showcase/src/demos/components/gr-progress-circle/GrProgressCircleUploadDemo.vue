<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import IconX from '~icons/lucide/x'
import { GrButton, GrProgressCircle } from '@feugene/granularity'

type Stage = 'idle' | 'connecting' | 'uploading' | 'done'

const stage = ref<Stage>('idle')
const value = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

function stop() {
  if (timer)
    clearInterval(timer)
  timer = undefined
}

function start() {
  stop()
  stage.value = 'connecting'
  value.value = 0

  // Пока сервер не ответил, доли прогресса нет — это и есть `indeterminate`.
  setTimeout(() => {
    stage.value = 'uploading'
    timer = setInterval(() => {
      value.value = Math.min(100, value.value + 7)
      if (value.value >= 100) {
        stop()
        stage.value = 'done'
      }
    }, 220)
  }, 900)
}

function cancel() {
  stop()
  stage.value = 'idle'
  value.value = 0
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrProgressCircle
      :value="value"
      :indeterminate="stage === 'connecting'"
      :tone="stage === 'done' ? 'success' : 'primary'"
      size="lg"
      status-icon
      show-value
      aria-label="Загрузка файла"
    >
      <GrButton
        v-if="stage === 'uploading'"
        variant="ghost"
        size="xs"
        aria-label="Отменить загрузку"
        @click="cancel"
      >
        <IconX class="h-3 w-3" />
      </GrButton>
    </GrProgressCircle>

    <div class="grid gap-2">
      <span class="text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]">
        {{ stage === 'idle' ? 'Готов к загрузке' : stage === 'connecting' ? 'Соединение…' : stage === 'uploading' ? 'Загружаем…' : 'Файл загружен' }}
      </span>
      <GrButton size="sm" :disabled="stage === 'connecting' || stage === 'uploading'" @click="start">
        Загрузить
      </GrButton>
    </div>
  </div>
</template>
