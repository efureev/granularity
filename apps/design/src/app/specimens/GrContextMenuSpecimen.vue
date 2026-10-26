<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import type { GrContextMenuOpenContext, GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const canvasView = ref<'grid' | 'list'>('grid')
const canvasItems = computed<GrDropdownMenuEntry[]>(() => [
  { key: 'paste', label: 'Вставить', shortcut: '⌘V' },
  { key: 'select-all', label: 'Выделить всё', shortcut: '⌘A' },
  {
    key: 'add',
    label: 'Добавить',
    children: [
      { key: 'note', label: 'Заметку', shortcut: 'N' },
      { key: 'shape', label: 'Фигуру', shortcut: 'R' },
      { key: 'image', label: 'Изображение…' },
    ],
  },
  { type: 'divider' },
  {
    type: 'group',
    title: 'Вид',
    items: [
      { key: 'grid', label: 'Сеткой', role: 'menuitemradio', checked: canvasView.value === 'grid' },
      { key: 'list', label: 'Списком', role: 'menuitemradio', checked: canvasView.value === 'list' },
    ],
  },
  { type: 'divider' },
  { key: 'clear', label: 'Очистить холст', variant: 'danger' },
])
const lastCanvasAction = ref('')
const viewOnly = ref(false)
const canvasHintId = useId()

function onCanvasAction(item: GrDropdownMenuAction): void {
  if (item.key === 'grid' || item.key === 'list')
    canvasView.value = item.key
  lastCanvasAction.value = item.label
}

interface FileNode {
  id: string
  label: string
  kind: 'folder' | 'file'
  children?: FileNode[]
}

const files: FileNode[] = [
  {
    id: 'reports',
    label: 'Отчёты',
    kind: 'folder',
    children: [
      { id: 'q3', label: 'Выручка за третий квартал.xlsx', kind: 'file' },
      { id: 'q4', label: 'План на четвёртый квартал.xlsx', kind: 'file' },
    ],
  },
  {
    id: 'contracts',
    label: 'Договоры',
    kind: 'folder',
    children: [
      { id: 'lease', label: 'Аренда офиса.pdf', kind: 'file' },
      { id: 'supply', label: 'Поставка оборудования.pdf', kind: 'file' },
    ],
  },
]
const fileIndex = new Map<string, FileNode>()
for (const node of files) {
  fileIndex.set(node.id, node)
  for (const child of node.children ?? [])
    fileIndex.set(child.id, child)
}

const fileTarget = ref<FileNode | null>(null)
const fileItems = ref<GrDropdownMenuEntry[]>([])
const lastFileAction = ref('')

function itemsFor(node: FileNode): GrDropdownMenuEntry[] {
  const common: GrDropdownMenuEntry[] = [
    { key: 'rename', label: 'Переименовать', shortcut: 'F2' },
    { type: 'divider' },
    { key: 'delete', label: node.kind === 'folder' ? 'Удалить папку' : 'Удалить файл', variant: 'danger', shortcut: '⌫' },
  ]
  return node.kind === 'folder'
    ? [{ key: 'new-file', label: 'Новый файл' }, { key: 'upload', label: 'Загрузить сюда…' }, ...common]
    : [{ key: 'open', label: 'Открыть', shortcut: '↵' }, { key: 'download', label: 'Скачать' }, { key: 'share', label: 'Поделиться ссылкой' }, ...common]
}

// Цель — из DOM, а не из координат мыши: тот же путь обслуживает Shift+F10, у которого мыши нет.
function onFileMenu(context: GrContextMenuOpenContext): void {
  const row = context.target?.closest<HTMLElement>('[data-gr-tree-node-key]')
  const node = row ? fileIndex.get(row.dataset.grTreeNodeKey ?? '') : undefined
  fileTarget.value = node ?? null
  fileItems.value = node ? itemsFor(node) : []
}

function onFileAction(item: GrDropdownMenuAction): void {
  lastFileAction.value = `${item.label} — «${fileTarget.value?.label ?? ''}»`
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrContextMenu :items="canvasItems" aria-label="Действия с холстом" @select="onCanvasAction">
      <div
        tabindex="0"
        role="group"
        aria-label="Холст «Запуск весной»"
        :aria-describedby="canvasHintId"
        class="grid min-h-20 place-items-center rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)] p-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      >
        <p :id="canvasHintId" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Щёлкните здесь правой кнопкой
        </p>
      </div>
    </GrContextMenu>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Меню области" note="Растёт из точки курсора, с клавиатуры — Shift+F10 от фокуса; Shift с правой кнопкой отдаёт меню браузеру.">
      <GrContextMenu :items="canvasItems" :disabled="viewOnly" aria-label="Действия с холстом" @select="onCanvasAction">
        <div
          tabindex="0"
          role="group"
          aria-label="Холст «Запуск весной»"
          :aria-describedby="canvasHintId"
          class="grid min-h-40 place-items-center rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)] p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        >
          <p :id="canvasHintId" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            {{ viewOnly ? 'Только просмотр — меню у курсора выключено' : 'Щёлкните здесь правой кнопкой' }}
          </p>
        </div>
      </GrContextMenu>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Вид: {{ canvasView === 'grid' ? 'сеткой' : 'списком' }}{{ lastCanvasAction ? ` · последнее действие — ${lastCanvasAction}` : '' }}
        </p>
        <GrSwitch v-model="viewOnly" size="sm">
          Только просмотр
        </GrSwitch>
      </div>
    </Specimen>

    <Specimen title="Пункты под цель" note="beforeOpen приходит до открытия: у папки и у файла свои действия, щелчок мимо строк меню не открывает.">
      <GrContextMenu :items="fileItems" aria-label="Действия с файлом" @before-open="onFileMenu" @select="onFileAction">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2 text-[var(--gr-card-fg)]">
          <GrTree :data="files" node-key="id" :default-expanded-keys="['reports', 'contracts']" aria-label="Файлы проекта" />
        </div>
      </GrContextMenu>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastFileAction ? `Выбрано: ${lastFileAction}` : 'Правой кнопкой по папке или файлу — или Shift+F10 на строке' }}
      </p>
    </Specimen>
  </div>
</template>
