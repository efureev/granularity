<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDataColumn } from '@feugene/granularity'
import { GrDataTable, GrDelta } from '@feugene/granularity'

type Channel = {
  id: number
  channel: string
  gross: number
  refunds: number
  net: number
  change: number
}

const rows: Channel[] = [
  { id: 1, channel: 'Прямые продажи', gross: 12_400_000, refunds: 320_000, net: 12_080_000, change: 8.4 },
  { id: 2, channel: 'Партнёры', gross: 8_600_000, refunds: 145_000, net: 8_455_000, change: 2.1 },
  { id: 3, channel: 'Маркетплейсы', gross: 5_100_000, refunds: 890_000, net: 4_210_000, change: -6.3 },
  { id: 4, channel: 'Розница', gross: 3_250_000, refunds: 61_000, net: 3_189_000, change: 0 },
]

const columns: GrDataColumn<Channel>[] = [
  { key: 'channel', label: 'Канал' },
  { key: 'gross', label: 'Выручка', align: 'right' },
  { key: 'refunds', label: 'Возвраты', align: 'right' },
  { key: 'net', label: 'Чистая', align: 'right' },
  { key: 'change', label: 'К прошлому кварталу', align: 'right' },
]

const selected = ref<Array<string | number>>([2])

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const sum = (pick: (row: Channel) => number) => rows.reduce((total, row) => total + pick(row), 0)

const previous = { gross: 27_900_000, refunds: 1_180_000, net: 26_720_000 }

// Считает приложение: что именно итожить — страницу, фильтр или весь журнал —
// таблица знать не может.
//
// `#cell-<key>` до итога не доходит: тело и итог — разные строки. Колонка либо
// кладёт в `summaryRow` уже готовую строку, либо получает слот `#summary-<key>`;
// здесь показаны оба пути.
const summaryRow = computed(() => ({
  channel: 'Итого за квартал',
  gross: money.format(sum(row => row.gross)),
  refunds: sum(row => row.refunds),
  net: money.format(sum(row => row.net)),
  change: (sum(row => row.net) / previous.net - 1) * 100,
}))
</script>

<template>
  <GrDataTable
    v-model:selected="selected"
    :rows="rows"
    :columns="columns"
    row-key="id"
    selectable
    :summary-row="summaryRow"
    aria-label="Выручка по каналам"
  >
    <template #cell-gross="{ row }">
      {{ money.format(row.gross as number) }}
    </template>

    <template #cell-refunds="{ row }">
      {{ money.format(row.refunds as number) }}
    </template>

    <template #cell-net="{ row }">
      {{ money.format(row.net as number) }}
    </template>

    <template #cell-change="{ row }">
      <GrDelta :value="row.change as number" :precision="1" suffix="%" show-arrow />
    </template>

    <!--
      Тона у итога нет по умолчанию: «возвраты» и «прибыль» — разные сообщения,
      и выбрать за приложение компонент не может.
    -->
    <template #summary-refunds="{ value }">
      <span class="text-[var(--gr-danger-text)]">{{ money.format(value as number) }}</span>
    </template>

    <template #summary-change="{ value }">
      <GrDelta :value="value as number" :precision="1" suffix="%" show-arrow />
    </template>

    <!--
      Всё, что в одну типизированную строку не ложится, живёт в `#footer`:
      вторая итоговая строка и примечание под таблицей. Содержимое слота — тоже
      строки таблицы, а не свободный блок: `div.flex` лёг бы под таблицу, но не
      встал бы под свои колонки.

      Цена ручной строки видна прямо здесь: паддинги, выравнивание и пустая
      ведущая ячейка под чекбокс переписываются руками и привязаны к `size` —
      поставьте таблице `size="lg"`, и `px-4 py-3` разъедется с телом. Ровно
      поэтому главный итог берётся пропом `summaryRow`, а не собирается тут же.
    -->
    <template #footer="{ totalColumns }">
      <tr class="text-[var(--gr-muted-fg)]">
        <td />
        <td class="px-4 py-3">
          Прошлый квартал
        </td>
        <td class="px-4 py-3 text-right">
          {{ money.format(previous.gross) }}
        </td>
        <td class="px-4 py-3 text-right">
          {{ money.format(previous.refunds) }}
        </td>
        <td class="px-4 py-3 text-right">
          {{ money.format(previous.net) }}
        </td>
        <td />
      </tr>

      <tr>
        <td :colspan="totalColumns" class="px-4 py-3 text-[length:var(--gr-control-text-xs)] text-[var(--gr-muted-fg)]">
          Возвраты учтены в «Чистой». Выбрано строк: {{ selected.length }} из {{ rows.length }}.
        </td>
      </tr>
    </template>
  </GrDataTable>
</template>
