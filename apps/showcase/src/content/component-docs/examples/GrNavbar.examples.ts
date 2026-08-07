import type { ShowcaseComponentExampleDoc } from '../types'

export const grNavbarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'navbar-actions-slot',
    title: 'Actions slot in page shell',
    description: 'Показываем основной layout-случай: `GrNavbar` задаёт title area, а справа размещаются глобальные quick actions и status pills.',
    status: 'ready',
    previewKey: 'gr-navbar-actions-slot',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrNavbar } from '@feugene/granularity'
</script>

<template>
  <GrNavbar title="Workspace">
    <GrBadge size="sm" tone="secondary">
      3 updates
    </GrBadge>

    <GrButton size="sm" variant="outline">
      Refresh
    </GrButton>
  </GrNavbar>
</template>`,
  },
  {
    id: 'navbar-menu-toggle',
    title: 'Responsive menu trigger',
    description: 'Показываем `showMenuButton`, `menuButtonClass` и событие `menu` для responsive drawer/navigation shells.',
    status: 'ready',
    previewKey: 'gr-navbar-menu-toggle',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrNavbar } from '@feugene/granularity'

const isMenuOpen = ref(false)
</script>

<template>
  <GrNavbar
    title="Mobile shell"
    show-menu-button
    menu-button-class="sm:hidden"
    @menu="isMenuOpen = !isMenuOpen"
  >
    <GrBadge size="sm" :tone="isMenuOpen ? 'primary' : 'secondary'">
      {{ isMenuOpen ? 'Drawer open' : 'Drawer closed' }}
    </GrBadge>
  </GrNavbar>
</template>`,
  },
  {
    id: 'navbar-title-slot',
    title: 'Custom title slot',
    description: 'Кастомный `title`-slot нужен для брендинга, breadcrumbs и richer header-контекста без форка базового layout-компонента.',
    status: 'ready',
    previewKey: 'gr-navbar-title-slot',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrInput, GrNavbar } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3">
    <GrNavbar sticky>
      <template #title>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">Release dashboard</span>
          <GrBadge size="sm" tone="info">
            Beta
          </GrBadge>
        </div>
      </template>

      <template #center>
        <GrInput placeholder="Search releases" size="sm" aria-label="Search releases" />
      </template>

      <GrButton size="sm">
        Publish
      </GrButton>
    </GrNavbar>

    <div class="px-4 py-3 text-sm text-[var(--gr-muted-fg)]">
      Три зоны хедера: слева <code>#title</code> (брендинг, статус-бейдж) и <code>#left</code>,
      по центру <code>#center</code> — поиск или хлебные крошки, справа слот по умолчанию.
      Проп <code>title</code> не нужен, когда заголовок собран разметкой. С <code>sticky</code>
      панель остаётся сверху при прокрутке, но не перекрывает выпадающие панели.
    </div>
  </div>
</template>`,
  },
]
