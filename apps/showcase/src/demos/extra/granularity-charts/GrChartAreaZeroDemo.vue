<script setup lang="ts">
/**
 * Базовая линия площади — ноль, а не низ холста.
 *
 * Заливай мы всегда до нижнего края, убыток в минус десять нарисовался бы той
 * же высотой, что и прибыль в плюс десять, — только чуть ниже. Здесь минус
 * уходит под ось и читается как минус.
 */
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']

const series = [{
  id: 'profit',
  label: 'Прибыль',
  x: months,
  y: [-140, -95, -30, 25, 60, 40, 110, 165, 210],
}]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Операционная прибыль, тыс. ₽
    </span>

    <GrChartArea
      :series="series"
      :height="220"
      curve="smooth"
      aria-label="Операционная прибыль по месяцам"
    />
  </div>
</template>
