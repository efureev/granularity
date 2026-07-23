<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

const options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'preact', label: 'Preact' },
  { value: 'lit', label: 'Lit' },
]

const framework = ref('')
</script>

<template>
  <div class="grid gap-3">
    <GrAutocomplete
      v-model="framework"
      :options="options"
      clearable
      placeholder="Search a framework…"
      aria-label="Search a framework"
    />

    <p class="text-sm text-[var(--muted-fg)]">
      Selected: <code>{{ framework || '—' }}</code>
    </p>
  </div>
</template>
