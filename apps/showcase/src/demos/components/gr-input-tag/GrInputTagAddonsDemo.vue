<script setup lang="ts">
import { ref } from 'vue'

import { GrInputTag } from '@feugene/granularity'

const recipients = ref(['ops@acme.io'])
</script>

<template>
  <GrInputTag
    v-model="recipients"
    clearable
    placeholder="Add a recipient"
    aria-label="Recipients"
  >
    <template #prefix>
      <span class="i-lucide-mail block h-4 w-4" />
    </template>
    <template #suffix>
      {{ recipients.length }}/10
    </template>
  </GrInputTag>
</template>
