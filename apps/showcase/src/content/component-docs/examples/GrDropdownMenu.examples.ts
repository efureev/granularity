import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-menu-quick-actions',
    title: 'Quick actions menu',
    description: 'Строим компактное action-menu поверх `GrDropdownMenu`, сохраняя привычный trigger/content contract от `GrDropdown`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-quick-actions',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdownMenu, GrDropdownMenuItem } from '@feugene/granularity'

const lastAction = ref('Not selected yet')

const actions = [
  'Duplicate page',
  'Move to archive',
  'Copy public URL',
]
</script>

<template>
  <div class="flex flex-wrap items-start gap-3">
    <GrDropdownMenu align="left" width="60">
      <template #trigger="{ open }">
        <GrButton variant="outline">
          {{ open ? 'Close quick actions' : 'Open quick actions' }}
        </GrButton>
      </template>

      <GrDropdownMenuItem
        v-for="action in actions"
        :key="action"
        @click="lastAction = action"
      >
        {{ action }}
      </GrDropdownMenuItem>
    </GrDropdownMenu>

    <GrBadge tone="neutral">
      Last action: {{ lastAction }}
    </GrBadge>
  </div>
</template>`,
  },
  {
    id: 'dropdown-menu-grouped-actions',
    title: 'Grouped sections with danger zone',
    description: 'Для richer menus используем `GrDropdownMenuGroup` и `GrDropdownMenuDivider`, чтобы отделять publish-flow и destructive actions.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-grouped-actions',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuDivider,
  GrDropdownMenuGroup,
  GrDropdownMenuItem,
} from '@feugene/granularity'

const selectedAction = ref('Publish now')
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
    <GrDropdownMenu width="64">
      <template #trigger="{ open }">
        <GrButton>
          {{ open ? 'Hide workspace actions' : 'Workspace actions' }}
        </GrButton>
      </template>

      <GrDropdownMenuGroup title="Publish" :uppercase="false" dividers>
        <GrDropdownMenuItem @click="selectedAction = 'Publish now'">
          Publish now
        </GrDropdownMenuItem>
        <GrDropdownMenuItem @click="selectedAction = 'Schedule for review'">
          Schedule for review
        </GrDropdownMenuItem>
      </GrDropdownMenuGroup>

      <GrDropdownMenuDivider />

      <GrDropdownMenuGroup title="Danger zone" :uppercase="false" dividers>
        <GrDropdownMenuItem variant="danger" @click="selectedAction = 'Delete draft'">
          Delete draft
        </GrDropdownMenuItem>
      </GrDropdownMenuGroup>
    </GrDropdownMenu>

    <div class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Selected action
      </div>
      <div class="mt-2 flex items-center gap-3">
        <div class="text-sm font-600 text-[var(--gr-fg)]">
          {{ selectedAction }}
        </div>
        <GrBadge size="sm" tone="primary">
          grouped menu
        </GrBadge>
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'dropdown-menu-shortcut-grid',
    title: 'Shortcut cheat-sheet grid',
    description: 'Минималистичный cheat-sheet хоткеев: `GrDropdownMenuHeader` + одноколоночный `GrDropdownMenuList`, где в каждой строке действие слева и хоткей-чипы справа (`justify-between`). Клавиши рендерим компонентом `GrKbd` — без ручной вёрстки `<kbd>`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-shortcut-grid',
    code: `<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuList,
  GrKbd,
} from '@feugene/granularity'

// Каждый хоткей — массив клавиш: рендерим их как отдельные \`GrKbd\`-чипы,
// так «⌘ K» читается чище, чем слипшееся «⌘K».
const shortcuts = [
  { action: 'Search', keys: ['⌘', 'K'] },
  { action: 'Save draft', keys: ['⌘', 'S'] },
  { action: 'Assign owner', keys: ['A'] },
  { action: 'Archive', keys: ['⌘', '⌫'] },
]
</script>

<template>
  <!--
    Минималистичный cheat-sheet: одна колонка, в каждой строке действие слева и
    хоткей справа (\`justify-between\`). Клавиши — компонент \`GrKbd\` (дефолтный размер).
  -->
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <GrButton variant="outline">
        {{ open ? 'Hide shortcuts' : 'Keyboard shortcuts' }}
      </GrButton>
    </template>

    <GrDropdownMenuHeader title="Keyboard shortcuts" />

    <GrDropdownMenuList>
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.action"
        class="flex items-center justify-between gap-6 px-4 py-2 text-[13px] text-[var(--gr-fg)]"
      >
        <span class="truncate">{{ shortcut.action }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <GrKbd
            v-for="(key, index) in shortcut.keys"
            :key="index"
          >
            {{ key }}
          </GrKbd>
        </span>
      </div>
    </GrDropdownMenuList>
  </GrDropdownMenu>
</template>`,
  },
  {
    id: 'dropdown-menu-declarative',
    title: 'Menu from a model',
    description: 'Пункты, группы и разделители задаются массивом `items`, а `menuitemcheckbox`/`menuitemradio` дают состояние прямо в меню — композиция подкомпонентов остаётся для нестандартных случаев.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-declarative',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrButton, GrDropdownMenu } from '@feugene/granularity'

const density = ref<'compact' | 'cozy'>('cozy')
const showArchived = ref(false)
const lastAction = ref('—')

// Модель вместо композиции: девять меню из десяти однотипны, и собирать их
// из пяти компонентов вручную незачем.
const items = computed<GrDropdownMenuEntry[]>(() => [
  { key: 'rename', label: 'Rename', shortcut: '⌘R' },
  { key: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
  { type: 'divider' },
  {
    type: 'group',
    title: 'View',
    items: [
      { key: 'compact', label: 'Compact rows', role: 'menuitemradio', checked: density.value === 'compact' },
      { key: 'cozy', label: 'Cozy rows', role: 'menuitemradio', checked: density.value === 'cozy' },
      { key: 'archived', label: 'Show archived', role: 'menuitemcheckbox', checked: showArchived.value },
    ],
  },
  { type: 'divider' },
  { key: 'export', label: 'Export…', disabled: true },
  { key: 'delete', label: 'Delete', variant: 'danger', shortcut: '⌫' },
])

function onSelect(item: GrDropdownMenuAction): void {
  if (item.key === 'compact' || item.key === 'cozy')
    density.value = item.key

  if (item.key === 'archived')
    showArchived.value = !showArchived.value

  lastAction.value = item.label
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdownMenu :items="items" align="left" width="60" @select="onSelect">
      <template #trigger="{ open }">
        <GrButton variant="outline">
          {{ open ? 'Close board actions' : 'Board actions' }}
        </GrButton>
      </template>
    </GrDropdownMenu>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Density: <span class="font-semibold text-[var(--gr-fg)]">{{ density }}</span> ·
      archived: <span class="font-semibold text-[var(--gr-fg)]">{{ showArchived ? 'shown' : 'hidden' }}</span> ·
      last action: <span class="font-semibold text-[var(--gr-fg)]">{{ lastAction }}</span>
    </div>
  </div>
</template>`,
  },
]
