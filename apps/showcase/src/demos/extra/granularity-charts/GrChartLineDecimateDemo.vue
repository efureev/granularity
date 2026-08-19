<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from 'vue'

/**
 * Десять тысяч замеров и рисунок, который от них не зависит.
 *
 * Счётчик вершин читает ту самую строку `d`, которую браузер получает на
 * отрисовку, — иначе демонстрация была бы обещанием, а не измерением.
 */
const POINTS = 10_000

const series = [{
  id: 'cpu',
  label: 'Загрузка CPU',
  x: Array.from({ length: POINTS }, (_, index) => index),
  y: Array.from({ length: POINTS }, (_, index) => {
    const wave = Math.sin(index / 420) * 18 + Math.sin(index / 37) * 4
    // Одиночный всплеск: он и есть проверка — LTTB обязан его сохранить.
    const spike = index === 6137 ? 41 : 0
    return Number((46 + wave + spike).toFixed(2))
  }),
}]

const decimate = ref<'auto' | 'never'>('auto')

const chartEl = useTemplateRef<HTMLElement>('chartEl')
const vertices = ref(0)

watchEffect(() => {
  // Читаем после того, как режим уже применён к разметке.
  void decimate.value
  requestAnimationFrame(() => {
    const d = chartEl.value?.querySelector('[data-gr-chart-series="cpu"]')?.getAttribute('d') ?? ''
    vertices.value = (d.match(/[ML]/g) ?? []).length
  })
})

const hint = computed(() => (
  decimate.value === 'auto'
    ? 'Форма ряда и всплеск на месте, а вершин в пути — сотни вместо десяти тысяч.'
    : 'Каждый замер попал в путь целиком. Рисунок тот же: экран всё равно не покажет больше двух вершин на пиксель.'
))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        {{ POINTS.toLocaleString('ru') }} замеров, вершин в пути: <strong>{{ vertices }}</strong>
      </span>

      <GrSegmented
        v-model="decimate"
        size="sm"
        :options="[
          { value: 'auto', label: 'Прореживать' },
          { value: 'never', label: 'Все точки' },
        ]"
        aria-label="Режим прореживания"
      />
    </div>

    <div ref="chartEl">
      <GrChartLine
        :series="series"
        :decimate="decimate"
        :height="260"
        :x-tick-format="(value: number) => `${Math.round(value / 60)} ч`"
        aria-label="Загрузка CPU за неделю"
      />
    </div>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }} Прореживание сокращает <strong>рисунок</strong>, а не данные:
      <kbd>End</kbd> ставит курсор на десятитысячную точку в обоих режимах, и
      скрытая таблица печатает все строки. На шумном участке активная марка
      может отойти от линии — линия здесь сводка, а марка и тултип правда.
    </p>
  </div>
</template>
