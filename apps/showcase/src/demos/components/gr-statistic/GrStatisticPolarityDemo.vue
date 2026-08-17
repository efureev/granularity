<script setup lang="ts">
import { ref } from 'vue'

import { GrCard, GrSegmented, GrStatistic } from '@feugene/granularity'

const margin = ref(-1240)

const presets = [
  { value: 4820, label: 'Profit' },
  { value: 0, label: 'Break even' },
  { value: -1240, label: 'Loss' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="margin"
      :options="presets"
      size="sm"
    />

    <div class="grid gap-4 sm:grid-cols-3">
      <GrCard class="p-4">
        <!--
          Тон выводится из знака самой величины: полярность говорит, что здесь
          считать хорошим, а не какой краской красить.
        -->
        <GrStatistic
          title="Margin"
          :value="margin"
          prefix="₽"
          polarity="positive-good"
        />
      </GrCard>

      <GrCard class="p-4">
        <!-- У себестоимости рост — проблема, и тон обязан быть зеркальным. -->
        <GrStatistic
          title="Cost of goods"
          :value="margin"
          prefix="₽"
          polarity="negative-good"
        />
      </GrCard>

      <GrCard class="p-4">
        <!-- Явный `tone` сильнее: выведенный тон — умолчание, а не диктат. -->
        <GrStatistic
          title="Balance"
          :value="margin"
          prefix="₽"
          polarity="positive-good"
          tone="neutral"
        />
      </GrCard>
    </div>
  </div>
</template>
