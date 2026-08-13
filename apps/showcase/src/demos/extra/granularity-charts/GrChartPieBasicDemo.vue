<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrChartPie` подставляется авто-импортом (`unplugin-vue-components`).

const sources = [
  { label: 'Поиск', value: 4210 },
  { label: 'Прямые заходы', value: 1980 },
  { label: 'Соцсети', value: 1240 },
  { label: 'Почта', value: 620 },
  { label: 'Партнёры', value: 310 },
]

const variant = ref<'donut' | 'pie'>('donut')
const active = ref<number | null>(null)

const total = sources.reduce((sum, item) => sum + item.value, 0)

const readout = computed(() => {
  const slice = active.value === null ? null : sources[active.value]

  if (!slice)
    return null

  return {
    label: slice.label,
    value: slice.value.toLocaleString('ru-RU'),
    share: (slice.value / total).toLocaleString('ru-RU', { style: 'percent', maximumFractionDigits: 0 }),
  }
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Источники визитов, ноябрь
      </span>

      <GrSegmented
        v-model="variant"
        size="sm"
        :options="[{ value: 'donut', label: 'Кольцо' }, { value: 'pie', label: 'Круг' }]"
        aria-label="Вид диаграммы"
      />
    </div>

    <!-- Место под показания зарезервировано всегда: иначе строка прыгает на каждом наведении. -->
    <span class="min-h-6 text-[length:var(--gr-control-text-sm)]">
      <template v-if="readout">
        <span class="text-[var(--gr-muted-fg)]">{{ readout.label }}</span>
        <strong class="ml-2 [font-variant-numeric:tabular-nums]">{{ readout.value }}</strong>
        <span class="ml-1 text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]">· {{ readout.share }}</span>
      </template>
      <span v-else class="text-[var(--gr-muted-fg)]">Наведите курсор или нажмите стрелку</span>
    </span>

    <GrChartPie
      v-model:active-index="active"
      :data="sources"
      :variant="variant"
      :height="260"
      total-label="визитов"
      aria-label="Источники визитов за ноябрь"
    />
  </div>
</template>
