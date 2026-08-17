<script setup lang="ts">
import { GrDelta, GrTable } from '@feugene/granularity'

interface ChannelRow {
  channel: string
  gross: number
  refunds: number
  change: number
}

const rows: ChannelRow[] = [
  { channel: 'Прямые продажи', gross: 12_400_000, refunds: 320_000, change: 8.4 },
  { channel: 'Партнёры', gross: 8_600_000, refunds: 145_000, change: 2.1 },
  { channel: 'Маркетплейсы', gross: 5_100_000, refunds: 890_000, change: -6.3 },
]

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const sum = (pick: (row: ChannelRow) => number) => rows.reduce((total, row) => total + pick(row), 0)

// Колонок четыре — число нужно `colspan` примечания. `columnCount` у `GrTable`
// сюда не доезжает: он обслуживает только строки loading и empty.
const COLUMN_COUNT = 4
</script>

<template>
  <GrTable>
    <template #header>
      <tr>
        <th class="px-4 py-3 text-left font-600">
          Канал
        </th>
        <th class="px-4 py-3 text-right font-600">
          Выручка
        </th>
        <th class="px-4 py-3 text-right font-600">
          Возвраты
        </th>
        <th class="px-4 py-3 text-right font-600">
          К прошлому кварталу
        </th>
      </tr>
    </template>

    <tr v-for="row in rows" :key="row.channel" class="border-t border-[var(--gr-brd)]">
      <td class="px-4 py-3">
        {{ row.channel }}
      </td>
      <td class="px-4 py-3 text-right">
        {{ money.format(row.gross) }}
      </td>
      <td class="px-4 py-3 text-right">
        {{ money.format(row.refunds) }}
      </td>
      <td class="px-4 py-3 text-right">
        <GrDelta :value="row.change" :precision="1" suffix="%" show-arrow />
      </td>
    </tr>

    <!--
      `GrTable` ячейки не оформляет принципиально, поэтому футер здесь целиком
      на потребителе: отбивка, вес, паддинги, выравнивание и число колонок для
      `colspan` пишутся руками и живут ровно до первой смены размера таблицы.
      Нужен итог, который сам встаёт по колоночной сетке тела и едет за `size`,
      шириной и закреплением, — это `summary-row` у `GrDataTable`.
    -->
    <template #footer>
      <tr class="border-t border-[var(--gr-brd)] font-600">
        <td class="px-4 py-3">
          Итого за квартал
        </td>
        <td class="px-4 py-3 text-right">
          {{ money.format(sum(row => row.gross)) }}
        </td>
        <td class="px-4 py-3 text-right text-[var(--gr-danger-text)]">
          {{ money.format(sum(row => row.refunds)) }}
        </td>
        <td class="px-4 py-3 text-right">
          <GrDelta :value="3.7" :precision="1" suffix="%" show-arrow />
        </td>
      </tr>

      <tr>
        <td :colspan="COLUMN_COUNT" class="px-4 py-3 text-[length:var(--gr-control-text-xs)] text-[var(--gr-muted-fg)]">
          Возвраты за квартал учтены отдельной строкой и в выручку не входят.
        </td>
      </tr>
    </template>
  </GrTable>
</template>
