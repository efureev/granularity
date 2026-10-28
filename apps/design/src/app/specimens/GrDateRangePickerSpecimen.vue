<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { GrDateRangePickerSize, GrDateRangePreset } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// «Сегодня» задано пропом: с часами машины снимки и «Темы рядом» плыли бы каждый день.
const TODAY = new Date(2026, 9, 28)

type Range = readonly [Date, Date]

const SIZES: readonly GrDateRangePickerSize[] = ['xs', 'sm', 'md', 'lg']

const cardPeriod = ref<Range | null>([new Date(2026, 9, 12), new Date(2026, 9, 18)])
const sizePeriod = ref<Range | null>([new Date(2026, 10, 2), new Date(2026, 10, 6)])

const states = reactive({
  empty: null as Range | null,
  filled: [new Date(2026, 9, 1), new Date(2026, 9, 28)] as Range | null,
  invalid: null as Range | null,
  loading: [new Date(2026, 8, 1), new Date(2026, 8, 30)] as Range | null,
  readonly: [new Date(2026, 6, 1), new Date(2026, 8, 30)] as Range | null,
  disabled: [new Date(2026, 0, 1), new Date(2026, 2, 31)] as Range | null,
})
const invalidError = computed(() => (states.invalid ? undefined : 'Укажите даты поездки — без них не забронировать'))

const vacation = ref<Range | null>([new Date(2026, 11, 21), new Date(2026, 11, 27)])

const maintenance = ref<Range | null>([new Date(2026, 10, 7, 0, 0), new Date(2026, 10, 8, 23, 45)])

const typedPeriod = ref<Range | null>([new Date(2026, 9, 19), new Date(2026, 9, 25)])

// Периоды считаются от «сегодня» витрины, а не от часов; «Последние 90 дней» длиннее max-range и приходит выключенным.
const REPORT_PRESETS: GrDateRangePreset[] = [
  { label: 'Последние 7 дней', range: [new Date(2026, 9, 22), TODAY] },
  { label: 'Этот месяц', range: [new Date(2026, 9, 1), TODAY] },
  { label: 'Прошлый месяц', range: [new Date(2026, 8, 1), new Date(2026, 8, 30)] },
  { label: 'Последние 90 дней', range: [new Date(2026, 6, 31), TODAY] },
]
const report = ref<Range | null>([new Date(2026, 9, 12), new Date(2026, 9, 18)])

const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const reportDays = computed(() => (report.value
  ? Math.round((report.value[1].getTime() - report.value[0].getTime()) / 86_400_000) + 1
  : 0))
const reportText = computed(() => (report.value
  ? `${dayFormat.format(report.value[0])} — ${dayFormat.format(report.value[1])}`
  : 'Период не выбран'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Период отчёта">
      <GrDateRangePicker v-model="cardPeriod" :today="TODAY" clearable />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Период — одно поле и одно значение-пара; подпись, ошибка и недоступность приходят из GrFormField, как у любого контрола ядра." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Период">
            <GrDateRangePicker v-model="states.empty" :today="TODAY" placeholder="С — по" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Период выписки" hint="Крестик снимает обе границы">
            <GrDateRangePicker v-model="states.filled" :today="TODAY" clearable />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Даты поездки" :error="invalidError" required>
            <GrDateRangePicker v-model="states.invalid" :today="TODAY" :min="TODAY" placeholder="Заезд — выезд" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">фоновая работа</span>
          <GrFormField label="Период сверки" hint="Считаем остатки">
            <GrDateRangePicker v-model="states.loading" :today="TODAY" loading />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Срок договора" hint="Меняет юрист" readonly>
            <GrDateRangePicker v-model="states.readonly" :today="TODAY" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Первый квартал" hint="Период закрыт" disabled>
            <GrDateRangePicker v-model="states.disabled" :today="TODAY" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Высота и кегль поля — по шкале контролов; две даты помещаются уже на xs.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrDateRangePicker v-model="sizePeriod" :today="TODAY" :size="size" :aria-label="`Период, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Длина периода" note="min-range и max-range считают дни с обеими границами; недопустимый конец не выбирается, но и не сбрасывает начало.">
      <GrFormField label="Отпуск" hint="От 3 до 14 дней, не раньше сегодня">
        <GrDateRangePicker v-model="vacation" :today="TODAY" :min="TODAY" :min-range="3" :max-range="14" clearable />
      </GrFormField>
    </Specimen>

    <Specimen title="С точностью до минут" note="enable-time добавляет колонки времени обеим границам; свежий период получает сутки целиком — 00:00 и конец по сетке шага.">
      <GrFormField label="Окно обслуживания" hint="Шаг — 15 минут">
        <GrDateRangePicker v-model="maintenance" enable-time :minute-step="15" :today="TODAY" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ручной ввод" note="Строку делит не разделитель, а счёт групп цифр: «19.10.2026 — 25.10.2026» и «19.10.2026 25.10.2026» — одно и то же.">
      <GrFormField label="Период отчёта" hint="ДД.ММ.ГГГГ — ДД.ММ.ГГГГ, затем Enter">
        <GrDateRangePicker v-model="typedPeriod" editable :today="TODAY" :max-range="31" locale="ru-RU" clearable />
      </GrFormField>
    </Specimen>

    <Specimen title="На месте, с готовыми периодами" note="Шорткат выставляет обе границы и проходит те же правила, что клик: период длиннее max-range приходит выключенным; полоса между краями — свой токен." wide>
      <div class="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
          <GrDateRangePicker
            v-model="report"
            inline
            :today="TODAY"
            :max="TODAY"
            :max-range="31"
            :presets="REPORT_PRESETS"
            aria-label="Период отчёта по продажам"
          />
        </div>
        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Продажи за период
          </span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            {{ reportText }}
          </span>
          <span v-if="report" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Дней в отчёте: {{ reportDays }}. Будущие дни выключены, потолок — 31 день.
          </span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
