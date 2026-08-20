<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrDateRangePicker` подставляется авто-импортом.

/**
 * Период одной строкой.
 *
 * Панель модели рядом нужна, чтобы было видно результат разбора целиком:
 * границы нормализуются по порядку, и на глаз это иначе не проверить.
 */
const TODAY = new Date(2026, 7, 12)

const period = ref<[Date, Date] | null>([new Date(2026, 7, 10), new Date(2026, 7, 14)])

const model = computed(() => (period.value
  ? period.value.map(date => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date))
  : null))
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrDateRangePicker
      v-model="period"
      editable
      :today="TODAY"
      :max-range="30"
      locale="ru-RU"
      aria-label="Период отчёта"
      class="w-96"
    />

    <pre v-if="model" class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ JSON.stringify(model) }}</pre>

    <p class="showcase-demo-text text-sm opacity-70">
      Строку делит не разделитель, а <strong>счёт групп цифр</strong>: их поровну на две границы.
      Поэтому <code>10.08.2026 — 14.08.2026</code>, <code>10.08.2026 - 14.08.2026</code> и
      <code>10.08.2026 14.08.2026</code> — одно и то же. Списка разделителей здесь нет намеренно:
      в канадской локали дата сама пишется через дефис, и такой список развалился бы на ней первой.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Панель идёт за набором: первая набранная граница подсвечивается началом периода — тем же
      состоянием, что и после первого клика, — вторая закрывает полосу. Сетка переходит на месяц
      набранного. Модель ждёт <strong>Enter</strong>.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Наберите границы задом наперёд — порядок нормализуется, как и при кликах. Наберите одну дату —
      ввод отклонится: одна дата не период, а достраивать вторую границу значит придумать за вас то,
      чего вы не задавали. Период длиннее <code>max-range</code> в 30 дней тоже не применится, и об
      этом скажет диктор: вы набрали всё правильно, и молчание выглядело бы как потерянный Enter.
    </p>
  </div>
</template>
