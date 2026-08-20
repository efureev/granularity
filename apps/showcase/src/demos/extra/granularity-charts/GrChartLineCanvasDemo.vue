<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Один и тот же график двумя рендерерами.
 *
 * Демо существует ради сверки: переключатель меняет **только** порог, данные и
 * настройки остаются теми же. Если картинки различаются — это дефект, а не
 * особенность второго пути.
 */
const SERIES = 20
const POINTS = 240

const series = Array.from({ length: SERIES }, (_, s) => ({
  id: `host-${s + 1}`,
  label: `Узел ${s + 1}`,
  x: Array.from({ length: POINTS }, (_, i) => i),
  y: Array.from({ length: POINTS }, (_, i) => Number((
    50 + Math.sin((i + s * 17) / 30) * 18 + Math.sin(i / 6) * 3 + s * 0.4
  ).toFixed(2))),
}))

/** Вершин на рисунке: столько же в обоих режимах — их и сравнивает порог. */
const vertices = SERIES * POINTS

const renderer = ref<'svg' | 'canvas'>('canvas')

// Порог задаётся так, чтобы переключатель менял ровно ветку и ничего больше.
const threshold = computed(() => (renderer.value === 'canvas' ? 1000 : 0))

const rendererOptions = [
  { value: 'svg', label: 'SVG' },
  { value: 'canvas', label: 'Canvas' },
] satisfies Array<{ value: 'svg' | 'canvas', label: string }>
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrSegmented v-model="renderer" :options="rendererOptions" size="sm" />
      <span class="showcase-demo-text text-sm opacity-70">
        {{ SERIES }} рядов по {{ POINTS }} точек — {{ vertices.toLocaleString('ru') }} вершин
      </span>
    </div>

    <GrChartLine
      :series="series"
      :canvas-threshold="threshold"
      :height="320"
      aria-label="Загрузка узлов"
    />

    <p class="showcase-demo-text text-sm opacity-70">
      Переключатель меняет <strong>только порог</strong> — данные, сглаживание и цвета те же.
      Картинки обязаны совпадать: второй рендерер заведён ради цены кадра, а не ради другого вида.
      Наведите курсор и пройдитесь стрелками в обоих режимах — тултип, клавиатура и скрытая таблица
      работают одинаково, потому что живут на оверлее и на полных рядах, а не на марках.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Порог считается в <strong>нарисованных вершинах</strong>, а не в точках: прореживание режет
      каждый ряд до предела экрана по отдельности, поэтому один длинный ряд стоит миллисекунды, а
      двадцать коротких — целого кадра. По замеру SVG растёт линейно, около 0,8 мс на ряд из 2400
      вершин, и на двадцати перестаёт помещаться в 16 мс; у холста та же работа занимает 1,7 мс.
      Умолчание — 24 000 вершин, половина бюджета. <code>canvasThreshold: 0</code> выключает холст
      совсем: рисунок остаётся векторным для печати и экспорта.
    </p>
  </div>
</template>
