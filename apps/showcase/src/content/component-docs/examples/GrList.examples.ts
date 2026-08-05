import type { ShowcaseComponentExampleDoc } from '../types'

export const grListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'list-navigation',
    title: 'Кликабельные строки',
    description: 'Пункт сам становится ссылкой или кнопкой (`href` / `as` / `clickable`), не разрывая связку `role=\"list\"` с `role=\"listitem\"`.',
    status: 'ready',
    previewKey: 'gr-list-navigation',
    code: `<script setup lang="ts">
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
      Строки достижимы \`Tab\`, отключённая — нет.
    </div>
  </div>
</template>`,
  },
  {
    id: 'list-settings',
    title: 'Settings rows with actions',
    description: 'Базовый data-display сценарий: `GrList` + `GrListItem` собирают preference rows со secondary controls справа.',
    status: 'ready',
    previewKey: 'gr-list-settings',
    code: `<script setup lang="ts">
import { reactive } from 'vue'

import { GrList, GrListItem, GrSwitch } from '@feugene/granularity'

const settings = reactive({ alerts: true })
</script>

<template>
  <GrList>
    <GrListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <GrSwitch v-model="settings.alerts" aria-label="Realtime alerts" />
    </GrListItem>
  </GrList>
</template>`,
  },
  {
    id: 'list-queue-actions',
    title: 'Queue rows with badges and buttons',
    description: 'Показываем `GrList` как lightweight alternative для job queues и task summaries, где справа нужны badges и compact buttons.',
    status: 'ready',
    previewKey: 'gr-list-queue-actions',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrList, GrListItem } from '@feugene/granularity'
</script>

<template>
  <GrList>
    <GrListItem title="Publish release notes" description="Ready for review by marketing">
      <div class="flex items-center gap-2">
        <GrBadge size="sm" tone="secondary">Ready</GrBadge>
        <GrButton size="sm" variant="outline">Open</GrButton>
      </div>
    </GrListItem>
  </GrList>
</template>`,
  },
  {
    id: 'list-empty-state',
    title: 'Пустое состояние и загрузка',
    description: 'Пустоту список определяет сам — без `v-if` вокруг него; при `loading` вместо пунктов идут скелетоны, а слот `#empty` держит богатую заглушку.',
    status: 'ready',
    previewKey: 'gr-list-empty-state',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrList, GrListItem, GrSegmented } from '@feugene/granularity'

type Mode = 'items' | 'empty' | 'loading'

const mode = ref<Mode>('items')

const presets = computed(() => (mode.value === 'items'
  ? [
      { id: 'retention', title: 'Retention policy', description: 'Archive old reports after 90 days.' },
      { id: 'export', title: 'Export history', description: 'Keep downloadable exports for 30 days.' },
    ]
  : []))
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="mode"
      size="sm"
      :options="[
        { value: 'items', label: 'Пункты' },
        { value: 'empty', label: 'Пусто' },
        { value: 'loading', label: 'Загрузка' },
      ]"
    />

    <!-- Ни \`v-if\` вокруг списка, ни ручного переключения \`divided\`: пустоту
         список видит по слоту сам. -->
    <GrList :loading="mode === 'loading'">
      <GrListItem
        v-for="preset in presets"
        :key="preset.id"
        :title="preset.title"
        :description="preset.description"
      />

      <template #empty>
        <div class="grid justify-items-center gap-2">
          <span>Ни одного архивного пресета</span>
          <GrButton size="sm" @click="mode = 'items'">
            Показать примеры
          </GrButton>
        </div>
      </template>
    </GrList>
  </div>
</template>`,
  },
]
