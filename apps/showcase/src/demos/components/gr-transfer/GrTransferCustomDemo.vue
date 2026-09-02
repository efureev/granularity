<script setup lang="ts">
import { ref } from 'vue'

import { GrChip, GrTransfer } from '@feugene/granularity'

const granted = ref<string[]>(['read'])

const permissions = [
  { id: 'read', label: 'Чтение', scope: 'Документы', hint: 'Просмотр без изменений' },
  { id: 'write', label: 'Запись', scope: 'Документы', hint: 'Создание и правка' },
  { id: 'publish', label: 'Публикация', scope: 'Витрина', hint: 'Выкладка наружу' },
  { id: 'billing', label: 'Счета', scope: 'Финансы', hint: 'Просмотр и выставление' },
  { id: 'audit', label: 'Журнал аудита', scope: 'Система', hint: 'Выдано системой', disabled: true },
]
</script>

<template>
  <div class="max-w-2xl">
    <GrTransfer
      v-model="granted"
      :items="permissions"
      source-title="Доступны"
      target-title="Выданы роли"
      aria-label="Права роли"
    >
      <template #item="{ item }">
        <span class="min-w-0 flex-1">
          <span class="block truncate">{{ item.label }}</span>
          <span class="block truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ item.hint }}
          </span>
        </span>
        <GrChip size="xs" tone="slate">{{ item.scope }}</GrChip>
      </template>
    </GrTransfer>

    <p class="mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      «Журнал аудита» выдан системой: строка видна и объявлена скринридеру, но не переносится.
    </p>
  </div>
</template>
