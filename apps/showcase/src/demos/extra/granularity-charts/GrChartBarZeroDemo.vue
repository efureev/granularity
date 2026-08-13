<script setup lang="ts">
/**
 * Полоса вниз от нуля — это минус, а не «столбец пониже».
 *
 * Скругляется только дальний от базовой линии конец, поэтому у отрицательной
 * полосы он снизу: столбец остаётся приклеенным к оси, а не висит над ней.
 */
const weeks = ['W40', 'W41', 'W42', 'W43', 'W44', 'W45', 'W46', 'W47']

const series = [{
  id: 'delta',
  label: 'Изменение к прошлой неделе',
  x: weeks,
  y: [-320, -140, 90, 210, -60, 340, 520, 410],
}]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Прирост активных пользователей, неделя к неделе
    </span>

    <GrChartBar
      :series="series"
      :height="220"
      aria-label="Прирост активных пользователей по неделям"
    />
  </div>
</template>
