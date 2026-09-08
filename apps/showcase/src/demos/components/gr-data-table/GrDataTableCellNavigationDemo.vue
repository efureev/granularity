<script setup lang="ts">
import { GrDataTable, type GrDataColumn } from '@feugene/granularity'

type Ticket = { id: number, title: string, assignee: string, priority: string, updated: string }

const columns: GrDataColumn<Ticket>[] = [
  { key: 'id', label: '#', width: 80, sortable: true },
  { key: 'title', label: 'Задача', width: '40%', sortable: true },
  { key: 'assignee', label: 'Исполнитель', width: 200 },
  { key: 'priority', label: 'Приоритет', width: 160 },
  { key: 'updated', label: 'Обновлено', width: 160 },
]

const rows: Ticket[] = [
  { id: 101, title: 'Форма входа теряет фокус после ошибки', assignee: 'Аня Королёва', priority: 'Высокий', updated: 'вчера' },
  { id: 102, title: 'Экспорт в CSV теряет разделитель', assignee: 'Пётр Ильин', priority: 'Средний', updated: '3 дня назад' },
  { id: 103, title: 'Таймзона в отчёте не совпадает с профилем', assignee: 'Дина Сафина', priority: 'Высокий', updated: 'сегодня' },
  { id: 104, title: 'Долгая загрузка списка на мобильном', assignee: 'Лев Гончаров', priority: 'Низкий', updated: 'неделю назад' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable
      cell-navigation
      selectable
      :columns="columns"
      :rows="rows"
      row-key="id"
      aria-label="Задачи"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Вся таблица — одна остановка <code>Tab</code>. Внутрь ведут стрелки, к краям строки —
      <code>Home</code> и <code>End</code>, а в содержимое ячейки — <code>Enter</code> или
      <code>F2</code>; <code>Escape</code> возвращает фокус самой ячейке.
    </p>
  </div>
</template>
