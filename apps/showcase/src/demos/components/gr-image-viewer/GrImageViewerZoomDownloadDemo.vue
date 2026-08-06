<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrImageViewer } from '@feugene/granularity'

const blueprint = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
    <rect width="1600" height="1000" fill="#0f172a" />
    <g stroke="#38bdf8" stroke-opacity="0.35" stroke-width="2">
      ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1000" />`).join('')}
      ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1600" y2="${i * 100}" />`).join('')}
    </g>
    <rect x="120" y="120" width="520" height="360" fill="none" stroke="#f8fafc" stroke-width="6" />
    <rect x="760" y="420" width="700" height="460" fill="none" stroke="#f8fafc" stroke-width="6" />
    <text x="140" y="100" fill="#f8fafc" font-size="42" font-family="monospace">SECTOR A · scale 1:200</text>
    <text x="780" y="400" fill="#f8fafc" font-size="42" font-family="monospace">SECTOR B</text>
  </svg>
`)}`

const open = ref(false)
const lastDownload = ref('—')

function onDownload(payload: { src: string, alt: string, index: number }) {
  // Событие приходит вдобавок к самому скачиванию — под аналитику и логи.
  lastDownload.value = `кадр ${payload.index + 1}: ${payload.alt || 'без описания'}`
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton @click="open = true">
        Open blueprint
      </GrButton>
      <span class="text-xs text-[var(--gr-muted-fg)]">
        Скачано: {{ lastDownload }}
      </span>
    </div>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Колесо увеличивает в точку под курсором, увеличенный кадр тянется мышью и не
      уезжает за край. На тач-устройстве — щипок и свайп между кадрами.
    </div>

    <GrImageViewer
      v-model="open"
      :url-list="[
        { src: blueprint, alt: 'План этажа, сектор A и B' },
      ]"
      show-download
      show-zoom-value
      @download="onDownload"
    />
  </div>
</template>
