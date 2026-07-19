<script setup lang="ts">
import { ref } from 'vue'

import { GrRadio, GrRadioGroup, GrSwitch } from '@feugene/granularity'

const environment = ref('staging')
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrRadioGroup v-model="environment" name="target-environment" :disabled="disabled">
      <GrRadio value="local">Local preview</GrRadio>
      <GrRadio value="staging">Staging</GrRadio>
      <GrRadio value="production">Production</GrRadio>
    </GrRadioGroup>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrSwitch v-model="disabled" size="sm">
        Disable full group
      </GrSwitch>
      <div class="text-sm text-[var(--muted-fg)]">
        Active target: <span class="font-semibold text-[var(--fg)]">{{ environment }}</span>
      </div>
    </div>
  </div>
</template>