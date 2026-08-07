<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const brand = ref(65)
const accent = ref(40)
const large = ref(70)
const volume = ref(35)
const budget = ref(1200)
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

    <div class="flex items-start gap-10">
      <!-- Вертикальная дорожка: минимум внизу, длина — через --gr-slider-length. -->
      <GrSlider
        v-model="volume"
        orientation="vertical"
        aria-label="Volume"
        show-tooltip
        :marks="{ 0: 'Mute', 50: 'Half', 100: 'Max' }"
        :style="{ '--gr-slider-length': '12rem' }"
      />

      <!-- lazy: значение уезжает наружу только на отпускании. -->
      <div class="grid flex-1 gap-2">
        <GrSlider
          v-model="budget"
          lazy
          :min="0"
          :max="5000"
          :step="50"
          aria-label="Monthly budget"
          show-tooltip
          :format-tooltip="(value) => `$${value.toLocaleString('en-US')}`"
        />
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Committed value: <span class="font-medium text-[var(--gr-fg)]">${{ budget.toLocaleString('en-US') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
