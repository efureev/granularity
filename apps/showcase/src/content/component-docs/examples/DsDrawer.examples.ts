import type { ShowcaseComponentExampleDoc } from '../types'

export const dsDrawerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'drawer-filter-panel',
    title: 'Filter panel drawer',
    description: 'Базовый application-shell сценарий: drawer справа открывает форму фильтров без ухода со страницы.',
    status: 'ready',
    previewKey: 'ds-drawer-filter-panel',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDrawer } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <DsButton @click="open = true">
    Open filters drawer
  </DsButton>

  <DsDrawer v-model="open" title="Report filters" size="sm">
    <div class="grid gap-3 text-sm text-[var(--muted-fg)]">
      <div>Owner</div>
      <div>Date range</div>
    </div>
  </DsDrawer>
</template>`,
  },
  {
    id: 'drawer-left-rail',
    title: 'Left-side navigation rail',
    description: 'Показываем `side="left"` для responsive-navigation и utility-rail сценариев.',
    status: 'ready',
    previewKey: 'ds-drawer-left-rail',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDrawer } from '@feugene/granularity'

const open = ref(false)
const activeItem = ref('Overview')
</script>

<template>
  <DsButton variant="outline" @click="open = true">
    Open left rail
  </DsButton>

  <DsDrawer v-model="open" title="Workspace sections" side="left" size="sm">
    <button type="button" @click="activeItem = 'Members'">Members</button>
  </DsDrawer>
</template>`,
  },
  {
    id: 'drawer-guarded-size',
    title: 'Size switcher with guarded backdrop',
    description: 'Сравниваем `size` и одновременно показываем guarded overlay flow для review/inspector сценариев.',
    status: 'ready',
    previewKey: 'ds-drawer-guarded-size',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDrawer } from '@feugene/granularity'

const open = ref(false)
const size = ref<'md' | 'lg'>('md')
</script>

<template>
  <DsButton @click="open = true">
    Open review drawer
  </DsButton>

  <DsDrawer v-model="open" :size="size" :close-on-backdrop="false" />
</template>`,
  },
]
