<script setup lang="ts">
import { GrDataTable } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'seats', label: 'Seats', align: 'right' as const, sortable: true },
]

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Owner', seats: 12 },
  { id: 2, name: 'Grace Hopper', role: 'Admin', seats: 4 },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrDataTable
        :rows="rows"
        :columns="columns"
        :size="size"
        selectable
        aria-label="Members"
      />
    </div>
  </div>
</template>
