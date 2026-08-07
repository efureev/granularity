import type { ShowcaseComponentExampleDoc } from '../types'

export const grRatingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'rating-basic',
    title: 'Basic rating',
    description: 'Оценка в один клик: `v-model` — число, `show-text` печатает значение рядом. Шкала фокусируется и управляется стрелками, Home/End.',
    status: 'ready',
    previewKey: 'gr-rating-basic',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const score = ref(4)
</script>

<template>
  <div class="grid gap-4">
    <GrRating v-model="score" show-text aria-label="Rate the delivery" />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Score: <code>{{ score }}</code> — click a star, or use arrow keys, Home / End.
    </p>
  </div>
</template>`,
    note: 'Шкала — `role="slider"` с `aria-valuenow`/`aria-valuetext`, поэтому скринридер объявляет «4 из 5», а не пять безымянных иконок.',
  },
  {
    id: 'rating-half',
    title: 'Half stars, clearable and read-only',
    description: '`allow-half` даёт половинчатые оценки (клик по левой половине символа), `clearable` сбрасывает повторным кликом, `readonly` показывает чужие оценки без ввода.',
    status: 'ready',
    previewKey: 'gr-rating-half',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const myScore = ref(3.5)

const reviews = [
  { author: 'Anna K.', score: 5, text: 'Arrived a day earlier than promised.' },
  { author: 'Mark T.', score: 3.5, text: 'Good quality, packaging could be better.' },
  { author: 'Elena P.', score: 4, text: 'Exactly as described.' },
]
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <span class="text-sm font-medium">Your rating</span>
      <GrRating
        v-model="myScore"
        allow-half
        clearable
        show-text
        :format-text="(v) => (v ? \`\${v} / 5\` : 'Not rated')"
        aria-label="Your rating"
      />
    </div>

    <ul class="grid gap-3">
      <li v-for="review in reviews" :key="review.author" class="grid gap-1">
        <div class="flex items-center gap-2">
          <GrRating :model-value="review.score" readonly allow-half size="sm" />
          <span class="text-sm font-medium">{{ review.author }}</span>
        </div>
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ review.text }}
        </p>
      </li>
    </ul>
  </div>
</template>`,
    note: 'В режиме `readonly` шкала становится `role="img"` с оценкой в подписи — она не попадает в таб-порядок и не притворяется контролом.',
  },
  {
    id: 'rating-custom',
    title: 'Custom symbol, tone and size',
    description: 'Символ меняется пропом `icon` (любая UnoCSS-иконка) или слотом `#symbol`, цвет — тоном либо переменной `--gr-rating-color`, размер — `size` или `--gr-rating-symbol-size`.',
    status: 'ready',
    previewKey: 'gr-rating-custom',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const likes = ref(3)
const difficulty = ref(2)
const size = ref(4)

// Подписи по делениям: диктор читает «4 из 5, хорошо», а не голое число.
const service = ref(4)
const serviceTexts = ['Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <span class="text-sm font-medium">Custom symbol and tone</span>
      <GrRating
        v-model="likes"
        icon="i-lucide-heart"
        tone="danger"
        aria-label="How much you liked it"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Own colour via CSS variable</span>
      <GrRating
        v-model="difficulty"
        :max="4"
        style="--gr-rating-color: var(--gr-info)"
        aria-label="Difficulty"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Labels per step</span>
      <GrRating
        v-model="service"
        :texts="serviceTexts"
        show-text
        aria-label="Service quality"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Compact read-only (for tables and lists)</span>
      <div class="flex items-center gap-6">
        <GrRating :model-value="3" readonly compact show-text aria-label="Compact rating" />
        <GrRating :model-value="4.5" readonly compact allow-half show-text aria-label="Compact half rating" />
      </div>
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Sizes and disabled</span>
      <div class="flex items-center gap-6">
        <GrRating v-model="size" size="sm" aria-label="Small" />
        <GrRating v-model="size" size="md" aria-label="Medium" />
        <GrRating v-model="size" size="lg" aria-label="Large" />
        <GrRating :model-value="2" disabled aria-label="Disabled" />
      </div>
    </div>
  </div>
</template>`,
  },
]
