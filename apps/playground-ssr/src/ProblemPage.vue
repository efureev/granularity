<script setup lang="ts">
import { ref } from 'vue'

import { GrDropdown, GrSelect, GrTooltip, GrButton, GrFormField } from '@feugene/granularity'

/**
 * Страница-улика: те же компоненты, но БЕЗ обёртки `ClientOnly`.
 *
 * В приложении так делать не надо — она существует только для тестов
 * (`src/__tests__/hydration.test.ts`), которые доказывают дефект из
 * ANALYSIS §60 воспроизведением, а не рассуждением.
 */
const framework = ref('vue')

const frameworks = [
  { label: 'Vue', value: 'vue' },
  { label: 'Nuxt', value: 'nuxt' },
]
</script>

<template>
  <main>
    <GrFormField label="Фреймворк">
      <GrSelect v-model="framework" :options="frameworks" options-view="panel" />
    </GrFormField>

    <GrDropdown>
      <template #trigger="{ triggerProps }">
        <GrButton v-bind="triggerProps" size="sm">
          Меню
        </GrButton>
      </template>
      <template #content>
        <div>Пункт меню</div>
      </template>
    </GrDropdown>

    <GrTooltip text="Подсказка">
      <GrButton size="sm">
        Триггер
      </GrButton>
    </GrTooltip>
  </main>
</template>
