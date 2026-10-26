<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconCircleHelp from '~icons/lucide/circle-help'
import IconCopy from '~icons/lucide/copy'
import IconDownload from '~icons/lucide/download'
import IconEllipsis from '~icons/lucide/ellipsis'
import IconFileText from '~icons/lucide/file-text'
import IconFolderInput from '~icons/lucide/folder-input'
import IconPencil from '~icons/lucide/pencil'
import IconSearch from '~icons/lucide/search'
import IconSend from '~icons/lucide/send'
import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal'
import IconTrash from '~icons/lucide/trash-2'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

interface DocumentRow {
  id: string
  title: string
  meta: string
  date: string
}

const documents: DocumentRow[] = [
  { id: 'launch-plan', title: 'План запуска', meta: 'Анна Соколова', date: 'сегодня' },
  { id: 'quarter-report', title: 'Отчёт за квартал', meta: 'Финансы', date: 'вчера' },
  { id: 'audience', title: 'Исследование аудитории', meta: 'Иван Петров', date: '12 окт' },
  { id: 'tone', title: 'Гайд по тону', meta: 'Редакция', date: '3 окт' },
  { id: 'retro', title: 'Ретро спринта 14', meta: 'Команда ядра', date: '28 сен' },
]
const firstDocument = documents[0]

const documentQuery = ref('')
const visibleDocuments = computed(() => {
  const query = documentQuery.value.trim().toLowerCase()
  return query ? documents.filter(doc => doc.title.toLowerCase().includes(query)) : documents
})

const rowActions: GrDropdownMenuEntry[] = [
  { key: 'open', label: 'Открыть', icon: IconFileText, shortcut: '↵' },
  { key: 'rename', label: 'Переименовать', icon: IconPencil, shortcut: 'F2' },
  { key: 'duplicate', label: 'Дублировать', icon: IconCopy, shortcut: '⌘D' },
  { key: 'move', label: 'Переместить в папку…', icon: IconFolderInput },
  { key: 'publish', label: 'Опубликовать', icon: IconSend, disabled: true },
  { type: 'divider' },
  { key: 'delete', label: 'Удалить', icon: IconTrash, variant: 'danger' },
]
const lastRowAction = ref('')

function onRowAction(item: GrDropdownMenuAction, doc: DocumentRow): void {
  lastRowAction.value = `${item.label} — «${doc.title}»`
}

const nestedActions: GrDropdownMenuEntry[] = [
  { key: 'open', label: 'Открыть', icon: IconFileText },
  { key: 'duplicate', label: 'Дублировать', icon: IconCopy },
  {
    key: 'export',
    label: 'Выгрузить',
    icon: IconDownload,
    children: [
      { key: 'pdf', label: 'PDF' },
      { key: 'docx', label: 'Word' },
      { key: 'md', label: 'Markdown' },
    ],
  },
  {
    key: 'move',
    label: 'Переместить в',
    icon: IconFolderInput,
    children: [
      {
        key: 'projects',
        label: 'Проекты',
        children: [
          { key: 'launch', label: 'Запуск весной' },
          { key: 'redesign', label: 'Редизайн сайта' },
        ],
      },
      { key: 'finance', label: 'Финансы' },
      { type: 'divider' },
      { key: 'archive', label: 'Архив' },
    ],
  },
  { type: 'divider' },
  { key: 'delete', label: 'Удалить', icon: IconTrash, variant: 'danger' },
]
const lastNested = ref('')

type Density = 'compact' | 'normal' | 'roomy'

const DENSITIES: { key: Density, label: string }[] = [
  { key: 'compact', label: 'Компактно' },
  { key: 'normal', label: 'Обычно' },
  { key: 'roomy', label: 'Просторно' },
]
const density = ref<Density>('normal')
const showArchived = ref(false)
const highlightOverdue = ref(true)

const displayItems = computed<GrDropdownMenuEntry[]>(() => [
  {
    type: 'group',
    title: 'Плотность',
    items: DENSITIES.map((option): GrDropdownMenuAction => ({ key: option.key, label: option.label, role: 'menuitemradio', checked: density.value === option.key })),
  },
  { type: 'divider' },
  {
    type: 'group',
    title: 'Показывать',
    items: [
      { key: 'archived', label: 'Архивные задачи', role: 'menuitemcheckbox', checked: showArchived.value },
      { key: 'overdue', label: 'Просроченные — цветом', role: 'menuitemcheckbox', checked: highlightOverdue.value },
    ],
  },
])

const displaySummary = computed(() => {
  const parts = [DENSITIES.find(option => option.key === density.value)?.label ?? '']
  if (showArchived.value)
    parts.push('с архивом')
  if (highlightOverdue.value)
    parts.push('просроченные цветом')
  return parts.join(' · ')
})

function onDisplaySelect(item: GrDropdownMenuAction): void {
  if (item.key === 'archived')
    showArchived.value = !showArchived.value
  else if (item.key === 'overdue')
    highlightOverdue.value = !highlightOverdue.value
  else
    density.value = item.key as Density
}

const helpItems: GrDropdownMenuEntry[] = [
  { key: 'showcase', label: 'Витрина компонентов', href: 'https://efureev.github.io/granularity', external: true },
  { key: 'issues', label: 'Сообщить о проблеме', href: 'https://github.com/efureev/granularity/issues', external: true },
  { type: 'divider' },
  { key: 'apg', label: 'Паттерн меню в WAI-ARIA', href: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/', external: true },
  { key: 'course', label: 'Видеокурс — скоро', href: 'https://efureev.github.io/granularity', disabled: true },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 py-3 text-[var(--gr-card-fg)]">
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">{{ firstDocument.title }}</span>
        <span class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ firstDocument.meta }}</span>
      </div>
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ firstDocument.date }}</span>
      <GrDropdownMenu :items="rowActions" width="15rem" @select="onRowAction($event, firstDocument)">
        <template #trigger="{ triggerProps }">
          <GrButton
            variant="ghost"
            tone="neutral"
            size="sm"
            square
            :aria-label="`Действия: ${firstDocument.title}`"
            v-bind="triggerProps"
          >
            <IconEllipsis />
          </GrButton>
        </template>
      </GrDropdownMenu>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Меню строки" note="Клавиши — справа, недоступное остаётся в обходе стрелками и объявляется, опасное — за разделителем." wide>
      <div class="flex flex-col gap-3">
        <div class="sm:max-w-[20rem]">
          <GrInput v-model="documentQuery" type="search" size="sm" placeholder="Найти документ" aria-label="Найти документ">
            <template #prefix>
              <IconSearch />
            </template>
          </GrInput>
        </div>
        <ul
          v-if="visibleDocuments.length"
          class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)]"
        >
          <li
            v-for="(doc, index) in visibleDocuments"
            :key="doc.id"
            class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3"
            :class="index > 0 ? 'border-t border-[var(--gr-brd)]' : ''"
          >
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="truncate text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">
                {{ doc.title }}
              </span>
              <span class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                {{ doc.meta }}
              </span>
            </div>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ doc.date }}
            </span>
            <GrDropdownMenu :items="rowActions" width="15rem" @select="onRowAction($event, doc)">
              <template #trigger="{ triggerProps }">
                <GrButton
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  square
                  :aria-label="`Действия: ${doc.title}`"
                  v-bind="triggerProps"
                >
                  <IconEllipsis />
                </GrButton>
              </template>
            </GrDropdownMenu>
          </li>
        </ul>
        <p
          v-else
          class="rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]"
        >
          Документов с «{{ documentQuery.trim() }}» нет — проверьте написание
        </p>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lastRowAction ? `Выбрано: ${lastRowAction}` : 'Откройте меню у любой строки' }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Подменю" note="Пункт с children раскрывает следующий уровень: → открывает, ← возвращает; курсору оставлен коридор наискось.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdownMenu :items="nestedActions" placement="bottom-start" width="14rem" @select="lastNested = $event.label">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              Действия
              <template #suffix>
                <IconChevronDown />
              </template>
            </GrButton>
          </template>
        </GrDropdownMenu>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lastNested ? `Выбрано: ${lastNested}` : 'Наведите на «Выгрузить» или «Переместить в»' }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Переключатели в меню" note="menuitemradio и menuitemcheckbox объявляют aria-checked; место под отметку занято всегда, строки не разъезжаются.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdownMenu
          :items="displayItems"
          :close-on-content-click="false"
          placement="bottom-start"
          width="15rem"
          @select="onDisplaySelect"
        >
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              <template #prefix>
                <IconSlidersHorizontal />
              </template>
              Отображение
            </GrButton>
          </template>
        </GrDropdownMenu>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ displaySummary }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Пункты-ссылки" note="href делает пункт ссылкой, external — новой вкладкой; у недоступной ссылки адрес снят, средней кнопкой её не открыть.">
      <div>
        <GrDropdownMenu :items="helpItems" placement="bottom-start" width="16rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="ghost" tone="neutral" v-bind="triggerProps">
              <template #prefix>
                <IconCircleHelp />
              </template>
              Помощь
            </GrButton>
          </template>
        </GrDropdownMenu>
      </div>
    </Specimen>
  </div>
</template>
