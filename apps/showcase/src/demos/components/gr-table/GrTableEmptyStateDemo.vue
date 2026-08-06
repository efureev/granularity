<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTable } from '@feugene/granularity'
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

    <!-- Ни `v-if` вокруг строк, ни ручного `colspan`: пустоту таблица видит по слоту сама. -->
    <GrTable :column-count="3" striped hoverable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headPreset') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headOwner') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headValue') }}</th>
        </tr>
      </template>

      <tr v-for="row in (empty ? [] : rows)" :key="row.name" class="border-t border-[var(--gr-brd)]">
        <td class="px-4 py-3">{{ row.name }}</td>
        <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.owner }}</td>
        <td class="px-4 py-3">{{ row.value }}</td>
      </tr>

      <template #empty>
        <div class="grid justify-items-center gap-2">
          <span>{{ t('components.GrTable.empty.emptyTitle') }}</span>
          <GrButton size="sm" @click="empty = false">
            {{ t('components.GrTable.empty.loadSample') }}
          </GrButton>
        </div>
      </template>
    </GrTable>
  </div>
</template>
