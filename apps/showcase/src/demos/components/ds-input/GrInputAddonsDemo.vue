<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const amount = ref('12 540')
const iban = ref('DE89 3704 0044 0532 0130 00')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField :label="t('components.GrInput.addons.currencyLabel')">
      <GrInput v-model="amount" placeholder="0.00">
        <template #prefix>₽</template>
        <template #suffix>RUB</template>
      </GrInput>
    </GrFormField>

    <GrFormField :label="t('components.GrInput.addons.widthGuardsLabel')">
      <GrInput
        v-model="iban"
        placeholder="IBAN"
        prefix-min-width="3rem"
        prefix-max-width="7rem"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
      >
        <template #prefix>{{ t('components.GrInput.addons.intlAccount') }}</template>
        <template #suffix>{{ t('components.GrInput.addons.primarySettlement') }}</template>
      </GrInput>
    </GrFormField>
  </div>
</template>