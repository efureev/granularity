<script setup lang="ts">
import { GrTable } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const rows = [
  { plan: 'Starter', seats: 3, price: '$12' },
  { plan: 'Team', seats: 25, price: '$79' },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTable :size="size" aria-label="Plans">
        <template #head>
          <tr>
            <th class="px-4 py-2 text-left">
              Plan
            </th>
            <th class="px-4 py-2 text-right">
              Seats
            </th>
            <th class="px-4 py-2 text-right">
              Price
            </th>
          </tr>
        </template>

        <tr v-for="row in rows" :key="row.plan" class="border-t border-[var(--gr-brd)]">
          <td class="px-4 py-2">
            {{ row.plan }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.seats }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.price }}
          </td>
        </tr>
      </GrTable>
    </div>
  </div>
</template>
