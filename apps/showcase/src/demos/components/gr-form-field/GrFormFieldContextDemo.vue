<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const email = ref('john')
const error = computed(() =>
  email.value && !email.value.includes('@') ? 'Enter a valid email address' : undefined,
)
</script>

<template>
  <!--
    Контрол сам получает id (связка с label `for`), aria-describedby (hint + error),
    aria-invalid и aria-required через inject-контекст `GrFormField` — без `forId` вручную.
  -->
  <div class="grid max-w-sm gap-4">
    <GrFormField
      label="Email"
      required
      hint="We'll never share your email."
      :error="error"
    >
      <GrInput v-model="email" type="email" placeholder="you@example.com" />
    </GrFormField>
  </div>
</template>
