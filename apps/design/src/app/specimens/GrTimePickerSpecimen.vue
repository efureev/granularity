<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { GrTimePickerSize } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// День, к которому пикер пристёгивает время: модель — полноценный Date, и без today дату взял бы с часов машины.
const TODAY = new Date(2026, 9, 28)

function at(hours: number, minutes: number, seconds = 0): Date {
  return new Date(2026, 9, 28, hours, minutes, seconds)
}

const SIZES: readonly GrTimePickerSize[] = ['xs', 'sm', 'md', 'lg']

const cardShift = ref<Date | null>(at(9, 30))
const sizeTime = ref<Date | null>(at(14, 0))

const states = reactive({
  empty: null as Date | null,
  filled: at(9, 0) as Date | null,
  invalid: at(7, 30) as Date | null,
  loading: at(18, 30) as Date | null,
  readonly: at(10, 0) as Date | null,
  disabled: at(22, 0) as Date | null,
})
const workdayStart = at(9, 0)
const workdayEnd = at(18, 0)
const invalidError = computed(() => (states.invalid && (states.invalid < workdayStart || states.invalid > workdayEnd)
  ? 'Встречи — только в рабочие часы, с 09:00 до 18:00'
  : undefined))

const quarterStep = ref<Date | null>(at(14, 45))
const withSeconds = ref<Date | null>(at(15, 30, 45))
const twelveHour = ref<Date | null>(at(15, 30))

const typedRu = ref<Date | null>(at(8, 15))
const typedUs = ref<Date | null>(at(20, 15))

const visitFrom = at(11, 30)
const visitTo = at(17, 30)
const visit = ref<Date | null>(at(14, 30))
const QUICK_SLOTS = [
  { label: 'Ближайшее', time: at(11, 30) },
  { label: 'После обеда', time: at(15, 0) },
  { label: 'Вечером', time: at(18, 30) },
]
const visitText = computed(() => (visit.value
  ? new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(visit.value)
  : 'не выбрано'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Начало смены">
      <GrTimePicker v-model="cardShift" :today="TODAY" :minute-step="15" clearable />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Время без даты: подпись, ошибка и недоступность — из GrFormField; только чтение открывает колонки, но выбор не меняет." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Напомнить в">
            <GrTimePicker v-model="states.empty" :today="TODAY" placeholder="Выберите время" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Начало смены" hint="Крестик снимает значение">
            <GrTimePicker v-model="states.filled" :today="TODAY" :minute-step="15" clearable />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Время встречи" :error="invalidError" required>
            <GrTimePicker v-model="states.invalid" :today="TODAY" :minute-step="15" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">фоновая работа</span>
          <GrFormField label="Окно доставки" hint="Сверяем с маршрутом курьера">
            <GrTimePicker v-model="states.loading" :today="TODAY" loading />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Открытие офиса" hint="Задаёт администратор" readonly>
            <GrTimePicker v-model="states.readonly" :today="TODAY" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Ночная выгрузка" hint="Расписание отключено" disabled>
            <GrTimePicker v-model="states.disabled" :today="TODAY" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Высота и кегль поля — по шкале контролов; колонки в панели берут ту же ступень.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrTimePicker v-model="sizeTime" :today="TODAY" :size="size" :aria-label="`Время, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Шаг, секунды, 12 часов" note="minute-step строит колонку с шагом — 14:07 там, где приём по четвертям часа, не набрать; 12 или 24 часа приходят из локали, use12-hours её перебивает.">
      <GrFormField label="Приём" hint="Шаг — 15 минут">
        <GrTimePicker v-model="quarterStep" :today="TODAY" :minute-step="15" />
      </GrFormField>
      <GrFormField label="Отметка в логе" hint="Третья колонка — секунды, шаг 15">
        <GrTimePicker v-model="withSeconds" :today="TODAY" enable-seconds :second-step="15" />
      </GrFormField>
      <GrFormField label="Pickup · en-US">
        <GrTimePicker v-model="twelveHour" :today="TODAY" locale="en-US" use12-hours :minute-step="15" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ручной ввод" note="editable принимает время с клавиатуры; разбор идёт по локали, включая 12-часовой вид там, где он принят.">
      <GrFormField label="Будильник · ru-RU" hint="ЧЧ:ММ">
        <GrTimePicker v-model="typedRu" editable :today="TODAY" locale="ru-RU" />
      </GrFormField>
      <GrFormField label="Alarm · en-US" hint="HH:MM AM/PM">
        <GrTimePicker v-model="typedUs" editable :today="TODAY" locale="en-US" />
      </GrFormField>
    </Specimen>

    <Specimen title="На месте, с подвалом" note="Колонки сразу стоят на выбранном значении и двигаются сами, не трогая страницу; подвал получает select и canSelect — слот за границей приёма приходит выключенным." wide>
      <div class="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
          <GrTimePicker
            v-model="visit"
            inline
            :today="TODAY"
            :min="visitFrom"
            :max="visitTo"
            :minute-step="30"
            :use12-hours="false"
            aria-label="Время приёма"
          >
            <template #footer="{ select, canSelect }">
              <GrButton
                v-for="quick in QUICK_SLOTS"
                :key="quick.label"
                size="sm"
                variant="ghost"
                :disabled="!canSelect(quick.time)"
                @click="select(quick.time)"
              >
                {{ quick.label }}
              </GrButton>
            </template>
          </GrTimePicker>
        </div>
        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Консультация, 28 октября
          </span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Приём: {{ visitText }}
          </span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Врач принимает с 11:30 до 17:30, запись по получасам.
          </span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
