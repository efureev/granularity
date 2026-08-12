<script setup lang="ts">
import { ref } from 'vue'

import { GrSortableList } from '@feugene/granularity'

type Field = { id: string, title: string }

const fields = ref<Field[]>(Array.from({ length: 14 }, (_, index) => ({
  id: `field-${index + 1}`,
  title: `Поле отчёта № ${index + 1}`,
})))

const lastMove = ref<string>('—')
</script>

<template>
  <div class="grid gap-4">
    <GrSortableList
      v-model="fields"
      item-key="id"
      :max-height="220"
      @move="(from, to) => (lastMove = `${from} на ${to}`)"
    >
      <template #item="{ item }">
        {{ item.title }}
      </template>
    </GrSortableList>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Последняя перестановка: <code>{{ lastMove }}</code>. У верхнего и нижнего края список
      прокручивается сам, пока держите строку.
    </p>
  </div>
</template>
