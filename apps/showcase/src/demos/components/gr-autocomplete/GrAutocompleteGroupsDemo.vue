<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete, GrCard } from '@feugene/granularity'

const city = ref('')
const stack = ref<string[]>([])

/**
 * Одна и та же форма данных, что у `GrSelect`: группа — заголовок и её опции.
 *
 * Опция вне групп стоит первой намеренно: после группы она читалась бы как её
 * член — отступ у опций общий и приходит от места под галочку.
 */
const cities = [
  { value: 'remote', label: 'Удалённо' },
  {
    label: 'Европа',
    options: [
      { value: 'lis', label: 'Лиссабон' },
      { value: 'prg', label: 'Прага' },
      { value: 'tbs', label: 'Тбилиси' },
    ],
  },
  {
    label: 'Азия',
    options: [
      { value: 'bkk', label: 'Бангкок' },
      { value: 'tyo', label: 'Токио' },
    ],
  },
]

const stackOptions = [
  {
    label: 'Фреймворки',
    options: [
      { value: 'vue', label: 'Vue' },
      { value: 'react', label: 'React' },
      { value: 'svelte', label: 'Svelte' },
    ],
  },
  {
    label: 'Сборщики',
    options: [
      { value: 'vite', label: 'Vite' },
      { value: 'webpack', label: 'Webpack' },
    ],
  },
]
</script>

<template>
  <div class="grid gap-6">
    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Группы и опции вне групп
      </div>
      <GrAutocomplete
          v-model="city"
          :options="cities"
          aria-label="Город"
          placeholder="Начните вводить город"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Наберите «то» — «Азия» останется с Токио, а «Европа» исчезнет целиком:
        заголовок над пустотой читается как сбой, а не как «здесь ничего нет».
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Группы и множественный выбор
      </div>
      <GrAutocomplete
          v-model="stack"
          :options="stackOptions"
          multiple
          aria-label="Стек"
          placeholder="Что используете"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Клавиатура ходит только по опциям: заголовок группы стрелками не
        выбирается и в набор для диктора не входит.
      </div>
    </GrCard>
  </div>
</template>
