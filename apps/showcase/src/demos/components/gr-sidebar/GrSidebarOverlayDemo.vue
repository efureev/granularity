<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrSidebar, GrSidebarGroup, GrSidebarItem } from '@feugene/granularity'

// Режим задаёт приложение: своей системы брейкпоинтов у пакета нет, а
// спрашивать среду в setup нельзя — гидрация разойдётся.
const narrow = ref(true)
const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" @click="narrow = !narrow">
        {{ narrow ? 'Широкий экран' : 'Узкий экран' }}
      </GrButton>
      <GrButton v-if="narrow" size="sm" variant="outline" @click="open = true">
        Открыть меню
      </GrButton>
    </div>

    <div class="relative flex min-h-[18rem] gap-4 overflow-hidden rounded-xl border border-[var(--gr-brd)]">
      <GrSidebar
        v-model:open="open"
        :overlay="narrow"
        landmark="navigation"
        aria-label="Разделы"
        title="Меню"
        show-toggle-button
      >
        <GrSidebarGroup label="Организация">
          <GrSidebarItem label="Обзор" icon="i-lucide-home" active />
          <GrSidebarItem label="Команда" icon="i-lucide-users">
            <GrSidebarItem label="Участники" />
            <GrSidebarItem label="Приглашения" />
          </GrSidebarItem>
        </GrSidebarGroup>
      </GrSidebar>

      <div class="flex-1 p-4 text-sm text-[var(--gr-muted-fg)]">
        {{ narrow
          ? 'Узкий экран: панель уехала в модальный слой. Откройте её кнопкой — закроется по Esc, клику в подложку или крестику в шапке.'
          : 'Широкий экран: та же панель стоит колонкой в раскладке.' }}
      </div>
    </div>
  </div>
</template>
