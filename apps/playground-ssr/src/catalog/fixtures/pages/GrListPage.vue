<script setup lang="ts">
import { GrList, GrListItem } from '@feugene/granularity'

const rows = [
  { id: 'a', title: 'Первый пункт' },
  { id: 'b', title: 'Второй пункт' },
]
</script>

<template>
  <GrList divided>
    <GrListItem v-for="row in rows" :key="row.id" :title="row.title" />
  </GrList>
</template>
