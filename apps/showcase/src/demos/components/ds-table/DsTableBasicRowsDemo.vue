<script setup lang="ts">
import type {DsBadgeTone} from '@feugene/granularity'
import {DsBadge, DsTable} from '@feugene/granularity'
interface TableRow {
  campaign: string
  owner: string
  status: string
  tag: DsBadgeTone
  reach: string
}
const rows: TableRow[] = [
  {campaign: 'Spring onboarding', owner: 'Olivia', status: 'Ready', tag: 'success', reach: '18.2k'},
  {campaign: 'Card migration', owner: 'Maksim', status: 'Review', tag: 'info', reach: '9.7k'},
  {campaign: 'Payout reminder', owner: 'Anna', status: 'Paused', tag: 'warning', reach: '6.3k'},
]
</script>

<template>
  <DsTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Campaign</th>
        <th class="px-4 py-3 text-left font-600">Owner</th>
        <th class="px-4 py-3 text-left font-600">Status</th>
        <th class="px-4 py-3 text-right font-600">Reach</th>
      </tr>
    </template>

    <tr
        v-for="row in rows"
        :key="row.campaign"
        class="border-t border-[var(--brd)]"
    >
      <td class="px-4 py-3">{{ row.campaign }}</td>
      <td class="px-4 py-3 text-[var(--muted-fg)]">{{ row.owner }}</td>
      <td class="px-4 py-3">
        <DsBadge size="sm" :tone="row.tag">
          {{ row.status }}
        </DsBadge>
      </td>
      <td class="px-4 py-3 text-right font-600">{{ row.reach }}</td>
    </tr>
  </DsTable>
</template>