<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrDataTable, type GrColumnPin } from '@feugene/granularity'

type Deal = {
  id: number
  company: string
  owner: string
  stage: string
  amount: string
  closes: string
  region: string
}

const columns = [
  { key: 'company', label: 'Компания', width: 220 },
  { key: 'owner', label: 'Менеджер', width: 200 },
  { key: 'stage', label: 'Этап', width: 180 },
  { key: 'amount', label: 'Сумма', width: 160, align: 'right' as const },
  { key: 'closes', label: 'Закрытие', width: 180 },
  { key: 'region', label: 'Регион', width: 180 },
]

const rows: Deal[] = [
  { id: 1, company: 'Северный порт', owner: 'Аня Королёва', stage: 'Переговоры', amount: '1 240 000 ₽', closes: '12 сентября', region: 'Северо-Запад' },
  { id: 2, company: 'Гринфилд Агро', owner: 'Пётр Ильин', stage: 'Договор', amount: '860 000 ₽', closes: '3 октября', region: 'Юг' },
  { id: 3, company: 'Урал Металл', owner: 'Дина Сафина', stage: 'Пилот', amount: '2 015 000 ₽', closes: '28 августа', region: 'Урал' },
  { id: 4, company: 'Вектор Медиа', owner: 'Лев Гончаров', stage: 'Квалификация', amount: '470 000 ₽', closes: '17 ноября', region: 'Центр' },
]

const pinned = ref<Record<string, GrColumnPin>>({ company: 'left' })

const summary = computed(() => {
  const entries = Object.entries(pinned.value).filter(([, side]) => side !== null)
  if (entries.length === 0)
    return 'Ничего не закреплено'

  return entries
    .map(([key, side]) => `${columns.find(col => col.key === key)?.label ?? key} — ${side === 'left' ? 'слева' : 'справа'}`)
    .join(', ')
})
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable
      v-model:pinned-columns="pinned"
      pinnable-columns
      :columns="columns"
      :rows="rows"
      row-key="id"
      :max-height="320"
      sticky-header
      aria-label="Сделки"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Меню в заголовке колонки закрепляет её у края и открепляет обратно. Закреплённые колонки
      всегда стоят своей группой у своего края, поэтому выбор заодно переставляет колонку.
      Сейчас: <code>{{ summary }}</code>.
    </p>
  </div>
</template>
