<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard, GrStatistic } from '@feugene/granularity'

const loading = ref(false)

function refresh(): void {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1200)
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-3">
      <GrCard class="p-4">
        <GrStatistic
          title="Orders"
          :value="2148"
          tone="success"
          trend="up"
          trend-text="+12.5% week over week"
          :loading="loading"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Refunds"
          :value="97"
          tone="danger"
          trend="down"
          trend-text="-3.1% week over week"
          :loading="loading"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Average check"
          :value="5980.4"
          :precision="2"
          suffix="₽"
          trend="flat"
          trend-text="No change"
          :loading="loading"
        />
      </GrCard>
    </div>

    <div>
      <GrButton size="sm" @click="refresh">
        Refresh data
      </GrButton>
    </div>
  </div>
</template>
