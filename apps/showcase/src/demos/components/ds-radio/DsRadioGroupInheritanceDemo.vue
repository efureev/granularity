<script setup lang="ts">
import { ref } from 'vue'

import { DsRadio, DsRadioGroup, DsSwitch } from '@feugene/granularity'

const environment = ref('staging')
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsRadioGroup v-model="environment" name="target-environment" :disabled="disabled">
      <DsRadio value="local">Local preview</DsRadio>
      <DsRadio value="staging">Staging</DsRadio>
      <DsRadio value="production">Production</DsRadio>
    </DsRadioGroup>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <DsSwitch v-model="disabled" size="sm">
        Disable full group
      </DsSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Active target: <span class="font-semibold text-[var(--fg)]">{{ environment }}</span>
      </div>
    </div>
  </div>
</template>