import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-expanded-state',
    title: 'Controlled expanded state and branch lines',
    description: 'Показываем `GrTree` как иерархический explorer, где внешняя orchestration управляет раскрытием групп и визуальными branch lines.',
    status: 'ready',
    previewKey: 'gr-tree-expanded-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrTree } from '@feugene/granularity'

const expandedKeys = ref([1, 2])
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="expandedKeys = [1, 2, 3]">
        Expand all groups
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="expandedKeys = [2]">
        Focus billing
      </GrButton>
    </div>

    <GrTree :data="treeData" :default-expanded-keys="expandedKeys" branch-line />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="key in expandedKeys" :key="key">
        Expanded: {{ key }}
      </GrBadge>
    </div>
  </div>
</template>`,
    note: 'Этот сценарий подчёркивает, что `GrTree` хорошо работает как controlled navigation/data primitive, а не только как статичное дерево.',
  },
  {
    id: 'tree-filtering',
    title: 'Filtering through instance API',
    description: 'Фильтрацию важно показывать не как магический prop, а как реальную интеграцию через expose-метод `filter()` и внешний input.',
    status: 'ready',
    previewKey: 'gr-tree-filtering',
    code: `<script setup lang="ts">
import { ref, watch } from 'vue'

import { GrInput, GrTree } from '@feugene/granularity'

const query = ref('')
const treeRef = ref(null)

watch(query, value => treeRef.value?.filter(value), { immediate: true })
</script>

<template>
  <div class="grid gap-4">
    <GrInput v-model="query" placeholder="Filter tree nodes" aria-label="Filter tree nodes" />

    <GrTree
      ref="treeRef"
      :data="treeData"
      :filter-node-method="(value, data) => [data.label, data.team].join(' ').toLowerCase().includes(String(value).toLowerCase())"
      branch-line
    />
  </div>
</template>`,
    note: 'Полезный integration recipe для search/filter поверх больших справочников и nested navigation.',
  },
  {
    id: 'tree-drag-and-slot',
    title: 'Drag-and-drop with custom row slot',
    description: 'Комбинируем две важные возможности complex-дерева: rearrange drag-and-drop и кастомный рендер строки через default slot.',
    status: 'ready',
    previewKey: 'gr-tree-drag-and-slot',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTree } from '@feugene/granularity'

const lastDrop = ref('Drag a row handle to reorder or nest nodes')
</script>

<template>
  <div class="grid gap-4">
    <GrTree
      :data="treeData"
      :default-expanded-keys="[1, 2]"
      draggable
      branch-line
      @node-drop="(draggingNode, dropNode, dropType) => lastDrop = [draggingNode.label, '→', dropNode.label, '(' + dropType + ')'].join(' ')"
    >
      <template #default="{ data }">
        <div class="flex w-full items-center justify-between gap-3">
          <span>{{ data.label }}</span>
          <span>{{ data.status }}</span>
        </div>
      </template>
    </GrTree>

    <GrBadge>{{ lastDrop }}</GrBadge>
  </div>
</template>`,
    note: 'Сценарий особенно важен для real-world деревьев с ownership/status метаданными и операторскими перестановками.',
  },
  {
    id: 'tree-sizes',
    title: 'Шкала размеров',
    description: 'Размер выражен CSS-переменными `--gr-tree-*`: те же точки кастомизации, что и для ручной настройки, — `size` просто задаёт им дефолты.',
    status: 'ready',
    previewKey: 'gr-tree-sizes',
    code: `<script setup lang="ts">
import { GrTree } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const data = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components' },
      { id: 'composables', label: 'composables' },
    ],
  },
]
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTree :data="data" :size="size" :default-expanded-keys="['src']" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'tree-checkboxes',
    title: 'Checkboxes and multiple selection',
    description: 'Чекбоксы включаются пропом `show-checkbox`, набор ведётся через `v-model:checked-keys`. Родитель отмечается каскадом и показывает `mixed`, когда отмечена часть детей; `check-strictly` эту связь отключает. Состояние объявляется на самом узле (`aria-checked`), а квадратик остаётся декоративным — вкладывать интерактивный чекбокс внутрь роли `treeitem` нельзя.',
    status: 'ready',
    previewKey: 'gr-tree-checkboxes',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTree } from '@feugene/granularity'

type Permission = { id: string, label: string, children?: Permission[] }

// Типовой сценарий чекбоксов в дереве — выдача прав по разделам.
const permissions: Permission[] = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing.read', label: 'View invoices' },
      { id: 'billing.write', label: 'Issue invoices' },
      { id: 'billing.refund', label: 'Refund payments' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    children: [
      { id: 'team.read', label: 'View members' },
      { id: 'team.invite', label: 'Invite members' },
    ],
  },
]

const checkedKeys = ref<(string | number)[]>(['billing.read'])
</script>

<template>
  <div class="grid gap-3">
    <GrTree
      v-model:checked-keys="checkedKeys"
      :data="permissions"
      node-key="id"
      show-checkbox
      :default-expanded-keys="['billing', 'team']"
    />

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="neutral">
        Отмечено: {{ checkedKeys.length }}
      </GrBadge>
      <GrBadge v-for="key in checkedKeys" :key="key" tone="info">
        {{ key }}
      </GrBadge>
    </div>
  </div>
</template>`,
  },
  {
    id: 'tree-lazy',
    title: 'Lazy branches',
    description: 'В режиме `lazy` дети ветки приходят по её раскрытию: `load` получает узел и `resolve`, на время запроса строка показывает спиннер и помечается `aria-busy`. Повторное раскрытие запрос не делает. Лист объявляется полем `isLeaf` в данных — иначе дерево считает ветку разворачиваемой, пока не доказано обратное.',
    status: 'ready',
    previewKey: 'gr-tree-lazy',
    code: `<script setup lang="ts">
import { GrTree, type GrTreeNode } from '@feugene/granularity'

type Folder = { id: string, label: string, isLeaf?: boolean, children?: Folder[] }

// Корень приходит с сервера сразу, ветки — по раскрытию.
const roots: Folder[] = [
  { id: 'src', label: 'src' },
  { id: 'docs', label: 'docs' },
  { id: 'README.md', label: 'README.md', isLeaf: true },
]

function loadChildren(node: GrTreeNode<Folder>, resolve: (children: Folder[]) => void): void {
  window.setTimeout(() => {
    resolve([
      { id: \`\${node.key}/index.ts\`, label: 'index.ts', isLeaf: true },
      { id: \`\${node.key}/nested\`, label: 'nested' },
    ])
  }, 600)
}
</script>

<template>
  <GrTree
    :data="roots"
    node-key="id"
    lazy
    :load="loadChildren"
  />
</template>`,
  },
  {
    id: 'tree-keyboard',
    title: 'Клавиатура и режимы раскрытия',
    description: 'Typeahead по первым буквам, `*` на весь уровень, плюс `accordion` и `expandOnClickNode` — то, чем дерево управляется без мыши.',
    status: 'ready',
    previewKey: 'gr-tree-keyboard',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSwitch, GrTree } from '@feugene/granularity'

type Node = {
  id: string
  label: string
  children?: Node[]
}

const data: Node[] = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'payouts', label: 'Payouts' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    children: [
      { id: 'categories', label: 'Categories' },
      { id: 'currencies', label: 'Currencies' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    children: [
      { id: 'couriers', label: 'Couriers' },
      { id: 'warehouses', label: 'Warehouses' },
    ],
  },
]

const accordion = ref(true)
const expandOnClickNode = ref(true)
const lastSelected = ref('—')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
    <div class="grid gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
          <GrSwitch v-model="accordion" size="sm" />
          accordion
        </label>
        <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
          <GrSwitch v-model="expandOnClickNode" size="sm" />
          expandOnClickNode
        </label>
      </div>

      <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-3">
        <GrTree
          :data="data"
          node-key="id"
          :accordion="accordion"
          :expand-on-click-node="expandOnClickNode"
          default-expand-all
          @node-click="(item: Node) => (lastSelected = item.label)"
        />
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      <div>
        Выбрано:
        <GrBadge class="ml-1">
          {{ lastSelected }}
        </GrBadge>
      </div>

      <ul class="mt-3 grid gap-1">
        <li>Наберите «cur» — фокус уедет на Currencies.</li>
        <li>Повторное нажатие одной буквы идёт по кругу.</li>
        <li><code>*</code> раскрывает все узлы уровня разом.</li>
      </ul>
    </div>
  </div>
</template>`,
  },
  {
    id: 'tree-virtual',
    title: 'Дерево на 10 000 узлов',
    description: 'С `virtual` и `maxHeight` дерево держит в DOM только окно вокруг вьюпорта, а скроллером становится его корень. Плоская разметка строк это и открывает.',
    status: 'ready',
    previewKey: 'gr-tree-virtual',
    code: `<script setup lang="ts">
import { GrTree } from '@feugene/granularity'

// Плоский справочник на 10 000 узлов: в DOM остаётся только окно вокруг
// вьюпорта, поэтому раскрытие такого дерева не стоит ничего.
const data = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  label: \`Node \${index + 1}\`,
}))
</script>

<template>
  <GrTree
    :data="data"
    node-key="id"
    virtual
    :max-height="320"
  />
</template>`,
    note: '`aria-setsize`/`aria-posinset` остаются от полного набора, а не от окна. Перетаскивание при этом работает по отрисованным строкам: уронить узел на тот, которого нет на экране, нельзя.',
  },
]
