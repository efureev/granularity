<script setup lang="ts">
import { ref } from 'vue'

/**
 * Деньги и штуки на одной оси не живут: ряд меньшего порядка схлопывается в
 * линию у нуля, и вопрос «как связаны выручка и движение» приходится
 * рассматривать по двум картинкам.
 *
 * Вторая ось включается осознанно: она же позволяет подогнать любые два ряда
 * под видимую корреляцию.
 */
const months = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']

const series = [
  { id: 'mrr', label: 'MRR, $', axis: 'right' as const, x: months, y: [38200, 39800, 41100, 40400, 43600, 46200] },
  { id: 'new', label: 'Новые', x: months, y: [186, 204, 178, 231, 268, 294] },
  { id: 'churn', label: 'Отток', x: months, y: [92, 88, 104, 96, 81, 74] },
]

const dualAxis = ref(true)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Выручка и движение подписок
      </span>

      <GrSwitch v-model="dualAxis" size="sm">
          Вторая ось
        </GrSwitch>
    </div>

    <GrChartLine
      :series="series"
      :dual-axis="dualAxis"
      :height="280"
      show-legend
      aria-label="Выручка и движение подписок"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Выключите вторую ось — и движение подписок ляжет на ноль: сорок тысяч долларов задают масштаб,
      в котором двести штук неразличимы. Делений у осей поровну, чтобы сетка не двоилась, и рисуется
      она <strong>только по левой</strong>. В скрытой таблице колонка называет свою ось — иначе
      значения из разных шкал стояли бы рядом без пояснения.
    </p>
  </div>
</template>
