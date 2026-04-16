<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsInput, DsSwitch } from '@feugene/granularity'

const displayName = ref('Ada Lovelace')
const email = ref('ops@granularity.dev')
const search = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <DsFormField label="Display name">
        <DsInput v-model="displayName" placeholder="Ada Lovelace" />
      </DsFormField>

      <DsFormField label="Work email" :error="invalid ? 'Use a valid email address' : undefined">
        <DsInput
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'success'"
        />
      </DsFormField>

      <DsFormField label="Search input">
        <DsInput
          v-model="search"
          type="search"
          placeholder="Search components"
        />
      </DsFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Validation toggle
      </div>
      <DsSwitch v-model="invalid" size="sm">
        Show invalid email state
      </DsSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Search query: {{ search || '—' }}
      </div>
    </div>
  </div>
</template>