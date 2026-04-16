<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsConfirmDialog } from '@feugene/granularity'

const open = ref(false)
const approved = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton variant="outline" class="justify-self-start" @click="open = true">
      Open compact confirm
    </DsButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Approved in current session: <span class="font-medium text-[var(--fg)]">{{ approved ? 'yes' : 'no' }}</span>
    </div>

    <DsConfirmDialog
      v-model="open"
      title="Promote release candidate"
      description="Smaller button sizes are handy in dense approval flows."
      confirm-text="Promote"
      cancel-text="Back"
      button-size="sm"
      @confirm="approved = true"
      @cancel="approved = false"
    />
  </div>
</template>