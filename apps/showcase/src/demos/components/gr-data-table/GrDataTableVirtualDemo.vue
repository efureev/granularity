<script setup lang="ts">
import { GrDataTable, type GrDataColumn } from '@feugene/granularity'

type Person = { id: number, name: string, email: string, team: string }

// Ширины заданы намеренно: с виртуализацией раскладка таблицы фиксируется, и
// без подсказок колонки поделили бы место поровну.
const columns: GrDataColumn<Person>[] = [
  { key: 'id', label: '#', width: 80, sortable: true },
  { key: 'name', label: 'Name', width: '30%', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'team', label: 'Team', width: 140 },
]

const teams = ['Platform', 'Design', 'Growth', 'Support']

const rows: Person[] = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  email: `person${index + 1}@example.com`,
  team: teams[index % teams.length]!,
}))
</script>

<template>
  <GrDataTable
    :rows="rows"
    :columns="columns"
    virtual
    sticky-header
    :max-height="420"
    aria-label="People directory"
  />
</template>
