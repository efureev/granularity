<script setup lang="ts">
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
const labelClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'

const SIGNUPS = [980, 1010, 995, 1042, 1078, 1065, 1120, 1156, 1190, 1215, 1246, 1284]
const INCIDENTS = [34, 33, 30, 31, 27, 24, 22, 23, 18, 15, 13, 11]
const CHURN = [3.4, 3.3, 3.0, 3.1, 2.7, 2.4, 2.2, 2.3, 1.8, 1.5, 1.3, 1.1]
const LATENCY = [128, 132, 126, 141, 138, 152, 147, 139, 144, 136]

interface ServiceRow {
  service: string
  trend: readonly (number | null)[]
}

const SERVICES: ServiceRow[] = [
  { service: 'API Gateway', trend: [128, 132, 126, 141, 138, 152, 147, 139, 144, 136] },
  { service: 'Auth', trend: [92, 90, 94, 91, 89, 93, 90, 88, 91, 87] },
  { service: 'Search', trend: [210, 224, 236, 251, 268, 279, 298, 312, 331, 348] },
  { service: 'Storage', trend: [164, 158, null, null, 149, 152, 147, 143, 139, 134] },
  { service: 'Queue', trend: [46, 44, 47, 45, 43, 44, 42, 41, 43, 40] },
]

const serviceRows = SERVICES.map((row) => {
  const values = row.trend.filter((value): value is number => value !== null)
  const first = values[0] ?? 0
  const last = values.at(-1) ?? 0
  return { ...row, last, change: first === 0 ? 0 : Math.round(((last - first) / first) * 100) }
})

function changeClass(change: number): string {
  if (change > 0)
    return 'text-[var(--gr-danger-text)]'
  return change < 0 ? 'text-[var(--gr-success-text)]' : 'text-[var(--gr-muted-fg)]'
}

const numbers = new Intl.NumberFormat('ru-RU')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-1">
    <div class="flex items-baseline justify-between gap-3">
      <span :class="labelClass" class="min-w-0 truncate">Регистрации</span>
      <strong class="shrink-0 whitespace-nowrap text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-lg)] [font-variant-numeric:tabular-nums]">1 284</strong>
    </div>
    <GrSparkline :data="SIGNUPS" />
    <div class="flex justify-between" :class="mutedClass">
      <span>12 недель назад</span>
      <span>сейчас</span>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Линия и площадь" note="line — только ход; area — когда важен объём под кривой. Осей нет намеренно: спарклайн отвечает «росло или падало».">
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <span :class="mutedClass">line</span>
          <GrSparkline :data="SIGNUPS" />
        </div>
        <div class="flex flex-col gap-1">
          <span :class="mutedClass">area</span>
          <GrSparkline :data="SIGNUPS" variant="area" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Имя вместо картинки" note="Без aria-label имя собирается само: направление, края и размах. Своё имя заменяет сводку целиком — пишите его, только если сводка не нужна.">
      <div class="flex flex-col gap-1">
        <span :class="labelClass">Открытые инциденты, 12 недель</span>
        <GrSparkline :data="INCIDENTS" />
        <p :class="mutedClass">
          Диктор слышит: «падение, от 34 до 11, минимум 11, максимум 34».
        </p>
      </div>
      <div class="flex flex-col gap-1">
        <span :class="labelClass">Открытые инциденты, 12 недель</span>
        <GrSparkline :data="INCIDENTS" aria-label="Открытых инцидентов втрое меньше, чем 12 недель назад" />
        <p :class="mutedClass">
          Диктор слышит: «Открытых инцидентов втрое меньше, чем 12 недель назад».
        </p>
      </div>
    </Specimen>

    <Specimen title="В карточке показателя" note="Число отвечает «сколько», линия — «как менялось»; концы периода подписывает карточка, а не спарклайн." wide>
      <div class="grid gap-4 sm:grid-cols-2">
        <GrCard padding="md">
          <div class="flex flex-col gap-3">
            <GrStatistic title="Регистрации за неделю" :value="1284" locale="ru-RU">
              <template #trend>
                <GrDelta :value="31" suffix="%" locale="ru-RU" show-arrow />
                <span>за 12 недель</span>
              </template>
            </GrStatistic>
            <div class="flex flex-col gap-1">
              <GrSparkline :data="SIGNUPS" variant="area" />
              <div class="flex justify-between" :class="mutedClass">
                <span>12 недель назад</span>
                <span>сейчас</span>
              </div>
            </div>
          </div>
        </GrCard>
        <GrCard padding="md">
          <div class="flex flex-col gap-3">
            <GrStatistic title="Отток" :value="1.1" :precision="1" suffix="%" locale="ru-RU">
              <template #trend>
                <GrDelta :value="-2.3" :precision="1" suffix="п. п." polarity="negative-good" locale="ru-RU" show-arrow />
                <span>за 12 недель</span>
              </template>
            </GrStatistic>
            <div class="flex flex-col gap-1">
              <GrSparkline :data="CHURN" />
              <div class="flex justify-between" :class="mutedClass">
                <span>12 недель назад</span>
                <span>сейчас</span>
              </div>
            </div>
          </div>
        </GrCard>
      </div>
    </Specimen>

    <Specimen title="В колонке таблицы" note="Сравниваются формы, а не уровни: каждая линия нормирована по своему ряду. Search находится глазом раньше, чем читается; у Storage два дня без ответа — линия рвётся, а не падает в ноль." wide>
      <table class="w-full table-fixed border-collapse text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <colgroup>
          <col class="w-36">
          <col>
          <col class="w-24">
          <col class="w-24">
        </colgroup>
        <thead>
          <tr class="border-b border-[var(--gr-brd)] text-left text-[var(--gr-muted-fg)]">
            <th scope="col" class="py-2 pr-4 font-500">
              Сервис
            </th>
            <th scope="col" class="py-2 pr-4 font-500">
              Отклик, 10 дней
            </th>
            <th scope="col" class="py-2 pr-4 text-right font-500">
              Сейчас
            </th>
            <th scope="col" class="py-2 text-right font-500">
              Изменение
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in serviceRows" :key="row.service" class="border-b border-[var(--gr-brd)] last:border-0">
            <th scope="row" class="py-2 pr-4 text-left font-500">
              {{ row.service }}
            </th>
            <td class="py-2 pr-6 align-middle [--gr-sparkline-height:var(--gr-space-6)]">
              <GrSparkline :data="row.trend" />
            </td>
            <td class="py-2 pr-4 text-right [font-variant-numeric:tabular-nums]">
              {{ numbers.format(row.last) }} <span class="text-[var(--gr-muted-fg)]">мс</span>
            </td>
            <td class="py-2 text-right [font-variant-numeric:tabular-nums]" :class="changeClass(row.change)">
              {{ row.change > 0 ? '+' : '' }}{{ row.change }} %
            </td>
          </tr>
        </tbody>
      </table>
    </Specimen>

    <Specimen title="В строке текста" note="Ни контейнера, ни замера: высоту задаёт токен --gr-sparkline-height, ширину — обёртка.">
      <p class="flex flex-wrap items-center gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <span class="text-[var(--gr-muted-fg)]">Отклик API</span>
        <strong class="[font-variant-numeric:tabular-nums]">{{ LATENCY.at(-1) }} мс</strong>
        <span class="inline-block w-24 [--gr-sparkline-height:var(--gr-space-5)]">
          <GrSparkline :data="LATENCY" />
        </span>
        <span class="text-[var(--gr-muted-fg)]">за последний час</span>
      </p>
    </Specimen>

    <Specimen title="Один замер" note="Одно значение растягивается в ровную линию: «изменений пока нет», а не пустой холст, который читается как «нет данных».">
      <div class="flex flex-col gap-1">
        <span :class="labelClass">Заказы нового магазина</span>
        <GrSparkline :data="[42]" />
      </div>
    </Specimen>
  </div>
</template>
