<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

// Справочник, ради которого виртуализация и нужна: без неё каждая панель
// рендерила бы все совпадения разом.
const options = Array.from({ length: 10000 }, (_, index) => ({
  value: `city-${index + 1}`,
  label: `City ${index + 1}`,
}))

const city = ref('')
</script>

<template>
  <div class="grid gap-3">
    <GrAutocomplete
      v-model="city"
      :options="options"
      virtual
      clearable
      placeholder="Search among 10 000 cities…"
      aria-label="Search a city"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Selected: <code>{{ city || '—' }}</code>
    </p>
  </div>
</template>
