<script setup lang="ts">
import type { NameWidth } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// «Сейчас» задано пропом base: с ним метка не читает часы и не тикает — снимки и «Темы рядом» стабильны.
const NOW = new Date(2026, 9, 28, 12, 0)

function ago(ms: number): Date {
  return new Date(NOW.getTime() - ms)
}

const PREVIEW_EDITED = ago(3 * 60_000)
const PREVIEW_DUE = new Date(2026, 9, 30, 12, 0)

const SCALE = [
  { label: 'секунды', value: ago(8_000) },
  { label: 'минуты', value: ago(12 * 60_000) },
  { label: 'часы', value: ago(4 * 3_600_000) },
  { label: 'вчера', value: new Date(2026, 9, 27, 9, 0) },
  { label: 'недели', value: new Date(2026, 9, 14, 12, 0) },
  { label: 'месяцы', value: new Date(2026, 5, 28, 12, 0) },
  { label: 'годы', value: new Date(2024, 9, 28, 12, 0) },
  { label: 'будущее', value: new Date(2026, 9, 30, 12, 0) },
]

const WIDTHS: readonly NameWidth[] = ['long', 'short', 'narrow']
const THREE_MONTHS_AGO = new Date(2026, 6, 28, 12, 0)
// Дальше суток: ближе разрыв меряется часами, и «вчера» не случилось бы.
const YESTERDAY = new Date(2026, 9, 27, 10, 0)

const CUTOFF_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const CUTOFF_ROWS = [
  new Date(2026, 9, 28, 9, 30),
  new Date(2026, 9, 21, 12, 0),
  new Date(2026, 8, 2, 12, 0),
  new Date(2025, 10, 20, 12, 0),
]

// Значение без времени — день в календаре: isoDate мерит его только календарём от дня base.
const DUE_DATES = ['2026-10-28', '2026-10-29', '2026-10-27', '2026-11-10']

const FEED = [
  { who: 'Анна Соколова', action: 'согласовала смету «Офис на Лесной»', at: ago(40_000) },
  { who: 'Иван Петров', action: 'добавил три фото к акту приёмки', at: ago(27 * 60_000) },
  { who: 'Мария Смирнова', action: 'перенесла сдачу этапа на 6 ноября', at: ago(5 * 3_600_000) },
  { who: 'Олег Кузнецов', action: 'закрыл заявку № 1182', at: new Date(2026, 9, 26, 16, 10) },
  { who: 'Елена Волкова', action: 'создала проект', at: new Date(2026, 7, 3, 10, 0) },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
    <div class="flex items-baseline justify-between gap-6">
      <span class="text-[var(--gr-muted-fg)]">Смета изменена</span>
      <GrRelativeTime :value="PREVIEW_EDITED" :base="NOW" />
    </div>
    <div class="flex items-baseline justify-between gap-6">
      <span class="text-[var(--gr-muted-fg)]">Сдача этапа</span>
      <GrRelativeTime :value="PREVIEW_DUE" :base="NOW" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Шкала" note="До суток разрыв меряется прошедшим временем, от суток — календарём: месяц остаётся месяцем и в феврале, и в июле. Наведение показывает точную дату.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="row in SCALE" :key="row.label">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ row.label }}</code>
          <GrRelativeTime :value="row.value" :base="NOW" />
          <GrRelativeTime :value="row.value" :base="NOW" width="short" class="text-[var(--gr-muted-fg)]" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Длина и числа" note="Строку и склонение строит Intl — своих строк у компонента нет; narrow в русской локали он сжимает до «-3 мес.». numeric=&quot;auto&quot; даёт «вчера», always — «1 день назад».">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="width in WIDTHS" :key="width">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ width }}</code>
          <GrRelativeTime :value="THREE_MONTHS_AGO" :base="NOW" :width="width" />
        </template>
        <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">numeric="auto"</code>
        <GrRelativeTime :value="YESTERDAY" :base="NOW" numeric="auto" />
        <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">numeric="always"</code>
        <GrRelativeTime :value="YESTERDAY" :base="NOW" numeric="always" />
      </div>
    </Specimen>

    <Specimen title="Порог абсолютной даты" note="cutoff в 30 дней: дальше относительная строка перестаёт помогать, и метка сама переходит на дату — вид задаёт format опциями Intl.">
      <div class="flex flex-col gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <GrRelativeTime
          v-for="date in CUTOFF_ROWS"
          :key="date.getTime()"
          :value="date"
          :base="NOW"
          :cutoff="30"
          :format="CUTOFF_FORMAT"
        />
      </div>
    </Specimen>

    <Specimen title="Дата без времени" note="Срок без часа — это день, а не полночь: «завтра», а не «через 12 часов». В datetime уходит сама дата, а не момент в UTC.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="due in DUE_DATES" :key="due">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ due }}</code>
          <GrRelativeTime :value="due" value-adapter="isoDate" :base="NOW" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Лента событий" note="Метка наследует кегль и цвет текста вокруг и не рвётся посреди «27 минут назад»; слот отдаёт text, absolute и datetime для своей разметки." wide>
      <ul class="flex flex-col divide-y divide-[var(--gr-brd)] rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)]">
        <li
          v-for="event in FEED"
          :key="event.action"
          class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
        >
          <span class="min-w-0 text-[var(--gr-fg)]">
            <span class="font-600">{{ event.who }}</span> {{ event.action }}
          </span>
          <GrRelativeTime :value="event.at" :base="NOW" :cutoff="30" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            <template #default="{ text, absolute }">
              {{ text }}<span v-if="text !== absolute" class="sr-only">, {{ absolute }}</span>
            </template>
          </GrRelativeTime>
        </li>
      </ul>
    </Specimen>
  </div>
</template>
