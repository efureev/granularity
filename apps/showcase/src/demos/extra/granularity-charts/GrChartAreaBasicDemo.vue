<script setup lang="ts">
// `GrChartArea` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Площадь вместо линии берут тогда, когда важен не только уровень, но и объём:
 * «сколько всего набежало». Заливка гаснет к базовой линии — сплошная плашка
 * утяжелила бы низ графика, где смотреть не на что.
 */
const traffic = Array.from({ length: 14 }, (_, day) => ({
  x: new Date(2026, 6, day + 1),
  y: Math.round(1800 + Math.sin(day / 2.2) * 420 + day * 55),
}))

const series = [{ id: 'sessions', label: 'Сессии', data: traffic }]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Сессии, две недели
    </span>

    <GrChartArea
      :series="series"
      :height="220"
      curve="smooth"
      include-zero
      aria-label="Сессии за две недели"
    />
  </div>
</template>
