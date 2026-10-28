<script setup lang="ts">
import type { DurationUnit, NameWidth } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// «Сейчас» задано пропом base: с ним метка не читает часы и не тикает — снимки и «Темы рядом» стабильны.
const NOW = new Date(2026, 9, 28, 12, 41, 30)

const MEETING: readonly [Date, Date] = [new Date(2026, 9, 28, 9, 0), new Date(2026, 9, 28, 11, 30)]
const STARTED = new Date(2026, 9, 28, 10, 14, 0)

const FORMS = [
  { title: 'число секунд', label: 'Длительность звонка', value: 9000 },
  { title: 'пара дат', label: 'Совещание', value: MEETING },
  { title: 'одна дата + base', label: 'Инцидент открыт', value: STARTED },
] as const

// 2 сут 3 ч 25 мин 40 с.
const LONG_RUN = 185_140

const MAX_UNITS = [1, 2, 3, 4] as const

const CEILING_ROWS = [
  { label: 'Сборка заняла', value: 10_770, hint: '2 ч 59 мин 30 с' },
  { label: 'Ровно два часа', value: 7200, hint: '7200 с' },
  { label: 'Простоя не было', value: 0, hint: '0 с' },
]

const WIDTHS: readonly NameWidth[] = ['long', 'short', 'narrow']

const UNIT_BOUNDS: { title: string, value: number, largestUnit?: DurationUnit, smallestUnit?: DurationUnit }[] = [
  { title: 'по умолчанию', value: LONG_RUN },
  { title: 'largest-unit="hour"', value: LONG_RUN, largestUnit: 'hour' },
  { title: 'smallest-unit="minute"', value: 3725, smallestUnit: 'minute' },
]

const BUILDS = [
  { branch: 'main', title: 'Новый расчёт доставки', seconds: 412 },
  { branch: 'release/3.6', title: 'Сборка релиза ядра', seconds: 1388 },
  { branch: 'feature/chrono', title: 'Колонки времени в диапазоне', seconds: 95 },
  { branch: 'main', title: 'Ночные e2e витрины', seconds: 5470 },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
    <div class="flex items-baseline justify-between gap-6">
      <span class="text-[var(--gr-muted-fg)]">Длительность звонка</span>
      <GrDuration :value="9000" />
    </div>
    <div class="flex items-baseline justify-between gap-6">
      <span class="text-[var(--gr-muted-fg)]">Сборка заняла</span>
      <GrDuration :value="10770" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Три формы значения" note="Число — готовая длина, пара дат — промежуток, одна дата — время до «сейчас». Здесь «сейчас» задано base; без него третья метка тикает сама.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="form in FORMS" :key="form.title">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ form.title }}</code>
          <span class="text-[var(--gr-muted-fg)]">{{ form.label }}</span>
          <GrDuration :value="form.value" :base="NOW" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Потолок, а не квота" note="max-units ограничивает число единиц сверху и ничего не добирает; младшее отбрасывается, а не округляется — показ не выше прошедшего. Ноль печатается: пусто читалось бы как «нет данных».">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="units in MAX_UNITS" :key="units">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">max-units="{{ units }}"</code>
          <GrDuration :value="LONG_RUN" :max-units="units" />
        </template>
      </div>
      <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 border-t border-[var(--gr-brd)] pt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="row in CEILING_ROWS" :key="row.label">
          <span class="text-[var(--gr-muted-fg)]">{{ row.label }}</span>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ row.hint }}</code>
          <GrDuration :value="row.value" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Длина имён" note="Имена единиц и склонение даёт Intl — своих строк у компонента нет; short — по умолчанию.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="width in WIDTHS" :key="width">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ width }}</code>
          <GrDuration :value="LONG_RUN" :width="width" :max-units="3" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Крупная и мелкая единица" note="Крупнее суток единиц нет: месяц и год календарные, из секунд их не вывести. largest-unit копит остаток в своей единице, smallest-unit не спускается ниже.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="bound in UNIT_BOUNDS" :key="bound.title">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ bound.title }}</code>
          <GrDuration :value="bound.value" :largest-unit="bound.largestUnit" :smallest-unit="bound.smallestUnit" />
        </template>
      </div>
    </Specimen>

    <Specimen title="В строке журнала" note="Метка наследует кегль и цвет текста вокруг и не рвётся посреди значения; слот отдаёт text, datetime и seconds для своей разметки — здесь точная длина ISO 8601 рядом." wide>
      <ul class="flex flex-col divide-y divide-[var(--gr-brd)] rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)]">
        <li
          v-for="build in BUILDS"
          :key="build.title"
          class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
        >
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="text-[var(--gr-fg)]">{{ build.title }}</span>
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ build.branch }}</code>
          </span>
          <GrDuration :value="build.seconds">
            <template #default="{ text, datetime }">
              <span class="font-600 text-[var(--gr-fg)]">{{ text }}</span>
              <code class="ml-2 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ datetime }}</code>
            </template>
          </GrDuration>
        </li>
      </ul>
    </Specimen>
  </div>
</template>
