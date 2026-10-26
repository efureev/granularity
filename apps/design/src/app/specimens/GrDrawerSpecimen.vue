<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { GrCheckboxGroupOption, GrDrawerSize } from '@feugene/granularity'
import IconDownload from '~icons/lucide/download'
import IconFileSpreadsheet from '~icons/lucide/file-spreadsheet'
import IconFileText from '~icons/lucide/file-text'
import IconListFilter from '~icons/lucide/list-filter'
import IconMenu from '~icons/lucide/menu'
import IconUpload from '~icons/lucide/upload'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const statusOptions: GrCheckboxGroupOption[] = [
  { value: 'work', label: 'В работе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Готово' },
]
const statusCounts: Record<string, number> = { work: 11, review: 4, done: 7 }
const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

const filtersOpen = ref(false)
const appliedStatuses = ref(['work', 'done'])
const appliedOwner = ref('')
const draftStatuses = ref<string[]>([])
const draftOwner = ref('')

function countFor(statuses: string[]): number {
  return statuses.reduce((sum, value) => sum + (statusCounts[value] ?? 0), 0)
}

const draftCount = computed(() => countFor(draftStatuses.value))
const filterSummary = computed(() => {
  const labels = statusOptions.filter(option => appliedStatuses.value.includes(option.value)).map(option => option.label)
  const statuses = labels.length ? labels.join(', ') : 'все статусы'
  const owner = appliedOwner.value.trim()
  return owner ? `${statuses} · ответственный — ${owner}` : statuses
})

function openFilters(): void {
  draftStatuses.value = [...appliedStatuses.value]
  draftOwner.value = appliedOwner.value
  filtersOpen.value = true
}

function resetFilters(): void {
  draftStatuses.value = []
  draftOwner.value = ''
}

function applyFilters(): void {
  appliedStatuses.value = [...draftStatuses.value]
  appliedOwner.value = draftOwner.value
  filtersOpen.value = false
}

const exportOpen = ref(false)
const exportFormats = [
  { key: 'xlsx', label: 'Таблица Excel', note: 'с формулами и фильтрами', icon: IconFileSpreadsheet },
  { key: 'csv', label: 'CSV', note: 'для импорта в другие системы', icon: IconFileText },
  { key: 'pdf', label: 'PDF', note: 'для печати и отправки', icon: IconDownload },
]
const lastExport = ref('')

function exportAs(label: string): void {
  lastExport.value = label
  exportOpen.value = false
}

const navOpen = ref(false)
const navQuery = ref('')
const sections = ['Входящие', 'Мои задачи', 'Календарь', 'Отчёты', 'Документы', 'Команда', 'Настройки']
const visibleSections = computed(() => {
  const query = navQuery.value.trim().toLowerCase()
  return query ? sections.filter(section => section.toLowerCase().includes(query)) : sections
})
const currentSection = ref('Мои задачи')

function goTo(section: string): void {
  currentSection.value = section
  navOpen.value = false
}

interface Task {
  id: string
  title: string
  owner: string
  due: string
}

const tasks: Task[] = [
  { id: 'T-104', title: 'Собрать отзывы пилотных клиентов', owner: 'Анна Соколова', due: 'до пятницы' },
  { id: 'T-108', title: 'Обновить тарифную сетку', owner: 'Иван Петров', due: 'до 30 октября' },
  { id: 'T-112', title: 'Подготовить вебинар для партнёров', owner: 'Мария Смирнова', due: 'до 5 ноября' },
]
const detailsOpen = ref(false)
const selectedTask = ref<Task>(tasks[0])

function showTask(task: Task): void {
  selectedTask.value = task
  detailsOpen.value = true
}

const importOpen = ref(false)
const importProgress = ref(0)
const importing = ref(false)
let importTimer: ReturnType<typeof setInterval> | undefined

function stopImport(): void {
  clearInterval(importTimer)
  importing.value = false
}

function startImport(): void {
  importProgress.value = 0
  importing.value = true
  importTimer = setInterval(() => {
    importProgress.value = Math.min(importProgress.value + 10, 100)
    if (importProgress.value === 100)
      stopImport()
  }, 300)
}

watch(importOpen, (open) => {
  if (!open) {
    stopImport()
    importProgress.value = 0
  }
})

onBeforeUnmount(stopImport)

const SIZES: readonly GrDrawerSize[] = ['sm', 'md', 'lg', 'xl', 'full']
const sizeOpen = ref(false)
const sizeChoice = ref<GrDrawerSize>('md')

function openSized(size: GrDrawerSize): void {
  sizeChoice.value = size
  sizeOpen.value = true
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div>
      <GrButton variant="secondary" tone="neutral" @click="openFilters">
        <template #prefix>
          <IconListFilter />
        </template>
        Фильтры
      </GrButton>
    </div>
    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      {{ countFor(appliedStatuses) || totalTasks }} из {{ totalTasks }} задач · {{ filterSummary }}
    </p>
    <GrDrawer v-model="filtersOpen" title="Фильтры" side="right" size="sm">
      <GrFormField label="Статус">
        <GrCheckboxGroup v-model="draftStatuses" :options="statusOptions" />
      </GrFormField>
      <template #footer>
        <div class="flex justify-end">
          <GrButton @click="applyFilters">
            Показать {{ draftCount || totalTasks }}
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Фильтры справа" note="Модальная по умолчанию: подложка, ловушка фокуса, страница в inert. Середина прокручивается, действия внизу.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="openFilters">
          <template #prefix>
            <IconListFilter />
          </template>
          Фильтры
        </GrButton>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ countFor(appliedStatuses) || totalTasks }} из {{ totalTasks }} задач · {{ filterSummary }}
        </p>
      </div>
      <GrDrawer v-model="filtersOpen" title="Фильтры" side="right" size="sm">
        <div class="flex flex-col gap-5">
          <GrFormField label="Статус">
            <GrCheckboxGroup v-model="draftStatuses" :options="statusOptions" />
          </GrFormField>
          <GrFormField label="Ответственный">
            <GrInput v-model="draftOwner" placeholder="Имя или почта" />
          </GrFormField>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" tone="neutral" @click="resetFilters">
              Сбросить
            </GrButton>
            <GrButton @click="applyFilters">
              Показать {{ draftCount || totalTasks }}
            </GrButton>
          </div>
        </template>
      </GrDrawer>
    </Specimen>

    <Specimen title="Лист снизу" note="Верх и низ берут из шкалы высоту, а не ширину — на телефоне это привычный лист действий.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="exportOpen = true">
          <template #prefix>
            <IconDownload />
          </template>
          Выгрузить отчёт
        </GrButton>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lastExport ? `Готовим файл: ${lastExport}` : 'Формат пока не выбран' }}
        </p>
      </div>
      <GrDrawer v-model="exportOpen" title="Выгрузить отчёт" side="bottom" size="sm">
        <ul class="mx-auto flex w-full max-w-xl flex-col gap-2">
          <li v-for="format in exportFormats" :key="format.key">
            <GrButton variant="ghost" tone="neutral" block @click="exportAs(format.label)">
              <template #prefix>
                <component :is="format.icon" />
              </template>
              <span class="flex min-w-0 flex-1 flex-col items-start">
                <span>{{ format.label }}</span>
                <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ format.note }}</span>
              </span>
            </GrButton>
          </li>
        </ul>
      </GrDrawer>
    </Specimen>

    <Specimen title="Слева, своя шапка" note="Слот header заменяет шапку вместе с крестиком и отдаёт title и close; имя слоя остаётся скрытым заголовком.">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton variant="secondary" tone="neutral" @click="navOpen = true">
          <template #prefix>
            <IconMenu />
          </template>
          Разделы
        </GrButton>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Сейчас: {{ currentSection }}
        </p>
      </div>
      <GrDrawer v-model="navOpen" title="Разделы" side="left" size="sm">
        <template #header="{ title, close }">
          <div class="flex w-full items-center gap-2">
            <GrInput v-model="navQuery" type="search" size="sm" :placeholder="`${title}: поиск`" :aria-label="`${title}: поиск`" />
            <GrButton variant="ghost" tone="neutral" size="sm" @click="close">
              Готово
            </GrButton>
          </div>
        </template>
        <nav aria-label="Разделы приложения">
          <ul class="flex flex-col gap-1">
            <li v-for="section in visibleSections" :key="section">
              <GrButton
                :variant="section === currentSection ? 'secondary' : 'ghost'"
                tone="neutral"
                block
                :aria-current="section === currentSection ? 'page' : undefined"
                @click="goTo(section)"
              >
                <span class="flex-1 text-left">{{ section }}</span>
              </GrButton>
            </li>
          </ul>
        </nav>
      </GrDrawer>
    </Specimen>

    <Specimen title="Без подложки" note="С выключенным modal страница остаётся рабочей: список кликается и прокручивается, пока панель открыта; Esc по-прежнему закрывает.">
      <ul class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)]">
        <li
          v-for="(task, index) in tasks"
          :key="task.id"
          class="flex items-center justify-between gap-3 px-4 py-2.5"
          :class="index > 0 ? 'border-t border-[var(--gr-brd)]' : ''"
        >
          <span class="min-w-0 truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">{{ task.title }}</span>
          <GrButton variant="ghost" tone="neutral" size="sm" :aria-label="`Подробнее: ${task.title}`" @click="showTask(task)">
            Подробнее
          </GrButton>
        </li>
      </ul>
      <GrDrawer v-model="detailsOpen" :title="selectedTask.id" side="right" size="sm" :modal="false">
        <dl class="flex flex-col gap-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          <div class="flex flex-col gap-0.5">
            <dt class="text-[var(--gr-muted-fg)]">
              Задача
            </dt>
            <dd>{{ selectedTask.title }}</dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-[var(--gr-muted-fg)]">
              Ответственный
            </dt>
            <dd>{{ selectedTask.owner }}</dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-[var(--gr-muted-fg)]">
              Срок
            </dt>
            <dd>{{ selectedTask.due }}</dd>
          </div>
        </dl>
      </GrDrawer>
    </Specimen>

    <Specimen title="Нельзя бросить на полпути" note="persistent на время операции выключает Esc и щелчок по подложке; крестик остаётся — панель без выхода стала бы ловушкой.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="importOpen = true">
          <template #prefix>
            <IconUpload />
          </template>
          Импорт контактов
        </GrButton>
      </div>
      <GrDrawer v-model="importOpen" title="Импорт контактов" side="right" size="md" :persistent="importing">
        <div class="flex flex-col gap-4">
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            1 240 контактов из файла «Клиенты.csv». Пока идёт загрузка, панель не закрыть случайным щелчком или Esc.
          </p>
          <GrProgressBar :value="importProgress" show-value aria-label="Импорт контактов" />
          <p role="status" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            {{ importing ? 'Загружаем…' : importProgress === 100 ? 'Готово: контакты в базе' : 'Готово к загрузке' }}
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <GrButton v-if="importProgress === 100" @click="importOpen = false">
              Закрыть
            </GrButton>
            <GrButton v-else :loading="importing" @click="startImport">
              Начать импорт
            </GrButton>
          </div>
        </template>
      </GrDrawer>
    </Specimen>

    <Specimen title="Ступени" note="sm · md · lg · xl читаются по оси панели — у боковой это ширина; full — во весь экран.">
      <div class="flex flex-wrap gap-2">
        <GrButton v-for="size in SIZES" :key="size" variant="secondary" tone="neutral" size="sm" @click="openSized(size)">
          {{ size }}
        </GrButton>
      </div>
      <GrDrawer v-model="sizeOpen" :title="`Панель ступени ${sizeChoice}`" side="right" :size="sizeChoice">
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Шапка и поля те же — меняется только ширина панели.
        </p>
      </GrDrawer>
    </Specimen>
  </div>
</template>
