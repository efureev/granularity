<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const value = ref('Acme Corp')
const savedCompany = ref(value.value)

function openDialog() {
  value.value = savedCompany.value
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="openDialog">
      Edit billing company
    </GrButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Persisted value: <span class="font-medium text-[var(--fg)]">{{ savedCompany }}</span>
    </div>

    <GrPromptDialog
      v-model="open"
      v-model:value="value"
      title="Billing company"
      label="Legal entity"
      description="Reset incoming value on open if the source of truth lives outside the dialog."
      confirm-text="Update"
      cancel-text="Keep current"
      @confirm="savedCompany = $event"
    />
  </div>
</template>