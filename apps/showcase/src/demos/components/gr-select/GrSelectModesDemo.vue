<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const options = [
  { value: 'alpha', label: 'Alpha workspace' },
  { value: 'beta', label: 'Beta workspace' },
  { value: 'gamma', label: 'Gamma workspace' },
]

const nativeValue = ref('')
const clearableValue = ref('beta')

// Значения-объекты: `valueKey` даёт стабильный ключ, поэтому модель может
// приходить отдельной копией — сравнение идёт по `id`, а не по ссылке.
type Owner = { id: number, name: string }

const owners: Owner[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Grace Hopper' },
]

const ownerOptions = owners.map(owner => ({ value: owner, label: owner.name }))
const owner = ref<Owner>({ id: 2, name: 'Grace Hopper' })

const region = ref('')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Native single
      </div>
      <GrSelect
        v-model="nativeValue"
        :options="options"
        placeholder="Pick workspace"
        aria-label="Pick workspace"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: {{ nativeValue || '—' }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Native clearable
      </div>
      <GrSelect
        v-model="clearableValue"
        clearable
        :options="options"
        placeholder="Pick owner"
        aria-label="Pick owner"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: {{ clearableValue || '—' }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Object values
      </div>
      <GrSelect
        v-model="owner"
        :options="ownerOptions"
        value-key="id"
        placeholder="Pick owner"
        aria-label="Pick owner (object value)"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: #{{ owner.id }} — {{ owner.name }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Validation state
      </div>
      <GrSelect
        v-model="region"
        :options="[{ value: 'eu', label: 'EU' }, { value: 'us', label: 'US' }]"
        :invalid="region === ''"
        :state="region === '' ? 'default' : 'success'"
        placeholder="Pick region"
        aria-label="Pick region"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        {{ region === '' ? 'Region is required' : 'Looks good' }}
      </div>
    </div>
  </div>
</template>
