<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrImageViewer } from '@feugene/granularity'

function createSlide(label: string, background: string, accent: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <rect x="120" y="120" width="960" height="660" rx="36" fill="${accent}" fill-opacity="0.28" />
      <text x="120" y="520" fill="white" font-size="120" font-family="Arial, sans-serif" font-weight="700">${label}</text>
    </svg>
  `)}`
}

const slides = [
  createSlide('Marketing hero', '#0f172a', '#38bdf8'),
  createSlide('Support knowledge base', '#111827', '#c084fc'),
  createSlide('Compliance evidence', '#1f2937', '#34d399'),
]

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--muted-fg)]">
      `toolbar` slot подходит для брендинга, кастомных shortcuts и встроенных action-clusters поверх fullscreen overlay.
    </div>

    <div>
      <GrButton size="sm" @click="open = true">
        Open viewer with custom toolbar
      </GrButton>
    </div>

    <GrImageViewer
      v-model="open"
      :url-list="slides"
      :initial-index="1"
      show-progress
      :show-zoom-value="false"
    >
      <template #toolbar="{ displayIndex, total, scale, rotation, actions }">
        <div class="flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--bg)_20%,transparent)] bg-[color-mix(in_srgb,var(--fg)_45%,transparent)] px-2 py-1 text-[var(--bg)] backdrop-blur-sm">
          <span class="px-2 text-xs font-600">{{ displayIndex }} / {{ total }}</span>
          <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_10%,transparent)]" @click="actions.prev">Prev</button>
          <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_10%,transparent)]" @click="actions.next">Next</button>
          <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_10%,transparent)]" @click="actions.zoomIn">+</button>
          <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_10%,transparent)]" @click="actions.reset">Reset</button>
          <span class="px-2 text-xs text-[color-mix(in_srgb,var(--bg)_75%,transparent)]">{{ Math.round(scale * 100) }}% / {{ rotation }}°</span>
        </div>
      </template>
    </GrImageViewer>
  </div>
</template>