import type { ShowcaseComponentExampleDoc } from '../types'

export const grDrawerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'drawer-filter-panel',
    title: 'Filter panel drawer',
    description: 'Базовый application-shell сценарий: панель справа открывает форму фильтров без ухода со страницы.',
    status: 'ready',
    previewKey: 'gr-drawer-filter-panel',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open filters drawer
    </GrButton>

    <GrDrawer v-model="open" title="Report filters" size="sm">
      <div class="grid gap-4 text-sm text-[var(--gr-muted-fg)]">
        <label class="grid gap-2">
          <span class="text-[var(--gr-fg)]">Owner</span>
          <input class="rounded-lg border border-[var(--gr-brd)] bg-transparent px-3 py-2" value="Operations" />
        </label>

        <label class="grid gap-2">
          <span class="text-[var(--gr-fg)]">Date range</span>
          <input class="rounded-lg border border-[var(--gr-brd)] bg-transparent px-3 py-2" value="Last 30 days" />
        </label>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Reset
          </GrButton>
          <GrButton @click="open = false">
            Apply filters
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-bottom-sheet',
    title: 'Bottom sheet',
    description: '`side="bottom"` — панель выезжает снизу, и `size` для неё означает высоту, а не ширину.',
    status: 'ready',
    previewKey: 'gr-drawer-bottom-sheet',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer, GrSegmented } from '@feugene/granularity'

const open = ref(false)
const sort = ref('recent')

const options = [
  { value: 'recent', label: 'Newest first' },
  { value: 'amount', label: 'Largest amount' },
  { value: 'status', label: 'By status' },
]
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open bottom sheet
    </GrButton>

    <!-- Сторона решает ось: \`size\` у нижней панели — это высота, а не ширина. -->
    <GrDrawer v-model="open" side="bottom" size="sm" title="Sort orders">
      <GrSegmented v-model="sort" :options="options" class="w-full" />

      <template #footer>
        <div class="flex justify-end">
          <GrButton @click="open = false">
            Apply
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-non-modal',
    title: 'Non-modal filters',
    description: '`:modal="false"` — ни подложки, ни блокировки скролла, ни ловушки фокуса: с таблицей продолжают работать при открытой панели.',
    status: 'ready',
    previewKey: 'gr-drawer-non-modal',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCheckbox, GrDrawer, GrTable } from '@feugene/granularity'

const open = ref(false)
const onlyOverdue = ref(false)
const clicks = ref(0)

const rows = [
  { id: 'INV-1042', client: 'Northwind', status: 'Overdue' },
  { id: 'INV-1043', client: 'Contoso', status: 'Paid' },
  { id: 'INV-1044', client: 'Fabrikam', status: 'Overdue' },
]

const visibleRows = () => (onlyOverdue.value ? rows.filter(row => row.status === 'Overdue') : rows)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton class="justify-self-start" @click="open = true">
        Open filters
      </GrButton>
      <!-- Страница под немодальной панелью остаётся живой: счётчик растёт. -->
      <GrButton variant="outline" @click="clicks++">
        Table still responds: {{ clicks }}
      </GrButton>
    </div>

    <GrTable>
      <template #head>
        <tr>
          <th class="px-4 py-2 text-left">Invoice</th>
          <th class="px-4 py-2 text-left">Client</th>
          <th class="px-4 py-2 text-left">Status</th>
        </tr>
      </template>

      <tr v-for="row in visibleRows()" :key="row.id">
        <td class="px-4 py-2">{{ row.id }}</td>
        <td class="px-4 py-2">{{ row.client }}</td>
        <td class="px-4 py-2">{{ row.status }}</td>
      </tr>
    </GrTable>

    <!-- \`modal: false\` — ни подложки, ни блокировки скролла, ни ловушки фокуса:
         с панелью работают, не закрывая её. Esc закрывает по-прежнему. -->
    <GrDrawer v-model="open" :modal="false" size="sm" title="Invoice filters">
      <GrCheckbox v-model="onlyOverdue">
        Only overdue
      </GrCheckbox>

      <template #footer>
        <GrButton variant="outline" class="w-full" @click="open = false">
          Done
        </GrButton>
      </template>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-custom-header',
    title: 'Custom header',
    description: 'Слот `#header` заменяет шапку целиком — поиск вместо заголовка и своя кнопка вместо крестика; имя слоя остаётся скрытым заголовком.',
    status: 'ready',
    previewKey: 'gr-drawer-custom-header',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrDrawer, GrInput } from '@feugene/granularity'

const open = ref(false)
const query = ref('')

const members = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra']
const found = computed(() =>
  members.filter(name => name.toLowerCase().includes(query.value.trim().toLowerCase())),
)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open member picker
    </GrButton>

    <GrDrawer v-model="open" title="Team members" size="sm">
      <!-- Своя шапка заменяет и заголовок, и крестик. Имя слоя при этом
           остаётся: заголовок уходит в скрытый элемент. -->
      <template #header="{ title, close }">
        <div class="flex items-center gap-2">
          <GrInput v-model="query" :placeholder="title" class="flex-1" />
          <GrButton variant="ghost" size="sm" @click="close">
            Done
          </GrButton>
        </div>
      </template>

      <ul class="grid gap-1 text-sm">
        <li v-for="name in found" :key="name" class="rounded-md px-2 py-1.5 hover:bg-[var(--gr-muted)]">
          {{ name }}
        </li>
        <li v-if="found.length === 0" class="px-2 py-1.5 text-[var(--gr-muted-fg)]">
          Nobody matches “{{ query }}”
        </li>
      </ul>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-left-rail',
    title: 'Left navigation rail',
    description: '`side="left"` для навигации по разделам рабочего пространства.',
    status: 'ready',
    previewKey: 'gr-drawer-left-rail',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
const activeItem = ref('Overview')

const items = ['Overview', 'Approvals', 'Members', 'Security']
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Open left rail
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Active section: <span class="font-medium text-[var(--gr-fg)]">{{ activeItem }}</span>
    </div>

    <GrDrawer v-model="open" title="Workspace sections" side="left" size="sm">
      <div class="grid gap-2">
        <button
          v-for="item in items"
          :key="item"
          type="button"
          class="rounded-lg px-3 py-2 text-left text-sm transition"
          :class="item === activeItem ? 'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)]' : 'border border-[var(--gr-brd)] text-[var(--gr-muted-fg)]'"
          @click="activeItem = item"
        >
          {{ item }}
        </button>
      </div>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-guarded-size',
    title: 'Size switch with guarded backdrop',
    description: 'Переключение шкалы размеров вместе с `closeOnBackdrop: false`.',
    status: 'ready',
    previewKey: 'gr-drawer-guarded-size',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
const size = ref<'md' | 'lg'>('md')

function openDrawer(nextSize: 'md' | 'lg') {
  size.value = nextSize
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton variant="outline" @click="openDrawer('md')">
        Open review drawer
      </GrButton>
      <GrButton @click="openDrawer('lg')">
        Open wide drawer
      </GrButton>
    </div>

    <GrDrawer v-model="open" :title="\`Escalation summary (\${size})\`" :size="size" :close-on-backdrop="false">
      <div class="grid gap-3 text-sm text-[var(--gr-muted-fg)]">
        <p>Размер drawer удобно переключать под compact review или широкие inspector-сценарии.</p>
        <p>Backdrop закрытие отключено, чтобы случайный клик не сбрасывал прогресс.</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Continue later
          </GrButton>
          <GrButton @click="open = false">
            Resolve now
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
</template>`,
  },
  {
    id: 'drawer-persistent-form',
    title: 'Persistent form',
    description: '`persistent` запрещает бэкдроп и Esc на время сохранения; кнопка закрытия остаётся.',
    status: 'ready',
    previewKey: 'gr-drawer-persistent-form',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer, GrFormField, GrInput, GrTextarea } from '@feugene/granularity'

const open = ref(false)
const saving = ref(false)
const status = ref('—')

const name = ref('Nightly backup')
const note = ref('')

const nameInput = ref<HTMLElement | null>(null)

async function save(): Promise<void> {
  saving.value = true
  status.value = 'saving — drawer is locked'

  await new Promise(resolve => setTimeout(resolve, 1200))

  saving.value = false
  open.value = false
  status.value = \`saved “\${name.value}”\`
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Edit job
    </GrButton>

    <GrDrawer
      v-model="open"
      title="Edit job"
      :persistent="saving"
      :initial-focus="nameInput"
      :body-config="{ paddingY: 'py-4' }"
      @opened="status = 'opened'"
      @closed="status = status.startsWith('saved') ? status : 'closed'"
    >
      <div class="grid gap-4">
        <GrFormField label="Job name">
          <GrInput ref="nameInput" v-model="name" size="sm" />
        </GrFormField>

        <GrFormField label="Note" hint="Виден только команде дежурных">
          <GrTextarea v-model="note" :rows="4" />
        </GrFormField>

        <p class="text-sm text-[var(--gr-muted-fg)]">
          Пока идёт сохранение, панель \`persistent\`: ни Esc, ни клик по подложке её не закроют —
          кнопка закрытия остаётся, чтобы выход был хотя бы один.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" :disabled="saving" @click="open = false">
            Cancel
          </GrButton>
          <GrButton :loading="saving" @click="save">
            Save
          </GrButton>
        </div>
      </template>
    </GrDrawer>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Lifecycle: <span class="font-semibold text-[var(--gr-fg)]">{{ status }}</span>
    </div>
  </div>
</template>`,
  },
]
