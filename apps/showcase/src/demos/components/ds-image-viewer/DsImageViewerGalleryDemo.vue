<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsImageViewer } from '@feugene/granularity'

function createSlide(label: string, background: string, accent: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <circle cx="930" cy="180" r="140" fill="${accent}" fill-opacity="0.35" />
      <rect x="130" y="160" width="320" height="22" rx="11" fill="white" fill-opacity="0.75" />
      <rect x="130" y="210" width="520" height="18" rx="9" fill="white" fill-opacity="0.45" />
      <rect x="130" y="660" width="420" height="26" rx="13" fill="white" fill-opacity="0.7" />
      <text x="130" y="540" fill="white" font-size="108" font-family="Arial, sans-serif" font-weight="700">${label}</text>
    </svg>
  `)}`
}

const slides = [
  { title: 'Workspace overview', url: createSlide('Overview', '#2563eb', '#a5f3fc') },
  { title: 'Risk dashboard', url: createSlide('Risk', '#7c3aed', '#f5d0fe') },
  { title: 'Approval queue', url: createSlide('Queue', '#059669', '#fde68a') },
]

const open = ref(false)
const initialIndex = ref(0)

function openAt(index: number) {
  initialIndex.value = index
  open.value = true
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="(slide, index) in slides"
        :key="slide.title"
        type="button"
        class="group overflow-hidden rounded-xl border border-[var(--brd)] bg-[var(--bg)] text-left transition-transform hover:-translate-y-0.5"
        @click="openAt(index)"
      >
        <img :src="slide.url" :alt="slide.title" class="h-36 w-full object-cover" >
        <div class="flex items-center justify-between gap-3 p-3">
          <span class="text-sm font-600 text-[var(--fg)]">{{ slide.title }}</span>
          <DsBadge size="sm" tone="neutral">
            Preview
          </DsBadge>
        </div>
      </button>
    </div>

    <div>
      <DsButton size="sm" variant="outline" @click="openAt(0)">
        Open fullscreen gallery
      </DsButton>
    </div>

    <DsImageViewer
      v-model="open"
      :url-list="slides.map(slide => slide.url)"
      :initial-index="initialIndex"
      show-progress
    />
  </div>
</template>