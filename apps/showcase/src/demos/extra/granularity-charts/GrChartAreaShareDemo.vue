<script setup lang="ts">
import { ref } from 'vue'

/**
 * Доля во времени — типичная задача именно для площадей: лента показывает, как
 * менялось распределение, когда абсолютные числа растут у всех сразу.
 */
const months = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт']

const series = [
  { id: 'free', label: 'Free', x: months, y: [820, 910, 1040, 1180, 1240, 1310] },
  { id: 'pro', label: 'Pro', x: months, y: [210, 246, 268, 331, 402, 486] },
  { id: 'team', label: 'Team', x: months, y: [42, 51, 58, 74, 96, 128] },
]

const normalized = ref(true)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Активные подписки по планам
      </span>

      <GrSwitch v-model="normalized" size="sm">
          Сто процентов
        </GrSwitch>
    </div>

    <GrChartArea
      :series="series"
      :stacked="normalized ? '100%' : true"
      :height="280"
      show-legend
      data-table="visible"
      aria-label="Активные подписки по планам"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Обычный стек показывает величины и их сумму, <code>stacked: '100%'</code> — только
      распределение. Нормируется <strong>рисунок</strong>, а не данные: в таблице под графиком
      по-прежнему стоят абсолютные числа подписок, а не доли.
    </p>
  </div>
</template>
