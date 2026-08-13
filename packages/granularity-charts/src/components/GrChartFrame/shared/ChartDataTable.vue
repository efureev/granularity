<script setup lang="ts">
import type { ChartTableModel } from '../../../chart/chartTable'
import { frameTableCellClass, frameTableClass } from '../chartFrameStyles'

/**
 * Полные данные графика таблицей.
 *
 * Своей разметкой, а не `GrTable` ядра, и это осознанно: импорт из
 * `@feugene/granularity/components/*` создаёт ребро графа компонентов, которое
 * `granular doctor --strict` требует объявить, — а объявление подмешает
 * потребителю графика весь safelist и CSS таблицы за таблицу, которую он не
 * видит. Разметки здесь двадцать строк и ни одного своего класса в скрытом
 * режиме.
 *
 * `visible: false` не прячет таблицу от скринридера: `sr-only` оставляет её в
 * дереве доступности, в отличие от `display: none`.
 */
defineProps<{
  model: ChartTableModel
  visible: boolean
}>()
</script>

<template>
  <table :class="visible ? frameTableClass : 'sr-only'" data-gr-chart-table>
    <caption :class="visible ? undefined : 'sr-only'">
{{ model.caption }}
</caption>
    <thead>
      <tr>
        <th v-for="column in model.columns" :key="column.key" scope="col" :class="visible ? frameTableCellClass : undefined">
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in model.rows" :key="row.header">
        <th scope="row" :class="visible ? frameTableCellClass : undefined">
{{ row.header }}
</th>
        <td v-for="(cell, index) in row.cells" :key="index" :class="visible ? frameTableCellClass : undefined">
          {{ cell }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
