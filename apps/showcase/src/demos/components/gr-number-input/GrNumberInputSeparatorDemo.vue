<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const amountComma = ref('1,25')
const percentage = ref('42,5')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Comma decimal separator">
      <GrNumberInput
        v-model="amountComma"
        decimal-separator="," 
        :precision="2"
        :step="0.25"
        placeholder="0,00"
      >
        <template #suffix>kg</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Range guards">
      <GrNumberInput
        v-model="percentage"
        decimal-separator="," 
        :min="0"
        :max="100"
        :step="0.5"
        :precision="1"
        placeholder="0,0"
      >
        <template #suffix>%</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>