<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const brand = ref(65)
const accent = ref(40)
const large = ref(70)
</script>

<template>
  <div class="grid gap-8">
    <!-- Свой цвет заливки + подложка дорожки. -->
    <GrSlider
      v-model="brand"
      aria-label="Brand color"
      show-tooltip
      :style="{
        '--gr-slider-fill': '#8b5cf6',
        '--gr-slider-rail': 'color-mix(in srgb, #8b5cf6 20%, transparent)',
      }"
    />

    <!-- Сплошной бегунок: заливка = цвет, окантовка = фон. -->
    <GrSlider
      v-model="accent"
      aria-label="Accent"
      :style="{
        '--gr-slider-fill': '#f97316',
        '--gr-slider-thumb-bg': '#f97316',
        '--gr-slider-thumb-border': 'var(--gr-bg)',
      }"
    />

    <!-- Крупнее бегунок и толще дорожка. -->
    <GrSlider
      v-model="large"
      aria-label="Large"
      :style="{
        '--gr-slider-fill': 'var(--gr-success)',
        '--gr-slider-thumb-size': '1.5rem',
        '--gr-slider-track-height': '0.75rem',
      }"
    />
  </div>
</template>
