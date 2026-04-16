<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsInput } from '@feugene/granularity'

const amount = ref('12 540')
const iban = ref('DE89 3704 0044 0532 0130 00')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Currency input">
      <DsInput v-model="amount" placeholder="0.00">
        <template #prefix>₽</template>
        <template #suffix>RUB</template>
      </DsInput>
    </DsFormField>

    <DsFormField label="Long add-ons with width guards">
      <DsInput
        v-model="iban"
        placeholder="IBAN"
        prefix-min-width="3rem"
        prefix-max-width="7rem"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
      >
        <template #prefix>International account</template>
        <template #suffix>Primary settlement account</template>
      </DsInput>
    </DsFormField>
  </div>
</template>