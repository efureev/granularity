<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { DsBadge, DsButton, DsImageViewer, DsProgressBar } from '@feugene/granularity'

function createSlide(label: string, background: string, accent: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <circle cx="940" cy="220" r="120" fill="${accent}" fill-opacity="0.35" />
      <rect x="140" y="170" width="280" height="20" rx="10" fill="white" fill-opacity="0.7" />
      <text x="140" y="520" fill="white" font-size="114" font-family="Arial, sans-serif" font-weight="700">${label}</text>
    </svg>
  `)}`
}

const loading = ref(false)
const open = ref(false)
const progress = ref(0)
const slides = ref<string[]>([])

const hasSlides = computed(() => slides.value.length > 0)

let progressTimer: number | undefined
let resolveTimer: number | undefined

function clearTimers() {
  if (progressTimer !== undefined) {
    window.clearInterval(progressTimer)
    progressTimer = undefined
  }

  if (resolveTimer !== undefined) {
    window.clearTimeout(resolveTimer)
    resolveTimer = undefined
  }
}

function loadGallery() {
  clearTimers()
  loading.value = true
  progress.value = 12
  slides.value = []

  progressTimer = window.setInterval(() => {
    progress.value = Math.min(progress.value + 18, 88)
  }, 180)

  resolveTimer = window.setTimeout(() => {
    clearTimers()
    slides.value = [
      createSlide('Invoices', '#1d4ed8', '#93c5fd'),
      createSlide('Disputes', '#9333ea', '#e9d5ff'),
      createSlide('Fraud', '#047857', '#bbf7d0'),
    ]
    progress.value = 100
    loading.value = false
    open.value = true
  }, 1200)
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <DsButton size="sm" @click="loadGallery">
        Simulate async media fetch
      </DsButton>

      <DsBadge v-if="hasSlides" size="sm" tone="neutral">
        {{ slides.length }} slides ready
      </DsBadge>
    </div>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="mb-3 text-sm text-[var(--muted-fg)]">
        Используйте viewer после загрузки gallery payload — так проще показать loading/progress state до fullscreen modal.
      </div>

      <DsProgressBar :value="progress" aria-label="Gallery loading progress" />
    </div>

    <DsImageViewer
      v-model="open"
      :url-list="slides"
      show-progress
      show-zoom-value
      hide-on-click-modal
    />
  </div>
</template>