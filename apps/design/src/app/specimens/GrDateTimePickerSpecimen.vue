<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import type { GrDateTimePickerSize } from '@feugene/granularity-chrono'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

// «Сегодня» задано пропом: с часами машины снимки и «Темы рядом» плыли бы каждый день.
const TODAY = new Date(2026, 9, 28)

const SIZES: readonly GrDateTimePickerSize[] = ['xs', 'sm', 'md', 'lg']

const cardMeeting = ref<Date | null>(new Date(2026, 9, 29, 14, 30))
const sizeMeeting = ref<Date | null>(new Date(2026, 9, 30, 10, 0))

const states = reactive({
  empty: null as Date | null,
  filled: new Date(2026, 10, 2, 9, 30) as Date | null,
  invalid: null as Date | null,
  loading: new Date(2026, 10, 3, 16, 0) as Date | null,
  readonly: new Date(2026, 9, 14, 11, 0) as Date | null,
  disabled: new Date(2026, 9, 1, 18, 0) as Date | null,
})
const invalidError = computed(() => (states.invalid ? undefined : 'Без начала вебинар не опубликовать'))

const precise = ref<Date | null>(new Date(2026, 9, 28, 15, 30, 45))
const twelveHour = ref<Date | null>(new Date(2026, 9, 28, 15, 30))

const typedRu = ref<Date | null>(new Date(2026, 10, 2, 9, 30))
const typedUs = ref<Date | null>(new Date(2026, 10, 2, 9, 30))

const publishMin = new Date(2026, 9, 28, 12, 0)
const publishAt = ref<Date | null>(new Date(2026, 9, 29, 10, 0))
const publishText = computed(() => (publishAt.value
  ? new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(publishAt.value)
  : 'Время не выбрано'))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Начало встречи">
      <GrDateTimePicker v-model="cardMeeting" :today="TODAY" :minute-step="15" clearable />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Момент, а не день: дата без времени значила бы полночь. Подпись, ошибка и недоступность — из GrFormField." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Напоминание">
            <GrDateTimePicker v-model="states.empty" :today="TODAY" placeholder="Когда напомнить" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Начало встречи" hint="Крестик снимает значение">
            <GrDateTimePicker v-model="states.filled" :today="TODAY" :minute-step="15" clearable />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Начало вебинара" :error="invalidError" required>
            <GrDateTimePicker v-model="states.invalid" :today="TODAY" :min="TODAY" :minute-step="15" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">фоновая работа</span>
          <GrFormField label="Созвон с клиентом" hint="Проверяем календарь участников">
            <GrDateTimePicker v-model="states.loading" :today="TODAY" loading />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Время подписания" hint="Зафиксировано системой" readonly>
            <GrDateTimePicker v-model="states.readonly" :today="TODAY" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Закрытие сделки" hint="Сделка в архиве" disabled>
            <GrDateTimePicker v-model="states.disabled" :today="TODAY" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Высота и кегль поля — по шкале контролов; сетка и колонки в панели берут ту же ступень.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrDateTimePicker v-model="sizeMeeting" :today="TODAY" :size="size" :aria-label="`Начало встречи, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Секунды и 12 часов" note="enable-seconds добавляет третью колонку; 12 или 24 часа приходят из локали, use12-hours её перебивает.">
      <GrFormField label="Отметка в логе" hint="Шаг секунд — 15">
        <GrDateTimePicker v-model="precise" :today="TODAY" enable-seconds :second-step="15" />
      </GrFormField>
      <GrFormField label="Call start · en-US">
        <GrDateTimePicker v-model="twelveHour" :today="TODAY" locale="en-US" use12-hours :minute-step="15" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ручной ввод" note="Одна строка задаёт и дату, и время; где что — знает локаль. Набранная дата без времени время не сбрасывает.">
      <GrFormField label="Начало · ru-RU" hint="ДД.ММ.ГГГГ, ЧЧ:ММ">
        <GrDateTimePicker v-model="typedRu" editable :today="TODAY" locale="ru-RU" />
      </GrFormField>
      <GrFormField label="Start · en-US" hint="MM/DD/YYYY, HH:MM">
        <GrDateTimePicker v-model="typedUs" editable :today="TODAY" locale="en-US" />
      </GrFormField>
    </Specimen>

    <Specimen title="На месте, с подтверждением" note="auto-apply=&quot;false&quot;: день и время правят черновик, модель меняет «Применить» — выбор из нескольких шагов не уезжает после первого клика." wide>
      <div class="grid items-start gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
          <GrDateTimePicker
            v-model="publishAt"
            inline
            :auto-apply="false"
            :today="TODAY"
            :min="publishMin"
            :minute-step="15"
            aria-label="Время публикации"
          />
        </div>
        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            Отложенная публикация
          </span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            {{ publishText }}
          </span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Пост выйдет не раньше сегодняшних 12:00 — прошедшие дни и часы выключены.
          </span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
