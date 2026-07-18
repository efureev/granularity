<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput, GrSwitch } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const displayName = ref('Ada Lovelace')
const email = ref('ops@granularity.dev')
const search = ref('')
const invalid = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <GrFormField :label="t('components.GrInput.states.displayName')">
        <GrInput v-model="displayName" placeholder="Ada Lovelace" />
      </GrFormField>

      <GrFormField :label="t('components.GrInput.states.workEmail')" :error="invalid ? t('components.GrInput.states.invalidError') : undefined">
        <GrInput
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :invalid="invalid"
          :state="invalid ? 'danger' : 'success'"
        />
      </GrFormField>

      <GrFormField :label="t('components.GrInput.states.searchInput')">
        <GrInput
          v-model="search"
          type="search"
          :placeholder="t('components.GrInput.states.searchPlaceholder')"
        />
      </GrFormField>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t('components.GrInput.states.validationToggle') }}
      </div>
      <GrSwitch v-model="invalid" size="sm">
        {{ t('components.GrInput.states.showInvalid') }}
      </GrSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        {{ t('components.GrInput.states.searchQuery') }} {{ search || '—' }}
      </div>
    </div>
  </div>
</template>