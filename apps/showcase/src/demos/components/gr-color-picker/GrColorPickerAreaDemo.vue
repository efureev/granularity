<script setup lang="ts">
import { ref } from 'vue'

import { GrColorPicker } from '@feugene/granularity'

const accent = ref('#8b5cf6')
const surface = ref('#0f172a')

const presets = ['#8b5cf6', '#3b82f6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#64748b', '#0f172a']
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
    <div class="grid gap-3">
      <div class="grid gap-1.5">
        <span class="text-sm text-[var(--gr-muted-fg)]">Accent color</span>
        <GrColorPicker
          v-model="accent"
          view="area"
          eyedropper
          :presets="presets"
          aria-label="Accent color"
        />
      </div>

      <div class="grid gap-1.5">
        <span class="text-sm text-[var(--gr-muted-fg)]">Surface color</span>
        <GrColorPicker
          v-model="surface"
          view="area"
          eyedropper
          alpha
          :presets="presets"
          aria-label="Surface color"
        />
      </div>
    </div>

    <div class="grid content-center gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <span class="text-sm text-[var(--gr-muted-fg)]">Preview</span>

      <div class="h-10 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]" :style="{ background: accent }" />
      <code class="text-xs text-[var(--gr-muted-fg)]">{{ accent }}</code>

      <div class="h-10 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]" :style="{ background: surface }" />
      <code class="text-xs text-[var(--gr-muted-fg)]">{{ surface }}</code>
    </div>
  </div>
</template>
