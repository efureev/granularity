<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCheckbox, GrDrawer, GrTable } from '@feugene/granularity'

const open = ref(false)
const onlyOverdue = ref(false)
const clicks = ref(0)

const rows = [
  { id: 'INV-1042', client: 'Northwind', status: 'Overdue' },
  { id: 'INV-1043', client: 'Contoso', status: 'Paid' },
  { id: 'INV-1044', client: 'Fabrikam', status: 'Overdue' },
]

const visibleRows = () => (onlyOverdue.value ? rows.filter(row => row.status === 'Overdue') : rows)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton class="justify-self-start" @click="open = true">
        Open filters
      </GrButton>
      <!-- Страница под немодальной панелью остаётся живой: счётчик растёт. -->
      <GrButton variant="outline" @click="clicks++">
        Table still responds: {{ clicks }}
      </GrButton>
    </div>

    <GrTable>
      <template #head>
        <tr>
          <th class="px-4 py-2 text-left">Invoice</th>
          <th class="px-4 py-2 text-left">Client</th>
          <th class="px-4 py-2 text-left">Status</th>
        </tr>
      </template>

      <tr v-for="row in visibleRows()" :key="row.id">
        <td class="px-4 py-2">{{ row.id }}</td>
        <td class="px-4 py-2">{{ row.client }}</td>
        <td class="px-4 py-2">{{ row.status }}</td>
      </tr>
    </GrTable>

    <!-- `modal: false` — ни подложки, ни блокировки скролла, ни ловушки фокуса:
         с панелью работают, не закрывая её. Esc закрывает по-прежнему. -->
    <GrDrawer v-model="open" :modal="false" size="sm" title="Invoice filters">
      <GrCheckbox v-model="onlyOverdue">
        Only overdue
      </GrCheckbox>

      <template #footer>
        <GrButton variant="outline" class="w-full" @click="open = false">
          Done
        </GrButton>
      </template>
    </GrDrawer>
  </div>
</template>
