<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { GrDatePickerSize, GrDatePreset } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// «Сегодня» задано пропом: с часами машины снимки и «Темы рядом» плыли бы каждый день.
const TODAY = new Date(2026, 9, 28)

const SIZES: readonly GrDatePickerSize[] = ['xs', 'sm', 'md', 'lg']

const cardDelivery = ref<Date | null>(new Date(2026, 9, 30))
const sizeDate = ref<Date | null>(new Date(2026, 10, 3))

const states = reactive({
  empty: null as Date | null,
  filled: new Date(2026, 10, 3) as Date | null,
  invalid: new Date(2026, 9, 20) as Date | null,
  loading: new Date(2026, 10, 12) as Date | null,
  readonly: new Date(2026, 9, 1) as Date | null,
  disabled: new Date(2026, 8, 15) as Date | null,
})
const invalidError = computed(() => (states.invalid && states.invalid < TODAY
  ? 'Дата уже прошла — выберите не раньше сегодня'
  : undefined))

const typedRu = ref<string | null>('2026-11-03')
const typedUs = ref<string | null>('2026-11-03')

const periods = reactive({
  week: new Date(2026, 9, 26) as Date | null,
  month: new Date(2026, 10, 1) as Date | null,
  quarter: new Date(2026, 9, 1) as Date | null,
  year: new Date(2027, 0, 1) as Date | null,
})

const lessons = ref<Date | readonly Date[] | null>([
  new Date(2026, 9, 29),
  new Date(2026, 10, 3),
  new Date(2026, 10, 5),
  new Date(2026, 10, 10),
  new Date(2026, 10, 12),
])

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6
}

// Готовые даты — от «сегодня» витрины, а не от часов: «В субботу» выходной и приходит выключенной, как её ячейка.
const DELIVERY_PRESETS: GrDatePreset[] = [
  { label: 'Завтра', date: new Date(2026, 9, 29) },
  { label: 'В субботу', date: new Date(2026, 9, 31) },
  { label: 'Через неделю', date: new Date(2026, 10, 4) },
]
const deliveryMax = new Date(2026, 10, 27)
const delivery = ref<Date | null>(new Date(2026, 9, 30))

const deliveryText = computed(() => (delivery.value
  ? new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(delivery.value)
  : 'Дата не выбрана'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Дата доставки">
      <GrDatePicker v-model="cardDelivery" :today="TODAY" clearable />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Поле — форм-контрол ядра: подпись, ошибка, обязательность и недоступность приходят из GrFormField; readonly открывает панель, но выбор не меняет." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Дата поставки">
            <GrDatePicker v-model="states.empty" :today="TODAY" placeholder="Выберите дату" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Дата поставки" hint="Крестик снимает значение">
            <GrDatePicker v-model="states.filled" :today="TODAY" clearable />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Дата выезда" :error="invalidError" required>
            <GrDatePicker v-model="states.invalid" :today="TODAY" :min="TODAY" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">фоновая работа</span>
          <GrFormField label="Дата отгрузки" hint="Сверяем со складом">
            <GrDatePicker v-model="states.loading" :today="TODAY" loading />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Дата договора" hint="Меняет юрист" readonly>
            <GrDatePicker v-model="states.readonly" :today="TODAY" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Дата закрытия" hint="Период уже закрыт" disabled>
            <GrDatePicker v-model="states.disabled" :today="TODAY" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Высота и кегль поля — по шкале контролов; панель берёт ту же ступень.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrDatePicker v-model="sizeDate" :today="TODAY" :size="size" :aria-label="`Дата, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Ручной ввод" note="editable показывает дату цифрами — поле обязано принять обратно то, что показало; порядок частей знает локаль, а не маска.">
      <GrFormField label="Дата встречи · ru-RU" hint="ДД.ММ.ГГГГ">
        <GrDatePicker v-model="typedRu" value-adapter="isoDate" editable :today="TODAY" locale="ru-RU" clearable />
      </GrFormField>
      <GrFormField label="Meeting date · en-US" hint="MM/DD/YYYY">
        <GrDatePicker v-model="typedUs" value-adapter="isoDate" editable :today="TODAY" locale="en-US" clearable />
      </GrFormField>
    </Specimen>

    <Specimen title="Неделя, месяц, квартал, год" note="mode меняет панель и вид значения в поле; в модели по-прежнему одна дата — начало периода.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Неделя отчёта">
          <GrDatePicker v-model="periods.week" mode="week" :today="TODAY" />
        </GrFormField>
        <GrFormField label="Месяц закрытия">
          <GrDatePicker v-model="periods.month" mode="month" :today="TODAY" />
        </GrFormField>
        <GrFormField label="Квартал">
          <GrDatePicker v-model="periods.quarter" mode="quarter" :today="TODAY" />
        </GrFormField>
        <GrFormField label="Финансовый год">
          <GrDatePicker v-model="periods.year" mode="year" :today="TODAY" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Набор дат" note="multiple собирает множество, а не отрезок: в поле первые три даты и остаток числом, панель после выбора не закрывается.">
      <GrFormField label="Даты занятий" hint="Клик по выбранной дате в панели снимает её">
        <GrDatePicker v-model="lessons" multiple :today="TODAY" placeholder="Выберите занятия" />
      </GrFormField>
    </Specimen>

    <Specimen title="На месте, с готовыми датами" note="inline рисует панель без поля, но модель и адаптер остаются пикеровскими; шорткат проверяет min, max и disabledDates сам — выходной приходит выключенным." wide>
      <div class="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
          <GrDatePicker
            v-model="delivery"
            inline
            :today="TODAY"
            :min="TODAY"
            :max="deliveryMax"
            :disabled-dates="isWeekend"
            :presets="DELIVERY_PRESETS"
            aria-label="Дата доставки"
          />
        </div>
        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Доставка заказа № 4817
          </span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            {{ deliveryText }}
          </span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Курьер возит по будням, запись — на месяц вперёд.
          </span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
