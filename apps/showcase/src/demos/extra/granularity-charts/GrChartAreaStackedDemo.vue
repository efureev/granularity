<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Стек и наложение отвечают на разные вопросы, и переключатель ниже — самый
 * быстрый способ это увидеть.
 *
 * Стек показывает **целое и вклад каждого канала** в него: верхний край полос
 * это выручка компании. Наложение показывает **каналы сами по себе**: сравнить
 * два ряда между собой на стеке нельзя — второй ряд едет по горбам первого.
 */
const weeks = ['W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34']

const series = [
  { id: 'retail', label: 'Розница', x: weeks, y: [420, 460, 445, 510, 495, 540, 560, 585] },
  { id: 'partners', label: 'Партнёры', x: weeks, y: [180, 190, 230, 210, 245, 260, 250, 290] },
  { id: 'api', label: 'API', x: weeks, y: [60, 75, 90, 120, 140, 165, 190, 230] },
]

const mode = ref<'stacked' | 'overlay'>('stacked')

const hint = computed(() => (mode.value === 'stacked'
  ? 'Верхний край полос — выручка целиком. Высота полосы — вклад канала.'
  : 'Ряды сравниваются между собой: заливка просвечивает там, где они пересекаются.'))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Выручка по каналам, тыс. ₽
      </span>

      <GrSegmented
        v-model="mode"
        size="sm"
        :options="[{ value: 'stacked', label: 'Стек' }, { value: 'overlay', label: 'Наложение' }]"
        aria-label="Режим площадей"
      />
    </div>

    <GrChartArea
      :series="series"
      :stacked="mode === 'stacked'"
      :height="240"
      show-legend
      aria-label="Выручка по каналам за восемь недель"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }} Тултип и скрытая таблица в обоих режимах показывают
      <strong>своё значение канала</strong>, а не сумму под ним.
    </p>
  </div>
</template>
