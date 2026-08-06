<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading, GrProgressBar } from '@feugene/granularity'

const fastLoading = ref(false)
const exportLoading = ref(false)
const percent = ref(0)

let exportTimer: number | undefined

// Быстрый ответ: задержка 300 мс не даёт оверлею мигнуть.
function runFast() {
  fastLoading.value = true
  window.setTimeout(() => {
    fastLoading.value = false
  }, 200)
}

function runExport() {
  exportLoading.value = true
  percent.value = 0

  exportTimer = window.setInterval(() => {
    percent.value = Math.min(100, percent.value + 8)
    if (percent.value === 100) abortExport()
  }, 220)
}

function abortExport() {
  window.clearInterval(exportTimer)
  exportLoading.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton variant="outline" @click="runFast">
        Fast request (200 ms)
      </GrButton>
      <GrButton @click="runExport">
        Export report
      </GrButton>
    </div>

    <div class="relative min-h-[200px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Quarterly report</div>
        <div>The fast request finishes before the delay elapses, so the overlay never appears.</div>
      </div>

      <GrLoading v-if="fastLoading" :delay="300" text="Refreshing..." />

      <GrLoading v-if="exportLoading" custom-class="rounded-xl">
        <div class="text-sm font-medium text-[var(--gr-fg)]">Building the export</div>
        <GrProgressBar :value="percent" class="w-52" />
        <GrButton size="xs" variant="outline" @click="abortExport">
          Cancel
        </GrButton>
      </GrLoading>
    </div>
  </div>
</template>
