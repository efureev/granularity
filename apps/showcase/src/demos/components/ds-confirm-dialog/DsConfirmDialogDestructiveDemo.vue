<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsConfirmDialog } from '@feugene/granularity'

const open = ref(false)
const lastAction = ref<'confirm' | 'cancel' | 'idle'>('idle')
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-3">
      <DsButton variant="primary" tone="danger" class="justify-self-start" @click="open = true">
        Delete workspace
      </DsButton>
      <DsBadge size="sm" :tone="lastAction === 'confirm' ? 'danger' : 'neutral'">
        {{ lastAction }}
      </DsBadge>
    </div>

    <DsConfirmDialog
      v-model="open"
      title="Delete workspace?"
      description="This action revokes links, members and scheduled automations."
      confirm-text="Delete"
      confirm-tone="danger"
      @confirm="lastAction = 'confirm'"
      @cancel="lastAction = 'cancel'"
    />
  </div>
</template>