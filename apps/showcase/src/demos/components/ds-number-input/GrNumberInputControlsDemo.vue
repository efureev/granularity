<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const amount = ref('128.50')
const quantity = ref('3')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Vertical controls">
      <GrNumberInput v-model="amount" controls :precision="2" placeholder="0.00">
        <template #prefix>$</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Horizontal controls">
      <GrNumberInput
        v-model="quantity"
        controls
        controls-direction="horizontal"
        :min="1"
        :max="10"
        placeholder="0"
      >
        <template #suffix>seats</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>