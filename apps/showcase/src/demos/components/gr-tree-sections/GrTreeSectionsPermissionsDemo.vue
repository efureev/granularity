<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTreeSections } from '@feugene/granularity'
import type { GrTreeKey } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const scopes: Item[] = [
  { id: 'reports', label: 'Отчёты', children: [
    { id: 'sales', label: 'Продажи', children: [
      { id: 'sales-read', label: 'Просмотр' },
      { id: 'sales-export', label: 'Выгрузка' },
    ] },
    { id: 'purchases', label: 'Закупки' },
  ] },
  { id: 'admin', label: 'Администрирование', children: [
    { id: 'users', label: 'Пользователи' },
    { id: 'audit', label: 'Журнал аудита' },
  ] },
]

const checked = ref<GrTreeKey[]>(['sales-read'])
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <!--
      Отметки собираются объединением по группам: общего родителя у них нет,
      поэтому наследование внутри каждой считается своё и на соседей не влияет.
    -->
    <GrTreeSections
      v-model:checked-keys="checked"
      :data="scopes"
      node-key="id"
      show-checkbox
      heading-level="4"
      :default-expanded-keys="['sales']"
    />

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Разрешено:</span>
      <GrBadge v-for="key in checked" :key="String(key)" size="sm" tone="slate">
        {{ key }}
      </GrBadge>
      <span v-if="checked.length === 0" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        ничего не отмечено
      </span>
    </div>
  </div>
</template>
