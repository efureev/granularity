<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'

/**
 * Три состояния одного графика — как их видит пользователь, а не как они
 * называются в пропах.
 *
 * Сценарий: температура в серверной, замер раз в час. С 4:00 до 6:00 датчик был
 * отключён на обслуживание — значений за эти часы **не существует**, и это не
 * то же самое, что ноль.
 */
const readings: (number | null)[] = [
  21.4, 21.6, 21.9, 22.4, null, null, 23.1, 23.6, 24.2, 24.8, 25.1, 24.6,
  24.1, 23.7, 23.9, 24.4, 24.9, 25.4, 25.2, 24.7, 23.8, 22.9, 22.2, 21.8,
]

const series = [{
  id: 'rack-a',
  label: 'Стойка A',
  data: readings.map((value, hour) => ({ x: new Date(2026, 6, 12, hour), y: value })),
}]

type State = 'data' | 'loading' | 'empty'

const state = ref<State>('data')
const showTable = ref(false)

const stateOptions: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]

const gapHours = computed(() => readings.filter(value => value === null).length)

function formatTemperature(value: number): string {
  return `${value.toFixed(0)} °C`
}
</script>

<template>
  <div class="grid gap-4">
    <!-- Панель управления графиком — то, что в продукте стоит над ним всегда. -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <GrSegmented v-model="state" :options="stateOptions" size="sm" aria-label="Состояние графика" />
      <GrSwitch v-model="showTable" size="sm">Таблица данных</GrSwitch>
    </div>

    <GrChartLine
      :series="state === 'empty' ? [] : series"
      :loading="state === 'loading'"
      :height="220"
      :y-tick-format="formatTemperature"
      :data-table="showTable ? 'visible' : 'hidden'"
      empty-text="За выбранные сутки замеров нет"
      aria-label="Температура в серверной, стойка A, за сутки"
    />

    <p class="showcase-demo-text text-sm text-[var(--gr-muted-fg)]">
      В ряду {{ gapHours }} часа без значений — датчик был отключён на обслуживание. Линия там
      <strong>разорвана</strong>, а не сведена к нулю и не соединена по прямой: и то и другое нарисовало бы температуру,
      которой не измеряли. В таблице данных на этом месте стоит «нет значения».
      <br>
      Скелет загрузки помечает корень <code>aria-busy</code>, а пустое состояние — это <code>GrEmptyState</code> ядра
      со своим текстом: «нет данных» и «данные ещё едут» звучат для пользователя по-разному.
    </p>
  </div>
</template>
