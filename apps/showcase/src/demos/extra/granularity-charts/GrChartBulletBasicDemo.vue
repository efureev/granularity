<script setup lang="ts">
/**
 * Bullet берут вместо числа с бейджем: бейдж говорит «плохо», bullet — насколько
 * плохо и далеко ли до следующей границы.
 *
 * Несколько метрик подряд сравниваются по вертикали — циферблаты так не умеют.
 */
const metrics = [
  { label: 'Себестоимость кредита, $', value: 0.031, target: 0.04, ranges: [0.03, 0.04], max: 0.05 },
  { label: 'Конверсия в оплату, %', value: 12.4, target: 15, ranges: [8, 15], max: 20 },
  { label: 'Время ответа поддержки, ч', value: 6.2, target: 4, ranges: [4, 8], max: 12 },
]

const rangeColors = ['var(--gr-success)', 'var(--gr-warning)', 'var(--gr-danger)']
</script>

<template>
  <div class="grid gap-4">
    <div v-for="metric in metrics" :key="metric.label" class="grid gap-1">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        {{ metric.label }}
      </span>

      <GrChartBullet
        :value="metric.value"
        :target="metric.target"
        :ranges="metric.ranges"
        :max="metric.max"
        :range-colors="rangeColors"
        :label="metric.label"
        :height="44"
      />
    </div>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Три разных визуальных веса, чтобы они не спорили: диапазоны — фон, значение — узкая полоса
      поверх, цель — засечка поперёк. Роль оверлея здесь <code>meter</code>, и
      <code>aria-valuetext</code> читается как «0,031 из 0,05, цель 0,04» — одно число без единиц
      и без цели сказало бы меньше, чем видит зрячий.
    </p>
  </div>
</template>
