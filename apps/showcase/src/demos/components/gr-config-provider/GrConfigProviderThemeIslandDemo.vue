<script setup lang="ts">
import { ref } from 'vue'

const value = ref('a')
const options = [
  { value: 'a', label: 'Первый' },
  { value: 'b', label: 'Второй' },
]
</script>

<template>
  <!-- Режим поддерева: пара `data-theme` на обёртке провайдера. Режим документа
       остаётся за `useTheme` — это именно остров. -->
  <GrConfigProvider mode="dark" size="sm">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-[var(--gr-card-fg)]">
      <div class="text-sm font-semibold">
        Тёмный остров внутри страницы
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Поле" class="max-w-[12rem]" aria-label="Поле острова" />

        <!-- Панели телепортируются в body, вне обёртки провайдера, и всё равно
             остаются тёмными: пару они ставят себе сами из контекста. -->
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
