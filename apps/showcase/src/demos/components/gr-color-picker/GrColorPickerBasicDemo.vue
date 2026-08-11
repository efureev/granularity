<script setup lang="ts">
import { ref } from 'vue'

import { GrColorPicker } from '@feugene/granularity'

const brand = ref('#3b82f6')
const overlay = ref('#0f172acc')

const presets = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#64748b', '#0f172a']
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
    <div class="grid gap-3">
      <div class="grid gap-1.5">
        <span class="text-sm text-[var(--gr-muted-fg)]">Brand color</span>
        <GrColorPicker v-model="brand" :presets="presets" aria-label="Brand color" />
      </div>

      <div class="grid gap-1.5">
        <span class="text-sm text-[var(--gr-muted-fg)]">Overlay color</span>
        <GrColorPicker v-model="overlay" alpha :presets="presets" aria-label="Overlay color" />
      </div>
    </div>

    <div class="grid content-center gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <span class="text-sm text-[var(--gr-muted-fg)]">Preview</span>

      <div class="h-10 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]" :style="{ background: brand }" />
      <code class="text-xs text-[var(--gr-muted-fg)]">{{ brand }}</code>

      <div class="h-10 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]" :style="{ background: overlay }" />
      <code class="text-xs text-[var(--gr-muted-fg)]">{{ overlay }}</code>
    </div>

  </div>
</template>
