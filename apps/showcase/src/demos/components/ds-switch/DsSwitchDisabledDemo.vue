<script setup lang="ts">
import { ref } from 'vue'

import { DsSwitch } from '@feugene/granularity'

const notifications = ref(true)
const disabled = ref(false)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <DsSwitch v-model="notifications" :disabled="disabled">
        Email notifications
      </DsSwitch>
      <DsSwitch :model-value="true" disabled>
        Always on
      </DsSwitch>
    </div>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <DsSwitch v-model="disabled" size="sm">
        Disable labeled switch
      </DsSwitch>
    </div>
  </div>
</template>