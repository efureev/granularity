<script setup lang="ts">
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
</template>
