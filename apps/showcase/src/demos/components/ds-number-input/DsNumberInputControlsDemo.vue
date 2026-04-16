<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsNumberInput } from '@feugene/granularity'

const amount = ref('128.50')
const quantity = ref('3')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Vertical controls">
      <DsNumberInput v-model="amount" controls :precision="2" placeholder="0.00">
        <template #prefix>$</template>
      </DsNumberInput>
    </DsFormField>

    <DsFormField label="Horizontal controls">
      <DsNumberInput
        v-model="quantity"
        controls
        controls-direction="horizontal"
        :min="1"
        :max="10"
        placeholder="0"
      >
        <template #suffix>seats</template>
      </DsNumberInput>
    </DsFormField>
  </div>
</template>