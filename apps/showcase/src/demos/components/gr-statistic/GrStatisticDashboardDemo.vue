<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard, GrStatistic } from '@feugene/granularity'

const revenue = ref(1284500)
const users = ref(18342)
const conversion = ref(4.8)
const opened = ref(0)

/** Обновление дашборда: перебор идёт от прежнего числа, а не от нуля. */
function refresh() {
  revenue.value = Math.round(900000 + Math.random() * 700000)
  users.value = Math.round(12000 + Math.random() * 12000)
  conversion.value = Number((3 + Math.random() * 4).toFixed(1))
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-3">
      <GrCard class="p-4">
        <GrStatistic
          title="Revenue"
          :value="revenue"
          :precision="0"
          prefix="$"
          icon="i-lucide-wallet"
          animate
          href="#gr-statistic"
          trend="up"
          trend-text="+12.5% vs last week"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Active users"
          :value="users"
          icon="i-lucide-users"
          animate
          clickable
          @click="opened++"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Conversion"
          :value="conversion"
          :precision="1"
          suffix="%"
          icon="i-lucide-target"
          animate
          :animate-duration="900"
        />
      </GrCard>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" variant="secondary" @click="refresh">
        Refresh data
      </GrButton>

      <span class="text-sm text-[var(--gr-muted-fg)]">
        Revenue is a link, active users is a button (opened {{ opened }} times), conversion counts for 900 ms.
        Turn on "reduce motion" in the OS and the numbers stop counting.
      </span>
    </div>
  </div>
</template>
