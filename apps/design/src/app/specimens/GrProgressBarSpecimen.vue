<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrProgressBarSize, GrSegmentedValue } from '@feugene/granularity'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const CONTACTS = 1240
const numbers = new Intl.NumberFormat('ru-RU')

const importOptions = [0, 35, 70, 100].map(step => ({ label: `${step}\u00A0%`, value: step }))
const importStep = ref<GrSegmentedValue>(35)
const imported = computed(() => Number(importStep.value))
const importDone = computed(() => imported.value === 100)

const importTitle = computed(() => {
  if (importDone.value)
    return 'Контакты импортированы'
  return imported.value === 0 ? 'Готовим импорт' : 'Импортируем контакты'
})

const importFoot = computed(() => {
  if (importDone.value)
    return `${numbers.format(CONTACTS)} контактов · 3 дубля пропущены`
  if (imported.value === 0)
    return 'Проверяем файл'
  return `${numbers.format(Math.round(imported.value / 100 * CONTACTS))} из ${numbers.format(CONTACTS)} контактов`
})

const barSizes: { size: GrProgressBarSize, value: number, label: string }[] = [
  { size: 'xs', value: 40, label: 'Переход на страницу отчёта' },
  { size: 'sm', value: 55, label: 'Импорт строки таблицы' },
  { size: 'md', value: 70, label: 'Загрузка вложения' },
  { size: 'lg', value: 85, label: 'Сборка проекта' },
]

const DISK_GB = 512
const gigabytes = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

function diskUsage(percent: number): string {
  return `${gigabytes.format(percent / 100 * DISK_GB)} из ${DISK_GB} ГБ`
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-1.5">
    <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
      Импортируем контакты
    </p>
    <GrProgressBar :value="35" show-value aria-label="Импорт контактов" />
    <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      434 из 1 240 контактов
    </p>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Значение и подпись" note="showValue печатает проценты; на завершении — тон success.">
      <GrSegmented v-model="importStep" :options="importOptions" size="sm" aria-label="Ход импорта" class="self-start" />
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          {{ importTitle }}
        </p>
        <GrProgressBar :value="imported" :tone="importDone ? 'success' : 'primary'" show-value aria-label="Импорт контактов" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ importFoot }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Буфер" note="Слой позади заливки: загружено с запасом, проиграно меньше.">
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Загружаем выгрузка.csv
        </p>
        <GrProgressBar :value="64" :buffer="82" show-value aria-label="Загрузка файла выгрузка.csv" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          12,8 из 20 МБ · осталось около минуты
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Запись созвона
        </p>
        <GrProgressBar :value="38" :buffer="61" aria-label="Воспроизведение записи созвона" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          14:08 из 37:30
        </p>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs — под шапкой при переходе, lg — главный процесс экрана.">
      <div class="grid grid-cols-[2rem_1fr] items-center gap-x-4 gap-y-3.5">
        <template v-for="row in barSizes" :key="row.size">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ row.size }}</code>
          <GrProgressBar :value="row.value" :size="row.size" :aria-label="row.label" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Без значения, готово и сбой" note="indeterminate бежит и не объявляет значения — конец ещё неизвестен.">
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Ищем дубликаты
        </p>
        <GrProgressBar :value="0" indeterminate aria-label="Поиск дубликатов" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Сверяем контакты с адресной книгой
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Отчёт выгружен
        </p>
        <GrProgressBar :value="100" tone="success" show-value aria-label="Выгрузка отчёта" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Отчёт за III квартал · 2,4 МБ
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Загрузка прервана
        </p>
        <GrProgressBar :value="62" tone="danger" show-value aria-label="Загрузка архива" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Связь потеряна — повторим, когда сеть вернётся
        </p>
      </div>
    </Specimen>

    <Specimen title="Свой формат" note="formatValue пишет подпись словами и отдаёт её же в aria-valuetext: диктор слышит «328 из 512 ГБ», а не голое число.">
      <div class="flex flex-col gap-1.5">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Диск проекта
        </p>
        <GrProgressBar :value="64" tone="warning" show-value :format-value="diskUsage" aria-label="Занято на диске проекта" />
      </div>
    </Specimen>

    <Specimen title="Без рамки" note="borderless — внутри карточки: рамка трека рядом с рамкой карточки становится второй.">
      <div class="flex flex-col gap-1.5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <p class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
          Онбординг команды
        </p>
        <GrProgressBar :value="60" borderless show-value aria-label="Онбординг команды" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          3 из 5 шагов пройдены
        </p>
      </div>
    </Specimen>
  </div>
</template>
