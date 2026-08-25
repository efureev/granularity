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
 *
 * Скрывается при этом **обёртка**, а не сама `<table>`. Причина в CSS: у
 * табличных боксов `width`/`height` работают как минимум, а не как размер, и
 * `height: 1px` из `sr-only` таблица игнорирует — визуально её убирает `clip`,
 * но геометрия остаётся в полный рост. У графика внутри контейнера с
 * ограниченной высотой это давало лишние сотни пикселей прокрутки: полоса
 * появлялась там, где прокручивать нечего. `<div>` схлопывается как положено.
 */
defineProps<{
  model: ChartTableModel
  visible: boolean
}>()
</script>

<template>
  <div v-if="!visible" class="sr-only">
    <table data-gr-chart-table>
      <caption>{{ model.caption }}</caption>
      <thead>
        <tr>
          <th v-for="column in model.columns" :key="column.key" scope="col">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in model.rows" :key="row.header">
          <th scope="row">
{{ row.header }}
</th>
          <td v-for="(cell, index) in row.cells" :key="index">
{{ cell }}
</td>
        </tr>
      </tbody>
      <!--
        Пояснение — `th`, а не `td`: ячейка без заголовка в таблице от трёх
        колонок поднимает `td-has-header` у axe, а заголовком строки пояснение
        и является.
      -->
      <tfoot v-if="model.notes?.length">
        <tr v-for="(note, index) in model.notes" :key="index">
          <th scope="row" :colspan="model.columns.length">
{{ note }}
</th>
        </tr>
      </tfoot>
    </table>
  </div>

  <table v-else :class="frameTableClass" data-gr-chart-table>
    <caption>{{ model.caption }}</caption>
    <thead>
      <tr>
        <th v-for="column in model.columns" :key="column.key" scope="col" :class="frameTableCellClass">
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in model.rows" :key="row.header">
        <th scope="row" :class="frameTableCellClass">
{{ row.header }}
</th>
        <td v-for="(cell, index) in row.cells" :key="index" :class="frameTableCellClass">
          {{ cell }}
        </td>
      </tr>
    </tbody>
    <tfoot v-if="model.notes?.length">
      <tr v-for="(note, index) in model.notes" :key="index">
        <th scope="row" :colspan="model.columns.length" :class="frameTableCellClass">
{{ note }}
</th>
      </tr>
    </tfoot>
  </table>
</template>
