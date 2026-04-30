<script setup lang="ts">
import { ref } from 'vue'

import { GrInput, GrSwitch } from '@feugene/granularity'

const enabled = ref(true)
const activeBackgroundColor = ref('#22c55e')
const inactiveBackgroundColor = ref('#e5e7eb')
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch
      v-model="enabled"
      :active-background-color="activeBackgroundColor"
      :inactive-background-color="inactiveBackgroundColor"
    >
      Custom colors
    </GrSwitch>

    <div class="grid gap-3 md:grid-cols-2">
      <GrInput v-model="activeBackgroundColor" placeholder="#22c55e / var(--primary)" />
      <GrInput v-model="inactiveBackgroundColor" placeholder="#e5e7eb / var(--muted)" />
    </div>
  </div>
</template>