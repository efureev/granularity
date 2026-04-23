<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsPromptDialog } from '@feugene/granularity'

const open = ref(false)
const value = ref('Q2 North Star')
const savedValue = ref(value.value)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-3">
      <DsButton class="justify-self-start" @click="open = true">
        Rename objective
      </DsButton>
      <DsBadge size="sm" tone="neutral">
        {{ savedValue }}
      </DsBadge>
    </div>

    <DsPromptDialog
      v-model="open"
      v-model:value="value"
      title="Rename objective"
      label="Objective title"
      confirm-text="Save"
      @confirm="savedValue = $event"
    />
  </div>
</template>