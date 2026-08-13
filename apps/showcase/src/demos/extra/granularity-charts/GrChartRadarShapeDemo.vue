<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Оформление и плотность.
 *
 * На четырёх сериях заливки наслаиваются и рисунок мутнеет — тогда её
 * выключают, и различителем остаётся контур: у каждой серии свой цвет, своя
 * форма марки и своя штриховка.
 */
const axes = [
  'Vue', 'React', 'Svelte', 'Angular', 'Solid', 'Qwik',
  'Astro', 'Nuxt', 'Next', 'Remix', 'Vite', 'Webpack',
]

const series = [
  { id: 'usage', label: 'Используют', x: axes, y: [82, 74, 41, 38, 22, 14, 31, 46, 52, 19, 88, 44] },
  { id: 'interest', label: 'Хотят попробовать', x: axes, y: [61, 55, 68, 24, 49, 43, 57, 51, 44, 33, 71, 12] },
  { id: 'retention', label: 'Продолжат', x: axes, y: [88, 69, 76, 42, 58, 47, 64, 73, 61, 38, 92, 29] },
]

const shape = ref<'polygon' | 'circle'>('polygon')
const fill = ref(false)
const rings = ref(4)

const hint = computed(() => (fill.value
  ? 'Три заливки поверх двенадцати осей: рисунок мутнеет, контуры теряются.'
  : 'Без заливки различителями остаются цвет, форма марки и штриховка контура.'))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Опрос по фреймворкам, % ответов
      </span>

      <div class="flex flex-wrap items-center gap-3">
        <GrSegmented
          v-model="shape"
          size="sm"
          :options="[{ value: 'polygon', label: 'Многоугольник' }, { value: 'circle', label: 'Окружности' }]"
          aria-label="Форма сетки"
        />
        <GrSwitch v-model="fill" size="sm">Заливка</GrSwitch>
      </div>
    </div>

    <GrChartRadar
      :series="series"
      :shape="shape"
      :fill="fill"
      :rings="rings"
      :height="340"
      show-legend
      aria-label="Опрос по фреймворкам"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }}
    </p>
  </div>
</template>
