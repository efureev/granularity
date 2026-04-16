<script setup lang="ts">
import { computed, ref } from 'vue'

import DsTable from '../DsTable/DsTable.vue'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconArrowDown from '~icons/lucide/arrow-down'

export type DsDataColumn = {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
}

const props = withDefaults(
  defineProps<{
    rows: Array<Record<string, unknown>>
    columns: DsDataColumn[]
    rowKey?: string
    initialSortKey?: string
    initialSortDir?: 'asc' | 'desc'
  }>(),
  {
    rowKey: 'id',
    initialSortKey: undefined,
    initialSortDir: 'asc',
  },
)

const sortKey = ref<string>(props.initialSortKey ?? '')
const sortDir = ref<'asc' | 'desc'>(props.initialSortDir)

const sortedRows = computed(() => {
  const items = [...props.rows]
  if (!sortKey.value)
    return items

  const key = sortKey.value
  const dir = sortDir.value

  items.sort((a, b) => {
    const av = a[key]
    const bv = b[key]

    const aNum = typeof av === 'number' ? av : Number(av)
    const bNum = typeof bv === 'number' ? bv : Number(bv)
    const bothNumbers = Number.isFinite(aNum) && Number.isFinite(bNum)

    const res = bothNumbers
      ? aNum - bNum
      : String(av ?? '').localeCompare(String(bv ?? ''), undefined, { sensitivity: 'base' })

    return dir === 'asc' ? res : -res
  })

  return items
})

function toggleSort(col: DsDataColumn): void {
  if (!col.sortable)
    return

  if (sortKey.value !== col.key) {
    sortKey.value = col.key
    sortDir.value = 'asc'
    return
  }

  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function cellAlign(col: DsDataColumn): string {
  return col.align === 'right' ? 'text-right' : 'text-left'
}

function rowKeyValue(row: Record<string, unknown>): string {
  const key = props.rowKey
  return String(row[key] ?? JSON.stringify(row))
}
</script>

<template>
  <DsTable>
    <template #head>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
          class="font-700 text-xs px-4 py-3"
          :class="cellAlign(col)"
        >
          <div class="inline-flex items-center gap-2">
            <button
              v-if="col.sortable"
              type="button"
              class="inline-flex items-center gap-2 text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
              @click="toggleSort(col)"
            >
              <span>{{ col.label }}</span>
              <span class="inline-flex">
                <IconArrowUp
                  v-if="sortKey === col.key && sortDir === 'asc'"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                <IconArrowDown
                  v-else-if="sortKey === col.key && sortDir === 'desc'"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </span>
            </button>
            <span v-else class="text-[var(--muted-fg)]">{{ col.label }}</span>
          </div>
        </th>
      </tr>
    </template>

    <tr v-for="row in sortedRows" :key="rowKeyValue(row)" class="border-t border-[var(--brd)]">
      <td
        v-for="col in props.columns"
        :key="col.key"
        class="px-4 py-3"
        :class="cellAlign(col)"
      >
        <slot :name="`cell-${col.key}`" :row="row">
          <span>{{ row[col.key] }}</span>
        </slot>
      </td>
    </tr>
  </DsTable>
</template>