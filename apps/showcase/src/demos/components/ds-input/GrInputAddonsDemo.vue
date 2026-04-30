<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const amount = ref('12 540')
const iban = ref('DE89 3704 0044 0532 0130 00')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Currency input">
      <GrInput v-model="amount" placeholder="0.00">
        <template #prefix>₽</template>
        <template #suffix>RUB</template>
      </GrInput>
    </GrFormField>

    <GrFormField label="Long add-ons with width guards">
      <GrInput
        v-model="iban"
        placeholder="IBAN"
        prefix-min-width="3rem"
        prefix-max-width="7rem"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
      >
        <template #prefix>International account</template>
        <template #suffix>Primary settlement account</template>
      </GrInput>
    </GrFormField>
  </div>
</template>