<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const usAmount = ref('1234567')
const euAmount = ref('1234567,89')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Grouped thousands (en-US)">
      <GrNumberInput
        v-model="usAmount"
        use-grouping
        locale="en-US"
        placeholder="0"
      >
        <template #prefix>$</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Locale grouping (de-DE, comma decimals)">
      <GrNumberInput
        v-model="euAmount"
        use-grouping
        locale="de-DE"
        decimal-separator=","
        :precision="2"
        placeholder="0,00"
      >
        <template #suffix>EUR</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>
