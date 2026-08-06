<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider, GrDropdown, GrInput, GrSelect } from '@feugene/granularity'

const value = ref('a')
const options = [
  { value: 'a', label: 'Первый' },
  { value: 'b', label: 'Второй' },
]
</script>

<template>
  <!-- Тема поддерева: `data-theme` на обёртке провайдера. Тема документа
       остаётся за `useTheme` — это именно остров. -->
  <GrConfigProvider theme="dark" size="sm">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-[var(--gr-card-fg)]">
      <div class="text-sm font-semibold">
        Тёмный остров внутри страницы
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Поле" class="max-w-[12rem]" aria-label="Поле острова" />

        <!-- Панели телепортируются в body, вне обёртки провайдера, и всё равно
             остаются тёмными: тему они ставят себе сами из контекста. -->
        <GrSelect v-model="value" :options="options" class="max-w-[12rem]" aria-label="Выбор" />

        <GrDropdown width="12rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="outline" v-bind="triggerProps">
              Меню
            </GrButton>
          </template>

          <template #content>
            <div class="grid gap-1">
              <button
                v-for="item in ['Открыть', 'Дублировать', 'Удалить']"
                :key="item"
                type="button"
                role="menuitem"
                class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]"
              >
                {{ item }}
              </button>
            </div>
          </template>
        </GrDropdown>
      </div>
    </div>
  </GrConfigProvider>
</template>
