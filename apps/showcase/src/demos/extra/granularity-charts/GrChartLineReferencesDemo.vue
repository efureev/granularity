<script setup lang="ts">
import { ref } from 'vue'

/**
 * Порог, нарисованный серией из константы, врёт трижды: попадает в легенду
 * равноправным рядом, растягивает домен оси и уезжает в скрытую таблицу как
 * данные. Опора не делает ничего из этого.
 */
const days = Array.from({ length: 30 }, (_, index) => new Date(2026, 6, index + 1))

const series = [
  {
    id: 'cost',
    label: 'Себестоимость кредита',
    data: days.map((x, index) => ({ x, y: 0.026 + Math.sin(index / 4) * 0.004 + index * 0.0004 })),
  },
]

const references = [
  { axis: 'y' as const, value: [0.03, 0.035] as const, label: 'Предупреждение' },
  { axis: 'y' as const, value: 0.04, label: 'Критический', color: 'var(--gr-danger)' },
]

const includeInDomain = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Себестоимость кредита, $
      </span>

      <GrSwitch v-model="includeInDomain" size="sm">
          Порог в домене оси
        </GrSwitch>
    </div>

    <GrChartLine
      :series="series"
      :references="references"
      :include-references-in-domain="includeInDomain"
      :height="280"
      :value-format="{ precision: 3 }"
      aria-label="Себестоимость кредита с порогами"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      По умолчанию опора <strong>домен не растягивает</strong>: критический порог `1.0` при данных
      около `0.03` схлопнул бы сами данные в линию у нуля. Включите переключатель — ось раздвинется
      осознанно. Опора, ушедшая за край, не рисуется, но остаётся в описании графика: «порог не
      виден» и «порога нет» это разные утверждения.
    </p>
  </div>
</template>
