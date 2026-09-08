<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const amount = ref('12 540')
const weight = ref('68')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Currency input">
      <!-- Подпись валюту не называет, значит аддоны значащие: без
           `describe-addons` они для диктора исчезли бы. -->
      <GrInput v-model="amount" describe-addons placeholder="0.00">
        <template #prefix>₽</template>
        <template #suffix>RUB</template>
      </GrInput>
    </GrFormField>

    <GrFormField label="Unit add-on">
      <GrInput v-model="weight" placeholder="0">
        <template #prefix>Weight</template>
        <template #suffix>kg</template>
      </GrInput>
    </GrFormField>
  </div>
</template>
