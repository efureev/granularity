<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Три режима одного набора данных — и три разных вопроса.
 *
 * Рядом сравнивают **сегменты между собой**: у кого больше обращений. Стопка
 * показывает **целое и вклад**: сколько всего и из чего. Сто процентов
 * показывает **только структуру**: как менялись доли, когда абсолютные числа
 * растут у всех сразу и потому ничего не объясняют.
 */
const months = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']

const series = [
  { id: 'bug', label: 'Баги', x: months, y: [120, 138, 129, 142, 118, 96] },
  { id: 'howto', label: 'Как сделать', x: months, y: [86, 92, 104, 121, 148, 173] },
  { id: 'billing', label: 'Оплата', x: months, y: [40, 44, 39, 52, 61, 74] },
]

const mode = ref<'group' | 'stack' | 'share'>('stack')

const stacked = computed(() => (
  mode.value === 'group' ? false : mode.value === 'share' ? '100%' as const : true
))

const hint = computed(() => ({
  group: 'Сегменты сравниваются между собой: видно, какой тип обращений крупнее в каждом месяце.',
  stack: 'Верх столбца — все обращения за месяц. Высота сегмента — вклад типа.',
  share: 'Абсолютные числа убраны: остаётся структура. Видно, как «как сделать» отъедает долю у багов.',
}[mode.value]))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Обращения в поддержку
      </span>

      <GrSegmented
        v-model="mode"
        size="sm"
        :options="[
          { value: 'group', label: 'Рядом' },
          { value: 'stack', label: 'Стопкой' },
          { value: 'share', label: '100%' },
        ]"
        aria-label="Режим столбцов"
      />
    </div>

    <GrChartBar
      :series="series"
      :stacked="stacked"
      :height="260"
      show-legend
      aria-label="Обращения в поддержку по типам"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }} Тултип и скрытая таблица во всех трёх режимах показывают
      <strong>исходное число обращений</strong>, а не долю и не сумму под сегментом.
    </p>
  </div>
</template>
