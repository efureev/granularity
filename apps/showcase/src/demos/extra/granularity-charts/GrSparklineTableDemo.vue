<script setup lang="ts">
import { computed } from 'vue'

/**
 * Сценарий, ради которого спарклайн и существует: колонка «динамика» в таблице.
 *
 * Он ничего не замеряет и не держит слушателей, поэтому сотня строк стоит ровно
 * сотню коротких `<svg>`. Здесь важна не отдельная линия, а **сравнение форм по
 * вертикали**: глаз находит выбивающуюся строку раньше, чем прочитает числа.
 */
interface Row {
  service: string
  unit: string
  trend: (number | null)[]
}

const rows: Row[] = [
  { service: 'API Gateway', unit: 'мс', trend: [128, 132, 126, 141, 138, 152, 147, 139, 144, 136] },
  { service: 'Auth', unit: 'мс', trend: [92, 90, 94, 91, 89, 93, 90, 88, 91, 87] },
  { service: 'Search', unit: 'мс', trend: [210, 224, 236, 251, 268, 279, 298, 312, 331, 348] },
  // Пропуск — не ноль: сервис не отвечал, значения не было. Линия рвётся.
  { service: 'Storage', unit: 'мс', trend: [164, 158, null, null, 149, 152, 147, 143, 139, 134] },
  { service: 'Queue', unit: 'мс', trend: [46, 44, 47, 45, 43, 44, 42, 41, 43, 40] },
]

/** Тон линии — по смыслу: для времени отклика рост это ухудшение. */
function toneColor(trend: (number | null)[]): string {
  const values = trend.filter((value): value is number => value !== null)
  const change = (values.at(-1)! - values[0]!) / values[0]!

  if (change > 0.05)
    return 'var(--gr-danger)'
  if (change < -0.05)
    return 'var(--gr-success)'

  return 'var(--gr-chart-1)'
}

const model = computed(() => rows.map((row) => {
  const values = row.trend.filter((value): value is number => value !== null)
  const first = values[0]!
  const last = values.at(-1)!

  return {
    ...row,
    last,
    change: Math.round(((last - first) / first) * 100),
    color: toneColor(row.trend),
  }
}))
</script>

<template>
  <div class="grid gap-3">
    <table class="w-full table-fixed border-collapse text-[length:var(--gr-control-text-sm)]">
      <!--
        Ширины заданы явно и колонка динамики — самая широкая. Иначе имя сервиса
        забирает всё свободное место, линии прижимаются к числам и перестают
        сравниваться по вертикали, то есть теряют единственный свой смысл.
      -->
      <colgroup>
        <col class="w-40">
        <col>
        <col class="w-24">
        <col class="w-20">
      </colgroup>
      <thead>
        <tr class="border-b border-[var(--gr-brd)] text-left text-[var(--gr-muted-fg)]">
          <th scope="col" class="py-2 pr-4 font-500">Сервис</th>
          <th scope="col" class="py-2 pr-4 font-500">Отклик, 10 дней</th>
          <th scope="col" class="py-2 pr-4 text-right font-500">Сейчас</th>
          <th scope="col" class="py-2 text-right font-500">Δ</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in model"
          :key="row.service"
          class="border-b border-[var(--gr-brd)] last:border-0"
        >
          <th scope="row" class="py-2 pr-4 text-left font-500">{{ row.service }}</th>

          <td class="py-2 pr-6 align-middle">
            <!-- Высота задаётся токеном: в строке таблицы спарклайн обязан быть ниже, чем в карточке. -->
            <GrSparkline
              :data="row.trend"
              :color="row.color"
              style="--gr-sparkline-height: 1.75rem"
              :aria-label="`${row.service}: динамика отклика за 10 дней`"
            />
          </td>

          <td class="py-2 pr-4 text-right [font-variant-numeric:tabular-nums]">
            {{ row.last }} <span class="text-[var(--gr-muted-fg)]">{{ row.unit }}</span>
          </td>

          <td
            class="py-2 text-right [font-variant-numeric:tabular-nums]"
            :class="row.change > 0 ? 'text-[var(--gr-danger-text)]' : row.change < 0 ? 'text-[var(--gr-success-text)]' : 'text-[var(--gr-muted-fg)]'"
          >
            {{ row.change > 0 ? '+' : '' }}{{ row.change }}%
          </td>
        </tr>
      </tbody>
    </table>

    <p class="showcase-demo-text text-sm text-[var(--gr-muted-fg)]">
      Строка <strong>Search</strong> находится глазом раньше, чем читается: её форма выбивается из остальных. Это и есть
      работа спарклайна в таблице — не показать значение, а показать, какую строку смотреть. У <strong>Storage</strong>
      линия разорвана: два часа сервис не отвечал, и пропуск нарисован разрывом, а не нулём.
      <br>
      Важная оговорка: каждая линия нормирована по <strong>своему</strong> ряду, поэтому сравнивать между строками можно
      формы, но не уровни — 40 мс и 348 мс займут одинаковую высоту. Уровень читается в колонке «Сейчас».
    </p>
  </div>
</template>
