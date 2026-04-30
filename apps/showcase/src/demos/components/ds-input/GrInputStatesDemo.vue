<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput, GrSwitch } from '@feugene/granularity'

const displayName = ref('Ada Lovelace')
const email = ref('ops@granularity.dev')
const search = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <GrFormField label="Display name">
        <GrInput v-model="displayName" placeholder="Ada Lovelace" />
      </GrFormField>

      <GrFormField label="Work email" :error="invalid ? 'Use a valid email address' : undefined">
        <GrInput
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'success'"
        />
      </GrFormField>

      <GrFormField label="Search input">
        <GrInput
          v-model="search"
          type="search"
          placeholder="Search components"
        />
      </GrFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Validation toggle
      </div>
      <GrSwitch v-model="invalid" size="sm">
        Show invalid email state
      </GrSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Search query: {{ search || '—' }}
      </div>
    </div>
  </div>
</template>