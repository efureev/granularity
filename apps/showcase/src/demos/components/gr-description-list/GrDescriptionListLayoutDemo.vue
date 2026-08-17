<script setup lang="ts">
import { ref } from 'vue'

import type { GrDescriptionItem, GrDescriptionColumns, GrDescriptionLayout } from '@feugene/granularity'
import { GrDescriptionList, GrSegmented } from '@feugene/granularity'

const items: GrDescriptionItem[] = [
  { label: 'Plan', value: 'Business' },
  { label: 'Seats', value: 48 },
  { label: 'MIME', value: 'application/pdf' },
  { label: 'Size', value: '2.4 MB' },
  { label: 'Checksum', value: 'sha256:9f2b1c…' },
  { label: 'Retention', value: '90 days' },
]

const layout = ref<GrDescriptionLayout>('inline')
const columns = ref<GrDescriptionColumns>(2)

/**
 * Ширина контейнера, а не окна: колонки считает CSS от неё. Сузьте — и лишние
 * колонки схлопнутся сами, не дожидаясь смены брейкпоинта вьюпорта.
 */
const width = ref(680)
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="layout"
      :options="[
        { value: 'inline', label: 'inline' },
        { value: 'stacked', label: 'stacked' },
        { value: 'flow', label: 'flow' },
      ]"
      size="sm"
    />

    <!--
      Колонки принадлежат сетке, поэтому в `flow` переключатель не у дел:
      строка раскладывает пары по ширине и переносит их сама.
    -->
    <GrSegmented
      v-model="columns"
      :options="[
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
      ]"
      :disabled="layout === 'flow'"
      size="sm"
    />

    <!--
      Ширина контейнера, а не окна. Колонки считает CSS от неё: `columns` задаёт
      потолок, а сколько их встанет на самом деле — решает место. Сузьте до
      290px, и две колонки схлопнутся в одну, хотя экран остался широким.
    -->
    <label class="flex items-center gap-3 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      Ширина контейнера
      <input v-model.number="width" type="range" min="240" max="680" step="10" class="w-48">
      <span class="tabular-nums">{{ width }}px</span>
    </label>

    <!--
      `stackBelow` меряет контейнер и переключает только раскладку подписей:
      фиксированная подпись в узкой колонке выжимает значение в букву на строку.
    -->
    <div :style="{ width: `${width}px`, maxWidth: '100%' }" class="rounded-[var(--gr-radius-md)] border border-dashed border-[var(--gr-brd)] p-3">
      <GrDescriptionList :items="items" :layout="layout" :columns="columns" :stack-below="420" />
    </div>
  </div>
</template>
