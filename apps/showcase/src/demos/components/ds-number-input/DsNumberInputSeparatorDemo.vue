<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsNumberInput } from '@feugene/granularity'

const amountComma = ref('1,25')
const percentage = ref('42,5')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Comma decimal separator">
      <DsNumberInput
        v-model="amountComma"
        decimal-separator="," 
        :precision="2"
        :step="0.25"
        placeholder="0,00"
      >
        <template #suffix>kg</template>
      </DsNumberInput>
    </DsFormField>

    <DsFormField label="Range guards">
      <DsNumberInput
        v-model="percentage"
        decimal-separator="," 
        :min="0"
        :max="100"
        :step="0.5"
        :precision="1"
        placeholder="0,0"
      >
        <template #suffix>%</template>
      </DsNumberInput>
    </DsFormField>
  </div>
</template>