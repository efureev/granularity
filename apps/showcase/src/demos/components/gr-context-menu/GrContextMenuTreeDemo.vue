<script setup lang="ts">
import { ref } from 'vue'

import type { GrContextMenuOpenContext, GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrCard, GrContextMenu, GrTree } from '@feugene/granularity'

type Node = {
  id: string
  label: string
  kind: 'folder' | 'file'
  children?: Node[]
}

const data: Node[] = [
  {
    id: 'reports',
    label: 'Reports',
    kind: 'folder',
    children: [
      { id: 'q1', label: 'Q1 revenue.xlsx', kind: 'file' },
      { id: 'q2', label: 'Q2 revenue.xlsx', kind: 'file' },
    ],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    kind: 'folder',
    children: [
      { id: 'acme', label: 'Acme Inc.pdf', kind: 'file' },
      { id: 'globex', label: 'Globex.pdf', kind: 'file' },
    ],
  },
]

const index = new Map<string, Node>()
for (const node of data) {
  index.set(node.id, node)
  for (const child of node.children ?? []) index.set(child.id, child)
}

const current = ref<Node | null>(null)
const items = ref<GrDropdownMenuEntry[]>([])
const lastAction = ref('—')

function itemsFor(node: Node): GrDropdownMenuEntry[] {
  return [
    { key: 'open', label: node.kind === 'folder' ? 'Открыть папку' : 'Открыть файл' },
    { key: 'rename', label: 'Переименовать', shortcut: 'F2' },
    ...(node.kind === 'file' ? [{ key: 'download', label: 'Скачать' }] : []),
    { type: 'divider' as const },
    { key: 'delete', label: 'Удалить', variant: 'danger' as const, shortcut: '⌫' },
  ]
}

/**
 * Пункты собираются под цель до открытия — у папки и файла действия разные.
 * Цель берём из DOM, а не из события мыши: тогда тот же код обслуживает и
 * Shift+F10, у которого события мыши нет вовсе. Клик мимо узла оставляет
 * пункты пустыми, и меню просто не открывается.
 */
function onBeforeOpen(context: GrContextMenuOpenContext): void {
  const row = context.target?.closest<HTMLElement>('[data-gr-tree-node-key]')
  const node = row ? index.get(row.dataset.grTreeNodeKey ?? '') : undefined

  current.value = node ?? null
  items.value = node ? itemsFor(node) : []
}

function onSelect(item: GrDropdownMenuAction): void {
  lastAction.value = `${item.label}: ${current.value?.label ?? '—'}`
}
</script>

<template>
  <GrCard class="grid gap-4 p-5">
    <GrContextMenu :items="items" @before-open="onBeforeOpen" @select="onSelect">
      <GrTree :data="data" node-key="id" :default-expanded-keys="['reports', 'contracts']" />
    </GrContextMenu>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Правый клик по узлу — или <kbd>Shift</kbd> + <kbd>F10</kbd> с клавиатуры.
      Последнее действие: <strong>{{ lastAction }}</strong>
    </p>
  </GrCard>
</template>
