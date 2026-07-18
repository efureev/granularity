<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrEmptyState, GrTable } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const empty = ref(true)

const rows = [
  { name: 'Risk alerts', owner: 'Ops team', value: 'Enabled' },
  { name: 'Approval SLA', owner: 'Finance', value: '24 hours' },
]
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="empty = !empty">
        {{ empty ? t('components.GrTable.empty.showRows') : t('components.GrTable.empty.showEmpty') }}
      </GrButton>
    </div>

    <GrTable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headPreset') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headOwner') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headValue') }}</th>
        </tr>
      </template>

      <tr v-if="empty" class="border-t border-[var(--brd)]">
        <td colspan="3" class="px-4 py-6">
          <GrEmptyState
            :title="t('components.GrTable.empty.emptyTitle')"
            :description="t('components.GrTable.empty.emptyDescription')"
          >
            <GrButton size="sm" @click="empty = false">
              {{ t('components.GrTable.empty.loadSample') }}
            </GrButton>
          </GrEmptyState>
        </td>
      </tr>

      <template v-else>
        <tr
          v-for="row in rows"
          :key="row.name"
          class="border-t border-[var(--brd)]"
        >
          <td class="px-4 py-3">{{ row.name }}</td>
          <td class="px-4 py-3 text-[var(--muted-fg)]">{{ row.owner }}</td>
          <td class="px-4 py-3">{{ row.value }}</td>
        </tr>
      </template>
    </GrTable>
  </div>
</template>