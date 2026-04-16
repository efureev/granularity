import type { ShowcaseComponentExampleDoc } from '../types'

export const dsNavbarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'navbar-actions-slot',
    title: 'Actions slot in page shell',
    description: 'Показываем основной layout-случай: `DsNavbar` задаёт title area, а справа размещаются глобальные quick actions и status pills.',
    status: 'ready',
    previewKey: 'ds-navbar-actions-slot',
    code: `<script setup lang="ts">
import { DsBadge, DsButton, DsNavbar } from '@feugene/granularity'
</script>

<template>
  <DsNavbar title="Workspace">
    <DsBadge size="sm" tone="secondary">
      3 updates
    </DsBadge>

    <DsButton size="sm" variant="outline">
      Refresh
    </DsButton>
  </DsNavbar>
</template>`,
  },
  {
    id: 'navbar-menu-toggle',
    title: 'Responsive menu trigger',
    description: 'Показываем `showMenuButton`, `menuButtonClass` и событие `menu` для responsive drawer/navigation shells.',
    status: 'ready',
    previewKey: 'ds-navbar-menu-toggle',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsNavbar } from '@feugene/granularity'

const isMenuOpen = ref(false)
</script>

<template>
  <DsNavbar
    title="Mobile shell"
    show-menu-button
    menu-button-class="sm:hidden"
    @menu="isMenuOpen = !isMenuOpen"
  >
    <DsBadge size="sm" :tone="isMenuOpen ? 'primary' : 'secondary'">
      {{ isMenuOpen ? 'Drawer open' : 'Drawer closed' }}
    </DsBadge>
  </DsNavbar>
</template>`,
  },
  {
    id: 'navbar-title-slot',
    title: 'Custom title slot',
    description: 'Кастомный `title`-slot нужен для брендинга, breadcrumbs и richer header-контекста без форка базового layout-компонента.',
    status: 'ready',
    previewKey: 'ds-navbar-title-slot',
    code: `<script setup lang="ts">
import { DsBadge, DsNavbar } from '@feugene/granularity'
</script>

<template>
  <DsNavbar title="Ignored by slot">
    <template #title>
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold">Release dashboard</span>
        <DsBadge size="sm" tone="info">
          Beta
        </DsBadge>
      </div>
    </template>
  </DsNavbar>
</template>`,
  },
]
