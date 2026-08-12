<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField } from '@feugene/granularity'
import {
  GrCalendar,
  GrDatePicker,
  GrDateRangePicker,
  GrDateTimePicker,
  GrRelativeTime,
  GrTimePicker,
} from '@feugene/granularity-chrono'

/**
 * Companion-пакет `@feugene/granularity-chrono` на сервере.
 *
 * Проверяются три вещи, каждая из которых видна только в связке «настоящий
 * серверный рендер + гидрация»:
 *
 *  1. **часы в пути отрисовки.** Показываемый месяц без `today`/`viewDate`
 *     выводится из часов, а сервер и браузер стоят в разных зонах. Календарь
 *     слева получает `today` и обязан гидрироваться начисто; календарь справа
 *     часы читает и помечает себя `data-allow-mismatch` — расхождение там
 *     ожидаемое и не должно ронять гейт;
 *  2. **телепорт панелей.** Пикеры монтируют панель лениво и увозят её в
 *     портал, то есть повторяют путь `GrSelect` из `TeleportPage`;
 *  3. **`useAnnouncer` в setup.** `GrCalendar` зовёт его при монтировании, а
 *     живой регион ставится в документ — на сервере документа нет.
 */
const day = ref<Date | null>(new Date(2026, 7, 12))
const time = ref<Date | null>(new Date(2026, 7, 12, 9, 30))
const moment = ref<Date | null>(new Date(2026, 7, 12, 9, 30))
const period = ref<readonly [Date, Date] | null>([new Date(2026, 7, 10), new Date(2026, 7, 14)])

const today = { y: 2026, m: 7, d: 12 }

/** Метка с `base` считается от заданного момента — на сервере и в браузере одинаково. */
const anchored = new Date(2026, 7, 12, 12, 0)
const posted = new Date(2026, 7, 11, 12, 0)
</script>

<template>
  <main>
    <GrCalendar :today="today" :view-date="today" locale="en-US" aria-label="Detached calendar" />

    <!-- Без `today` показ выводится из часов: сервер и клиент вправе разойтись. -->
    <GrCalendar locale="en-US" aria-label="Clock-anchored calendar" />

    <GrFormField label="Дата">
      <GrDatePicker v-model="day" :today="new Date(2026, 7, 12)" locale="en-US" clearable />
    </GrFormField>

    <GrFormField label="Время">
      <GrTimePicker v-model="time" :today="new Date(2026, 7, 12)" locale="en-US" />
    </GrFormField>

    <GrFormField label="Дата и время">
      <GrDateTimePicker v-model="moment" :today="new Date(2026, 7, 12)" locale="en-US" />
    </GrFormField>

    <GrFormField label="Период">
      <GrDateRangePicker v-model="period" :today="new Date(2026, 7, 12)" locale="en-US" />
    </GrFormField>

    <!-- С `base` часы не читаются: разметка детерминирована и обязана совпасть. -->
    <GrRelativeTime :value="posted" :base="anchored" locale="en-US" />

    <!-- Без `base` отсчёт идёт от часов: сервер и клиент вправе разойтись. -->
    <GrRelativeTime :value="posted" locale="en-US" />

    <!-- Панель на месте: путь `inline` не телепортирует и обязан совпасть с сервером. -->
    <GrDatePicker :model-value="day" inline :today="new Date(2026, 7, 12)" locale="en-US" />
  </main>
</template>
