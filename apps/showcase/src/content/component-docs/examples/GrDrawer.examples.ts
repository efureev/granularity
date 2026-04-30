import type { ShowcaseComponentExampleDoc } from '../types'

export const grDrawerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'drawer-filter-panel',
    title: 'Filter panel drawer',
    description: 'Базовый application-shell сценарий: drawer справа открывает форму фильтров без ухода со страницы.',
    status: 'ready',
    previewKey: 'ds-drawer-filter-panel',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton @click="open = true">
    Open filters drawer
  </GrButton>

  <GrDrawer v-model="open" title="Report filters" size="sm">
    <div class="grid gap-3 text-sm text-[var(--muted-fg)]">
      <div>Owner</div>
      <div>Date range</div>
    </div>
  </GrDrawer>
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

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
const activeItem = ref('Overview')
</script>

<template>
  <GrButton variant="outline" @click="open = true">
    Open left rail
  </GrButton>

  <GrDrawer v-model="open" title="Workspace sections" side="left" size="sm">
    <button type="button" @click="activeItem = 'Members'">Members</button>
  </GrDrawer>
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

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
const size = ref<'md' | 'lg'>('md')
</script>

<template>
  <GrButton @click="open = true">
    Open review drawer
  </GrButton>

  <GrDrawer v-model="open" :size="size" :close-on-backdrop="false" />
</template>`,
  },
]
