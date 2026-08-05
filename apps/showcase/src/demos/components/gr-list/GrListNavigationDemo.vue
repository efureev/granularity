<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrList, GrListItem } from '@feugene/granularity'

const lastAction = ref('—')

const sections = [
  { id: 'profile', title: 'Профиль', description: 'Имя, аватар, контакты', badge: 'Готово' },
  { id: 'billing', title: 'Оплата', description: 'Карта и счета', badge: '2 счёта' },
  { id: 'audit', title: 'Журнал доступа', description: 'Архивный раздел', disabled: true },
]
</script>

<template>
  <div class="grid gap-3">
    <GrList>
      <!-- Кликабельная строка — сам пункт: обёртка вокруг него рвала бы связку
           role="list" с role="listitem". -->
      <GrListItem
        v-for="section in sections"
        :key="section.id"
        :title="section.title"
        :description="section.description"
        :clickable="!section.disabled"
        :disabled="section.disabled"
        @click="lastAction = section.title"
      >
        <GrBadge v-if="section.badge" size="sm" tone="neutral">
          {{ section.badge }}
        </GrBadge>
      </GrListItem>
    </GrList>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Последнее действие: <span class="font-semibold text-[var(--gr-fg)]">{{ lastAction }}</span>.
      Строки достижимы `Tab`, отключённая — нет.
    </div>
  </div>
</template>
