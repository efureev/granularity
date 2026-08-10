<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrProgressBar } from '@feugene/granularity'

const played = ref(28)
const buffered = computed(() => Math.min(100, played.value + 24))

const uploadedMb = ref(184)
const totalMb = 512
const uploadPercent = computed(() => (uploadedMb.value / totalMb) * 100)

function formatMb(value: number) {
  return `${Math.round((value / 100) * totalMb)} / ${totalMb} МБ`
}
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-2">
      <div class="text-sm">
        Плеер: заливка — воспроизведено, слой позади — загружено в буфер
      </div>
      <GrProgressBar
        :value="played"
        :buffer="buffered"
        show-value
        aria-label="Playback progress"
      />
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" @click="played = Math.max(0, played - 10)">
          -10%
        </GrButton>
        <GrButton size="sm" @click="played = Math.min(100, played + 10)">
          +10%
        </GrButton>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm">
        Своя подпись: `formatValue` управляет и текстом, и `aria-valuetext`
      </div>
      <GrProgressBar
        :value="uploadPercent"
        :format-value="formatMb"
        show-value
        tone="success"
        aria-label="Upload progress"
      />
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" @click="uploadedMb = Math.max(0, uploadedMb - 64)">
          -64 МБ
        </GrButton>
        <GrButton size="sm" tone="success" @click="uploadedMb = Math.min(totalMb, uploadedMb + 64)">
          +64 МБ
        </GrButton>
      </div>
    </div>
  </div>
</template>
