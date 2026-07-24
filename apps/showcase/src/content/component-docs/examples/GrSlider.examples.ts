import type { ShowcaseComponentExampleDoc } from '../types'

export const grSliderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'slider-basic',
    title: 'Single value with tooltip',
    description: 'Базовый ползунок: `v-model` (число), диапазон `min`/`max`, всплывающее значение (`show-tooltip` + `format-tooltip`). Полная клавиатура: стрелки меняют на `step`, PageUp/PageDown — крупный шаг, Home/End — к границам.',
    status: 'ready',
    previewKey: 'gr-slider-basic',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const volume = ref(40)
</script>

<template>
  <GrSlider
    v-model="volume"
    :min="0"
    :max="100"
    show-tooltip
    :format-tooltip="(v) => \`\${v}%\`"
    aria-label="Volume"
  />
</template>`,
    note: 'Каждый бегунок — `role="slider"` с `aria-valuemin`/`max`/`now`, доступный с клавиатуры и для скринридеров.',
  },
  {
    id: 'slider-range',
    title: 'Range with two thumbs',
    description: 'Режим `range`: модель — кортеж `[lo, hi]`, два бегунка, которые не перепрыгивают друг друга. Клик по дорожке двигает ближайший бегунок.',
    status: 'ready',
    previewKey: 'gr-slider-range',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const price = ref<[number, number]>([200, 700])
</script>

<template>
  <GrSlider
    v-model="price"
    range
    :min="0"
    :max="1000"
    :step="50"
    show-tooltip="always"
    :format-tooltip="(v) => \`$\${v}\`"
    aria-label="Price range"
  />
</template>`,
    note: 'Для диапазона у нижнего бегунка `aria-valuemax` = значение верхнего, а у верхнего `aria-valuemin` = значение нижнего — скринридер объявляет корректные границы.',
  },
  {
    id: 'slider-marks',
    title: 'Marks, steps, sizes and disabled',
    description: 'Метки делений (`marks`), фиксированный `step`, размеры (`sm`/`md`/`lg`) и `disabled`-состояние.',
    status: 'ready',
    previewKey: 'gr-slider-marks',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const quality = ref(50)

const marks = { 0: 'Low', 25: 'Fair', 50: 'Good', 75: 'High', 100: 'Max' }
</script>

<template>
  <GrSlider v-model="quality" :step="25" :marks="marks" aria-label="Quality" />
  <GrSlider :model-value="30" size="sm" aria-label="Small" />
  <GrSlider :model-value="60" size="lg" disabled aria-label="Large disabled" />
</template>`,
  },
  {
    id: 'slider-custom',
    title: 'Custom colors & size (CSS variables)',
    description: 'Внешний вид настраивается CSS-переменными на самом слайдере (или любом предке) — без новых пропов: `--gr-slider-fill` (активная часть), `--gr-slider-rail` (фон дорожки), `--gr-slider-thumb-bg` / `--gr-slider-thumb-border` (заливка и окантовка бегунка), `--gr-slider-thumb-size` и `--gr-slider-track-height` (размеры). Незаданные переменные откатываются к дефолтам темы/размера.',
    status: 'ready',
    previewKey: 'gr-slider-custom',
    code: `<script setup lang="ts">
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
</template>`,
    note: 'Переменные наследуются, поэтому одну тему слайдеров можно задать на контейнере формы, а отдельные слайдеры точечно переопределить.',
  },
]
