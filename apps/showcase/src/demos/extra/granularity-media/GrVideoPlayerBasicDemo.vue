<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge } from '@feugene/granularity'

/**
 * Ролик лежит в `public/demo` и собирается скриптом
 * `scripts/generate-demo-video.mjs`: витрина обязана работать без сети, а
 * тащить бинарь из внешнего источника — значит зависеть от чужого хостинга.
 */
const source = `${import.meta.env.BASE_URL}demo/sample.webm`

const state = ref<'ready' | 'playing' | 'paused' | 'ended'>('ready')
const position = ref(0)

function onTime(current: number) {
  position.value = current
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
    <GrVideoPlayer
      :src="source"
      :aspect-ratio="16 / 9"
      muted
      @play="state = 'playing'"
      @pause="state = 'paused'"
      @ended="state = 'ended'"
      @timeupdate="onTime"
    />

    <div class="showcase-demo-panel grid content-start gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="showcase-demo-text text-sm">
        Состояние: <GrBadge size="sm" tone="neutral">{{ state }}</GrBadge>
      </p>
      <p class="showcase-demo-text text-sm">
        Позиция: <strong>{{ position.toFixed(1) }} с</strong>
      </p>

      <p class="showcase-demo-text text-sm">
        Элементы управления свои, а не браузерные: нативные выглядят по-разному в каждом
        браузере и не знают ни про темы, ни про размеры дизайн-системы.
      </p>

      <p class="showcase-demo-text text-sm">
        Клавиатура работает, когда плеер в фокусе: пробел — пуск и пауза, стрелки влево и
        вправо — перемотка на пять секунд, <code>Home</code> и <code>End</code> — к началу и
        концу, <code>M</code> — звук, <code>F</code> — во весь экран.
      </p>

      <p class="showcase-demo-text text-sm">
        Длительность плеер берёт у браузера и не выдумывает: у потоковой записи её в заголовке
        нет, и тогда вместо «1:05 / 0:00» показывается одно текущее время, а полоса не рисуется
        вовсе — обещать конец, которого запись не знает, нельзя.
      </p>
    </div>
  </div>
</template>
