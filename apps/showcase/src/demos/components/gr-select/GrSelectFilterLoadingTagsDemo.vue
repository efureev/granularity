<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrSelect } from '@feugene/granularity'

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'se', label: 'Sweden' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
]

// Filterable single select
const country = ref('')

// Loading state (simulated async load of options)
const asyncOptions = ref<Array<{ value: string, label: string }>>([])
const loading = ref(false)

function loadOptions() {
  loading.value = true
  asyncOptions.value = []
  window.setTimeout(() => {
    asyncOptions.value = countries
    loading.value = false
  }, 1200)
}

const asyncValue = ref('')

// Tags mode (multiple with removable chips)
const teams = ref<string[]>(['us', 'de', 'fr'])
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Filterable — search box over the option list
      </div>
      <GrSelect
        v-model="country"
        options-view="panel"
        filterable
        clearable
        :options="countries"
        placeholder="Pick a country"
        aria-label="Pick a country"
      />
      <GrBadge>{{ country || '—' }}</GrBadge>
    </div>

    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Loading — spinner while options are fetched
      </div>
      <div class="flex items-center gap-2">
        <div class="min-w-[220px]">
          <GrSelect
            v-model="asyncValue"
            options-view="panel"
            filterable
            :loading="loading"
            :options="asyncOptions"
            placeholder="Open to load…"
            aria-label="Async country"
          />
        </div>
        <GrButton size="sm" variant="outline" @click="loadOptions">
          Reload options
        </GrButton>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Tags — multiple selection as removable chips
      </div>
      <GrSelect
        v-model="teams"
        multiple
        tags
        filterable
        options-view="panel"
        :close-on-select="false"
        :options="countries"
        placeholder="Pick countries"
        aria-label="Pick countries"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Selected: {{ teams.length ? teams.join(', ') : 'none' }}
      </div>
    </div>
  </div>
</template>
