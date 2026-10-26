<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrChipValue } from '@feugene/granularity'

import IconCheck from '~icons/lucide/check'

import { plural } from '../plural'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

interface DocFilter {
  value: string
  label: string
  count: number
  disabled?: boolean
}

const DOC_FILTERS: DocFilter[] = [
  { value: 'design', label: 'Дизайн', count: 14 },
  { value: 'dev', label: 'Разработка', count: 22 },
  { value: 'marketing', label: 'Маркетинг', count: 9 },
  { value: 'legal', label: 'Юристы', count: 4, disabled: true },
  { value: 'ops', label: 'Операции', count: 11 },
]
const docFilters = ref<GrChipValue[]>(['design'])
const foundLabel = computed(() => {
  const picked = DOC_FILTERS.filter(filter => docFilters.value.includes(filter.value))
  if (picked.length === 0)
    return 'Показаны все документы'
  const total = picked.reduce((sum, filter) => sum + filter.count, 0)
  return `Найдено: ${plural(total, ['документ', 'документа', 'документов'])}`
})

const PERIODS = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
]
const period = ref<GrChipValue | null>('week')
const periodLabel = computed(() => {
  const picked = PERIODS.find(item => item.value === period.value)
  return picked ? `Отчёт за период: ${picked.label.toLowerCase()}` : 'Отчёт за всё время'
})

const SAVED_VIEWS = [
  { value: 'mine', label: 'Мои задачи' },
  { value: 'urgent', label: 'Срочные' },
  { value: 'week', label: 'На этой неделе' },
  { value: 'unassigned', label: 'Без исполнителя' },
]
const savedViews = ref([...SAVED_VIEWS])
const activeViews = ref<GrChipValue[]>(['urgent'])

function dropView(value: GrChipValue): void {
  savedViews.value = savedViews.value.filter(view => view.value !== value)
  activeViews.value = activeViews.value.filter(item => item !== value)
}

function restoreViews(): void {
  savedViews.value = [...SAVED_VIEWS]
}

const SKILLS = [
  { value: 'vue', label: 'Vue' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'a11y', label: 'Доступность' },
  { value: 'sql', label: 'SQL' },
]
const pickedSkills = ref<GrChipValue[]>(['vue', 'a11y'])
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChipGroup v-model="docFilters" aria-label="Отделы">
      <GrChip
        v-for="filter in DOC_FILTERS"
        :key="filter.value"
        :value="filter.value"
        :label="filter.label"
        :disabled="filter.disabled"
      >
        <template v-if="docFilters.includes(filter.value)" #icon>
          <IconCheck class="h-full w-full" aria-hidden="true" />
        </template>
      </GrChip>
    </GrChipGroup>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Фильтры" note="Несколько сразу. Одна остановка Tab, внутри — стрелки; недоступный чип пропускается.">
      <GrChipGroup v-model="docFilters" aria-label="Отделы">
        <GrChip
          v-for="filter in DOC_FILTERS"
          :key="filter.value"
          :value="filter.value"
          :label="filter.label"
          :disabled="filter.disabled"
        >
          <template v-if="docFilters.includes(filter.value)" #icon>
            <IconCheck class="h-full w-full" aria-hidden="true" />
          </template>
        </GrChip>
      </GrChipGroup>
      <p aria-live="polite" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        {{ foundLabel }}
      </p>
    </Specimen>

    <Specimen title="Один выбор" note="selection single — радиогруппа. Повторный клик снимает отметку: «любой период» тоже ответ.">
      <GrChipGroup v-model="period" selection="single" aria-label="Период отчёта">
        <GrChip v-for="item in PERIODS" :key="item.value" :value="item.value" :label="item.label" />
      </GrChipGroup>
      <p aria-live="polite" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        {{ periodLabel }}
      </p>
    </Specimen>

    <Specimen title="Снимаемые" note="Подборку выбирают кликом и убирают крестиком или Delete; состав ведёт экран.">
      <GrChipGroup
        v-if="savedViews.length"
        v-model="activeViews"
        closable
        aria-label="Сохранённые подборки"
        @remove="dropView"
      >
        <GrChip v-for="view in savedViews" :key="view.value" :value="view.value" :label="view.label" />
      </GrChipGroup>
      <p v-else class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        Сохранённых подборок не осталось.
      </p>
      <div v-if="savedViews.length < SAVED_VIEWS.length">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="restoreViews">
          Вернуть подборки
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Только чтение и недоступна" note="readonly показывает выбор, но не даёт его менять; disabled гасит набор целиком.">
      <GrChipGroup v-model="pickedSkills" readonly aria-label="Навыки кандидата">
        <GrChip v-for="skill in SKILLS" :key="skill.value" :value="skill.value" :label="skill.label" />
      </GrChipGroup>
      <GrChipGroup v-model="pickedSkills" disabled aria-label="Навыки вакансии">
        <GrChip v-for="skill in SKILLS" :key="skill.value" :value="skill.value" :label="skill.label" />
      </GrChipGroup>
    </Specimen>
  </div>
</template>
