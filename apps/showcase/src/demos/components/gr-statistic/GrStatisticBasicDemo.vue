<script setup lang="ts">
import { GrCard, GrStatistic } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <GrCard class="p-4">
      <GrStatistic
        title="Revenue"
        :value="1284500"
        :precision="0"
        prefix="$"
        icon="i-lucide-wallet"
      />
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic
        title="Active users"
        :value="18342"
        icon="i-lucide-users"
      />
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic
        title="Conversion"
        :value="4.8"
        :precision="1"
        suffix="%"
        icon="i-lucide-target"
      />
    </GrCard>
  </div>
</template>
