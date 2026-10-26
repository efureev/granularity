<script setup lang="ts">
import { grTreeViewVars } from '@feugene/granularity/components/GrTree'
import type { GrTreeKey, GrTreeNode, GrTreeView } from '@feugene/granularity/components/GrTree'

import IconBuilding from '~icons/lucide/building-2'
import IconFile from '~icons/lucide/file'
import IconFileSpreadsheet from '~icons/lucide/file-spreadsheet'
import IconFileText from '~icons/lucide/file-text'
import IconFolder from '~icons/lucide/folder'
import IconImage from '~icons/lucide/image'
import IconUser from '~icons/lucide/user'
import IconUsers from '~icons/lucide/users'

import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

type FileNode = {
  id: string
  label: string
  kind: 'folder' | 'doc' | 'sheet' | 'image'
  count?: number
  children?: FileNode[]
}

const fileIcons = { folder: IconFolder, doc: IconFileText, sheet: IconFileSpreadsheet, image: IconImage }
// Данные слота дерева без типа узла: значок ищется по виду узла через типизированную функцию.
const fileIcon = (kind: FileNode['kind']) => fileIcons[kind]

const previewTree: FileNode[] = [
  {
    id: 'projects',
    label: 'Проекты',
    kind: 'folder',
    children: [
      {
        id: 'spring',
        label: 'Запуск весной',
        kind: 'folder',
        children: [
          { id: 'brief', label: 'Бриф.docx', kind: 'doc' },
          { id: 'estimate', label: 'Смета.xlsx', kind: 'sheet' },
        ],
      },
    ],
  },
]
const previewCurrent = ref<GrTreeKey | undefined>('estimate')

const fileTree: FileNode[] = [
  {
    id: 'projects',
    label: 'Проекты',
    kind: 'folder',
    children: [
      {
        id: 'spring',
        label: 'Запуск весной',
        kind: 'folder',
        children: [
          { id: 'brief', label: 'Бриф.docx', kind: 'doc' },
          { id: 'estimate', label: 'Смета.xlsx', kind: 'sheet' },
          {
            id: 'mockups',
            label: 'Макеты',
            kind: 'folder',
            count: 3,
            children: [
              { id: 'cover', label: 'Обложка.png', kind: 'image' },
              { id: 'spread', label: 'Разворот.png', kind: 'image' },
              { id: 'poster', label: 'Плакат.png', kind: 'image' },
            ],
          },
        ],
      },
      {
        id: 'archive',
        label: 'Архив 2025',
        kind: 'folder',
        count: 2,
        children: [
          { id: 'report', label: 'Отчёт.docx', kind: 'doc' },
          { id: 'budget', label: 'Бюджет.xlsx', kind: 'sheet' },
        ],
      },
    ],
  },
  { id: 'templates', label: 'Шаблоны', kind: 'folder', count: 1, children: [{ id: 'invoice', label: 'Счёт.xlsx', kind: 'sheet' }] },
]
const currentFile = ref<GrTreeKey | undefined>('estimate')

// Перенос переставляет узлы прямо в данных, поэтому дерево живёт в `ref`.
const moveTree = ref<FileNode[]>([
  {
    id: 'move-mockups',
    label: 'Макеты',
    kind: 'folder',
    children: [
      { id: 'move-cover', label: 'Обложка.png', kind: 'image' },
      { id: 'move-spread', label: 'Разворот.png', kind: 'image' },
    ],
  },
  {
    id: 'move-archive',
    label: 'Архив',
    kind: 'folder',
    children: [
      { id: 'move-old', label: 'Старый логотип.svg', kind: 'image' },
      { id: 'move-notes', label: 'Заметки.txt', kind: 'doc' },
    ],
  },
  { id: 'move-readme', label: 'Прочти меня.txt', kind: 'doc' },
])
const checkedFiles = ref<GrTreeKey[]>(['move-cover'])

const search = ref('')
const searchResult = ref<{ visibleCount: number, matchedCount: number }>()
const searchStatus = computed(() => {
  if (!search.value || !searchResult.value)
    return 'Начните вводить имя файла'
  if (searchResult.value.matchedCount === 0)
    return 'Ничего не нашлось — проверьте написание'
  return `Совпало: ${searchResult.value.matchedCount}, видно строк: ${searchResult.value.visibleCount}`
})

type OrgNode = { id: string, label: string, kind: 'company' | 'team' | 'person', isLeaf?: boolean }

const orgRoots: OrgNode[] = [
  { id: 'org-studio', label: 'Студия «Лён»', kind: 'company' },
]
const orgChildren: Record<string, OrgNode[]> = {
  'org-studio': [
    { id: 'org-design', label: 'Дизайн', kind: 'team' },
    { id: 'org-dev', label: 'Разработка', kind: 'team' },
    { id: 'org-sales', label: 'Продажи', kind: 'team' },
  ],
  'org-design': [
    { id: 'org-anna', label: 'Анна Соколова', kind: 'person', isLeaf: true },
    { id: 'org-maria', label: 'Мария Ким', kind: 'person', isLeaf: true },
  ],
  'org-dev': [
    { id: 'org-ivan', label: 'Иван Петров', kind: 'person', isLeaf: true },
    { id: 'org-oleg', label: 'Олег Лис', kind: 'person', isLeaf: true },
  ],
}
const orgIcons = { company: IconBuilding, team: IconUsers, person: IconUser }
const orgIcon = (kind: OrgNode['kind']) => orgIcons[kind]

// Сеть изображает задержка: ветка грузится по первому раскрытию, пустой ответ делает её листом.
function loadOrg(node: GrTreeNode<OrgNode>, resolve: (children: OrgNode[]) => void): void {
  setTimeout(resolve, 700, orgChildren[node.data.id] ?? [])
}

const viewOptions = [
  { value: 'explorer', label: 'Проводник' },
  { value: 'rail', label: 'Рейл' },
  { value: 'outline', label: 'Оглавление' },
  { value: 'picker', label: 'Отбор' },
]
const view = ref<string>('explorer')
const viewVars = computed(() => grTreeViewVars[view.value as GrTreeView])
const viewCurrent = ref<GrTreeKey | undefined>('brief')
const viewChecked = ref<GrTreeKey[]>(['cover', 'spread'])
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTree
      v-model:current-key="previewCurrent"
      :data="previewTree"
      :default-expanded-keys="['projects', 'spring']"
      size="sm"
      aria-label="Файлы проекта"
    >
      <template #default="{ data }">
        <span class="flex min-w-0 flex-1 items-center gap-2">
          <GrIcon size="sm" tone="neutral">
            <component :is="fileIcon(data.kind)" />
          </GrIcon>
          <span class="truncate">{{ data.label }}</span>
        </span>
      </template>
    </GrTree>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Раскрытие, выбор и счётчики" note="файлы проекта: значки и хвост строки — слотом">
      <GrTree
        v-model:current-key="currentFile"
        :data="fileTree"
        :default-expanded-keys="['projects', 'spring']"
        aria-label="Файлы проекта"
      >
        <template #default="{ data }">
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <GrIcon size="sm" tone="neutral">
              <component :is="fileIcon(data.kind)" />
            </GrIcon>
            <span class="truncate">{{ data.label }}</span>
            <span v-if="data.count" class="ml-auto text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ data.count }}
            </span>
          </span>
        </template>
      </GrTree>
    </Specimen>

    <Specimen title="Отметки и перенос" note="частичное состояние у родителя; узел переносится ручкой или Shift со стрелкой">
      <GrTree
        v-model:checked-keys="checkedFiles"
        :data="moveTree"
        :default-expanded-keys="['move-mockups']"
        show-checkbox
        draggable
        aria-label="Перенос файлов"
      >
        <template #default="{ data }">
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <GrIcon size="sm" tone="neutral">
              <component :is="data.kind === 'folder' ? IconFolder : IconFile" />
            </GrIcon>
            <span class="truncate">{{ data.label }}</span>
          </span>
        </template>
      </GrTree>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Отмечено: {{ checkedFiles.length }}
      </p>
    </Specimen>

    <Specimen title="Поиск по дереву" note="совпавшие узлы остаются вместе с ветками; «не нашлось» отличается от «пусто»">
      <GrInput v-model="search" type="search" placeholder="Например, png" size="sm" clearable aria-label="Найти файл" />
      <GrTree
        :data="fileTree"
        :filter-value="search"
        :default-expanded-keys="['projects']"
        aria-label="Файлы проекта, поиск"
        @filter="searchResult = $event"
      >
        <template #default="{ data }">
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <GrIcon size="sm" tone="neutral">
              <component :is="fileIcon(data.kind)" />
            </GrIcon>
            <span class="truncate">{{ data.label }}</span>
          </span>
        </template>
      </GrTree>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]" aria-live="polite">
        {{ searchStatus }}
      </p>
    </Specimen>

    <Specimen title="Подгрузка по раскрытию" note="ветка грузится один раз, на время запроса строка крутит спиннер">
      <GrTree :data="orgRoots" lazy :load="loadOrg" aria-label="Структура студии">
        <template #default="{ data }">
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <GrIcon size="sm" tone="neutral">
              <component :is="orgIcon(data.kind)" />
            </GrIcon>
            <span class="truncate">{{ data.label }}</span>
          </span>
        </template>
      </GrTree>
    </Specimen>

    <Specimen title="Готовые виды" note="набор переменных строки, а не проп: проводник, рейл, оглавление и отбор отметками" wide>
      <GrSegmented v-model="view" :options="viewOptions" size="sm" aria-label="Вид дерева" class="self-start" />
      <div class="max-w-[420px]">
        <GrTree
          v-model:current-key="viewCurrent"
          v-model:checked-keys="viewChecked"
          :data="fileTree"
          :default-expanded-keys="['projects', 'spring', 'mockups']"
          :branch-line="view === 'explorer' ? 'elbow' : 'line'"
          :show-checkbox="view === 'picker'"
          :style="viewVars"
          aria-label="Файлы проекта, выбранный вид"
        >
          <template #default="{ data }">
            <span class="flex min-w-0 flex-1 items-center gap-2">
              <GrIcon v-if="view === 'explorer'" size="sm" tone="neutral">
                <component :is="fileIcon(data.kind)" />
              </GrIcon>
              <span class="truncate">{{ data.label }}</span>
            </span>
          </template>
        </GrTree>
      </div>
    </Specimen>
  </div>
</template>
