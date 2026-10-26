<script setup lang="ts">
import type { GrRatingTone } from '@feugene/granularity'
import { computed, ref } from 'vue'

import IconHeart from '~icons/lucide/heart'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
const TONES: readonly GrRatingTone[] = ['primary', 'warning', 'success', 'danger']

const RATING_WORDS = ['Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично']
const decimal = (value: number): string => value.toLocaleString('ru-RU')
const reviews = (value: number): string => `${decimal(value)} · 128 отзывов`

const cardRating = ref(4)

const rating = ref(4)
const difficulty = ref(2.5)
const support = ref(0)
const supportError = computed(() => (support.value ? undefined : 'Поставьте оценку, чтобы отправить отзыв'))
const stepRating = ref(3)
const liked = ref(3)

const PLACES = [
  { name: 'Кофейня на Садовой', score: 4.5 },
  { name: 'Пекарня «Колос»', score: 3 },
  { name: 'Чайная у моста', score: 5 },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Как прошла доставка?">
      <GrRating v-model="cardRating" :texts="RATING_WORDS" show-text />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Оценка словами" note="Подпись уходит и в текст, и диктору; повторный щелчок по оценке снимает её.">
      <GrFormField label="Как прошла доставка?">
        <GrRating v-model="rating" :texts="RATING_WORDS" show-text clearable />
      </GrFormField>
    </Specimen>

    <Specimen title="Половинки" note="allow-half — щелчок по левой половине символа даёт .5; наведение показывает оценку до щелчка.">
      <GrFormField label="Сложность задачи">
        <GrRating v-model="difficulty" allow-half show-text :format-text="decimal" />
      </GrFormField>
    </Specimen>

    <Specimen title="Только чтение" note="Оценку показывают, а не ставят: шкала читается одной фразой, половинки — в показе.">
      <GrRating :model-value="3.5" readonly allow-half size="sm" show-text :format-text="decimal" aria-label="Средняя оценка 3,5 из 5" />
      <GrRating :model-value="4.5" readonly allow-half show-text :format-text="reviews" aria-label="Оценка 4,5 из 5 по 128 отзывам" />
    </Specimen>

    <Specimen title="Состояния" note="Недоступная шкала гаснет токеном, а не прозрачностью; ошибка — строкой под полем.">
      <GrFormField label="Без оценки" disabled>
        <GrRating :model-value="0" />
      </GrFormField>
      <GrFormField label="Оцените поддержку" :error="supportError" required>
        <GrRating v-model="support" :texts="RATING_WORDS" show-text />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — символ и подпись растут вместе.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <div class="min-w-0">
            <GrRating v-model="stepRating" :size="size" show-text :aria-label="`Оценка, ступень ${size}`" />
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Тоны" note="Тон — для витрин и отзывов; без него цвет звезды выбирает тема.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="tone in TONES" :key="tone">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ tone }}
          </span>
          <div class="min-w-0">
            <GrRating :model-value="4" readonly :tone="tone" :aria-label="`Оценка 4 из 5, тон ${tone}`" />
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Компактно" note="compact рисует только заполненные символы — для строк списка и таблиц.">
      <ul class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4">
        <li
          v-for="place in PLACES"
          :key="place.name"
          class="flex items-center justify-between gap-4 border-b border-[var(--gr-brd)] py-3 last:border-b-0"
        >
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">{{ place.name }}</span>
          <GrRating
            :model-value="place.score"
            readonly
            compact
            allow-half
            size="sm"
            show-text
            :format-text="decimal"
            :aria-label="`Оценка ${decimal(place.score)} из 5`"
          />
        </li>
      </ul>
    </Specimen>

    <Specimen title="Свой символ" note="Слот #symbol или проп icon — вместо встроенной звезды; клавиатура и диктор те же.">
      <GrFormField label="Насколько понравилось?">
        <GrRating v-model="liked">
          <template #symbol>
            <IconHeart class="block h-full w-full" fill="currentColor" />
          </template>
        </GrRating>
      </GrFormField>
    </Specimen>
  </div>
</template>
