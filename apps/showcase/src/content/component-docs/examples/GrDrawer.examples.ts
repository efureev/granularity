import type { ShowcaseComponentExampleDoc } from '../types'

export const grDrawerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'drawer-filter-panel',
    title: 'Filter panel drawer',
    description: 'Базовый application-shell сценарий: drawer справа открывает форму фильтров без ухода со страницы.',
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
    id: 'drawer-left-rail',
    title: 'Left-side navigation rail',
    description: 'Показываем `side="left"` для responsive-navigation и utility-rail сценариев.',
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
    title: 'Size switcher with guarded backdrop',
    description: 'Сравниваем `size` и одновременно показываем guarded overlay flow для review/inspector сценариев.',
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
    title: 'Persistent drawer with a form',
    description: 'Панель блокируется на время сохранения (`persistent`), фокус уходит в первое поле (`initialFocus`), а хост слышит `@opened`/`@closed` и настраивает паддинги секций.',
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
