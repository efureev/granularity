<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Длинные названия категорий — единственный настоящий довод за горизонталь.
 *
 * Переключатель здесь не украшение: у вертикали те же подписи встают наклонным
 * хвостом и обрезаются, а у горизонтали читаются строкой. Данные, порог и
 * легенда при этом не меняются ни на байт.
 */
const departments = [
  'Клиентское обслуживание',
  'Разработка платформы',
  'Логистика и склад',
  'Финансы и отчётность',
  'Маркетинг и коммуникации',
  'Юридическая поддержка',
]

const series = [
  { id: 'closed', label: 'Закрыто', x: departments, y: [412, 388, 297, 214, 186, 92] },
  { id: 'open', label: 'В работе', x: departments, y: [64, 121, 48, 39, 57, 28] },
]

const orientation = ref<'horizontal' | 'vertical'>('horizontal')

const hint = computed(() => (
  orientation.value === 'horizontal'
    ? 'Подпись читается строкой, и категорий помещается втрое больше: горизонталь тратит высоту страницы, а её всегда можно прокрутить.'
    : 'Те же подписи по нижней оси: место кончается раньше названий, и читатель разбирает их по обрезкам.'
))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Заявки по отделам за квартал
      </span>

      <GrSegmented
        v-model="orientation"
        size="sm"
        :options="[
          { value: 'horizontal', label: 'Вбок' },
          { value: 'vertical', label: 'Вверх' },
        ]"
        aria-label="Раскладка столбцов"
      />
    </div>

    <GrChartBar
      :series="series"
      :orientation="orientation"
      stacked
      :height="320"
      :references="[{ axis: 'y', value: 350, label: 'План отдела', color: 'var(--gr-warning)' }]"
      show-legend
      aria-label="Заявки по отделам"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint }} Оси называются по данным, а не по экрану: порог задан как
      <code>axis: 'y'</code> в обеих раскладках — это всегда ось значений, и при
      горизонтали она рисует <strong>вертикальный</strong> пунктир.
    </p>
  </div>
</template>
