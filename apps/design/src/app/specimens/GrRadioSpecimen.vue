<script setup lang="ts">
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
type Size = typeof SIZES[number]

const cardSort = ref('date')

const state = ref('selected')

const steps = reactive<Record<Size, { sort: string, period: string }>>({
  xs: { sort: 'date', period: 'week' },
  sm: { sort: 'date', period: 'week' },
  md: { sort: 'date', period: 'week' },
  lg: { sort: 'date', period: 'week' },
})

const PLANS = [
  { value: 'personal', title: 'Личный', price: '0 ₽', description: 'Один человек, 5 ГБ на файлы' },
  { value: 'team', title: 'Команда', price: '490 ₽ в месяц', description: 'До 20 человек, общие папки' },
  { value: 'company', title: 'Компания', price: 'По запросу', description: 'Вход через SSO и журнал действий' },
]
const plan = ref('team')

const VIEWS = [
  { value: 'list', label: 'Список' },
  { value: 'board', label: 'Доска' },
  { value: 'calendar', label: 'Календарь' },
]
const view = ref('board')
const quietView = ref('list')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrRadio v-model="cardSort" value="date">
      По дате
    </GrRadio>
    <GrRadio v-model="cardSort" value="name">
      По имени
    </GrRadio>
    <GrRadio v-model="cardSort" value="size">
      По размеру
    </GrRadio>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Выбранный вариант выделен и точкой, и цветом подписи; недоступный гаснет фоном, а не прозрачностью." wide>
      <div class="grid gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
        <GrRadio v-model="state" value="selected">
          Выбран
        </GrRadio>
        <GrRadio v-model="state" value="idle">
          Не выбран
        </GrRadio>
        <GrRadio v-model="state" value="invalid" invalid>
          С ошибкой
        </GrRadio>
        <GrRadio :model-value="'locked'" value="idle" disabled>
          Недоступен
        </GrRadio>
        <GrRadio :model-value="'locked'" value="locked" disabled>
          Недоступен, выбран
        </GrRadio>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Кружок с подписью и кнопка — одна шкала; у кнопки высоты GrButton: 28 · 32 · 40 · 44." wide>
      <div class="flex flex-col gap-4">
        <div v-for="size in SIZES" :key="size" class="flex items-center gap-4">
          <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
          <div class="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-2">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <GrRadio v-model="steps[size].sort" value="date" :size="size">
                По дате
              </GrRadio>
              <GrRadio v-model="steps[size].sort" value="name" :size="size">
                По имени
              </GrRadio>
            </div>
            <div class="flex items-center gap-2">
              <GrRadio v-model="steps[size].period" value="day" variant="button" :size="size">
                День
              </GrRadio>
              <GrRadio v-model="steps[size].period" value="week" variant="button" :size="size">
                Неделя
              </GrRadio>
            </div>
          </div>
        </div>
      </div>
    </Specimen>

    <Specimen title="Своя раскладка" note="Варианты по своей сетке, пояснение — слотом #description (оно же aria-describedby). Вне группы каждый вариант — своя остановка Tab." wide>
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="item in PLANS"
          :key="item.value"
          class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border bg-[var(--gr-card)] p-4"
          :class="plan === item.value ? 'border-[var(--gr-primary)]' : 'border-[var(--gr-brd)]'"
        >
          <GrRadio v-model="plan" :value="item.value">
            {{ item.title }}
            <template #description>
              {{ item.description }}
            </template>
          </GrRadio>
          <span class="ps-6 text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">
            {{ item.price }}
          </span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Кнопкой" note="variant=&quot;button&quot; — вид GrButton, роль radio. Вес и тон обоих состояний — пропами.">
      <div class="flex flex-wrap items-center gap-2">
        <GrRadio v-for="item in VIEWS" :key="item.value" v-model="view" :value="item.value" variant="button">
          {{ item.label }}
        </GrRadio>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <GrRadio
          v-for="item in VIEWS"
          :key="item.value"
          v-model="quietView"
          :value="item.value"
          variant="button"
          button-variant="ghost"
          selected-button-variant="secondary"
          selected-button-tone="neutral"
        >
          {{ item.label }}
        </GrRadio>
      </div>
    </Specimen>
  </div>
</template>
