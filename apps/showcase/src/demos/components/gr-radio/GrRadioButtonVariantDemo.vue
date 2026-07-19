<script setup lang="ts">
import { ref } from 'vue'

import { GrRadio } from '@feugene/granularity'

const density = ref('balanced')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrRadio v-model="density" value="compact" variant="button" size="sm">
        Compact
      </GrRadio>
      <GrRadio v-model="density" value="balanced" variant="button" size="sm">
        Balanced
      </GrRadio>
      <GrRadio v-model="density" value="comfortable" variant="button" size="sm">
        Comfortable
      </GrRadio>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/35 p-4 text-sm text-[var(--muted-fg)]">
      Button-like radios keep the same `v-model` contract while matching toolbar and segmented-control layouts.
    </div>
  </div>
</template>