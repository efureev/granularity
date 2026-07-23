import type { ShowcaseComponentExampleDoc } from '../types'

export const grSliderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'slider-basic',
    title: 'Single value with tooltip',
    description: 'Базовый ползунок: `v-model` (число), диапазон `min`/`max`, всплывающее значение (`show-tooltip` + `format-tooltip`). Полная клавиатура: ← / → меняют на `step`, PageUp/PageDown — крупный шаг, Home/End — к границам.',
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
]
