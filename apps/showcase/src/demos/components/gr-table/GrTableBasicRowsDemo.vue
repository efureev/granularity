<script setup lang="ts">
import type {GrBadgeTone} from '@feugene/granularity'
import {GrBadge, GrTable} from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()

interface TableRow {
  campaign: string
  owner: string
  status: string
  tag: GrBadgeTone
  reach: string
}
const rows: TableRow[] = [
  {campaign: 'Spring onboarding', owner: 'Olivia', status: 'Ready', tag: 'success', reach: '18.2k'},
  {campaign: 'Card migration', owner: 'Maksim', status: 'Review', tag: 'info', reach: '9.7k'},
  {campaign: 'Payout reminder', owner: 'Anna', status: 'Paused', tag: 'warning', reach: '6.3k'},
]
</script>

<template>
  <GrTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.basic.campaign') }}</th>
        <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.basic.owner') }}</th>
        <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.basic.status') }}</th>
        <th class="px-4 py-3 text-right font-600">{{ t('components.GrTable.basic.reach') }}</th>
      </tr>
    </template>

    <tr
        v-for="row in rows"
        :key="row.campaign"
        class="border-t border-[var(--gr-brd)]"
    >
      <td class="px-4 py-3">{{ row.campaign }}</td>
      <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.owner }}</td>
      <td class="px-4 py-3">
        <GrBadge size="sm" :tone="row.tag">
          {{ row.status }}
        </GrBadge>
      </td>
      <td class="px-4 py-3 text-right font-600">{{ row.reach }}</td>
    </tr>
  </GrTable>
</template>