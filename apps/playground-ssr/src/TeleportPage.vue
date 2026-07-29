<script setup lang="ts">
import { ref } from 'vue'

import { GrDropdown, GrSelect, GrTooltip, GrButton, GrFormField } from '@feugene/granularity'

/**
 * Страница только из телепортирующих компонентов — сжатый набор для тестов.
 *
 * Раньше называлась «улика»: до починки ANALYSIS §60 она воспроизводила
 * hydration mismatch. Теперь служит регрессионным гейтом — гидрация обязана
 * проходить чисто.
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
