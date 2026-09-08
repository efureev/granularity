<script setup lang="ts">
import { GrTable } from '@feugene/granularity'

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август']

const rows = [
  { region: 'Северо-Запад', values: [124, 131, 118, 142, 155, 161, 149, 158] },
  { region: 'Центральный', values: [318, 302, 341, 355, 372, 368, 349, 381] },
  { region: 'Приволжский', values: [207, 214, 199, 226, 238, 231, 224, 245] },
  { region: 'Уральский', values: [96, 103, 112, 108, 121, 119, 127, 134] },
  { region: 'Сибирский', values: [143, 138, 151, 147, 162, 158, 166, 171] },
]
</script>

<template>
  <div class="grid gap-4">
    <GrTable
      sticky-column
      sticky-header
      striped
      hoverable
      table-min-width="900px"
      max-height="280px"
      region-label="Отгрузки по регионам"
      :column-count="months.length + 1"
    >
      <template #header>
        <tr>
          <th class="px-4 py-2 text-left whitespace-nowrap">
            Регион
          </th>
          <th v-for="month in months" :key="month" class="px-4 py-2 text-right whitespace-nowrap">
            {{ month }}
          </th>
        </tr>
      </template>

      <tr v-for="row in rows" :key="row.region">
        <td class="px-4 py-2 whitespace-nowrap font-500">
          {{ row.region }}
        </td>
        <td v-for="(value, i) in row.values" :key="i" class="px-4 py-2 text-right tabular-nums">
          {{ value }}
        </td>
      </tr>
    </GrTable>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Прокрутите таблицу вбок: колонка регионов остаётся на месте, иначе видно числа, но не видно,
      чьи они. Полосатость и подсветка под курсором работают в ней наравне с остальными —
      липкая ячейка наследует фон своей строки.
    </p>
  </div>
</template>
