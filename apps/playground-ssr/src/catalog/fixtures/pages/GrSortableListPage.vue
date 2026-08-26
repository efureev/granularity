<script setup lang="ts">
import { ref } from 'vue'

import { GrSortableList } from '@feugene/granularity'

const items = ref([
  { id: 'a', label: 'Первый' },
  { id: 'b', label: 'Второй' },
])
</script>

<template>
  <GrSortableList v-model="items" item-key="id">
    <template #item="{ item }">
      <span>{{ item.label }}</span>
    </template>
  </GrSortableList>
</template>
