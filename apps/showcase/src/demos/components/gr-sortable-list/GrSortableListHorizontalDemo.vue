<script setup lang="ts">
import { ref } from 'vue'

import { GrSortableList } from '@feugene/granularity'

type Column = { id: string, title: string }

const columns = ref<Column[]>([
  { id: 'name', title: 'Название' },
  { id: 'status', title: 'Статус' },
  { id: 'owner', title: 'Ответственный' },
  { id: 'due', title: 'Срок' },
])

const locked = ref(false)
</script>

<template>
  <div class="grid gap-4">
    <label class="flex items-center gap-2 text-sm">
      <input v-model="locked" type="checkbox">
      Запретить перестановку
    </label>

    <GrSortableList
      v-model="columns"
      item-key="id"
      orientation="horizontal"
      :divided="false"
      :disabled="locked"
      aria-label="Порядок колонок"
    >
      <template #item="{ item }">
        {{ item.title }}
      </template>
    </GrSortableList>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      В горизонтальном списке ось клавиатуры тоже горизонтальная: взять — Space, двигать — стрелками влево и вправо.
    </p>
  </div>
</template>
