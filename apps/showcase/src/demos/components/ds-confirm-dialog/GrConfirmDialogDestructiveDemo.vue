<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrConfirmDialog } from '@feugene/granularity'

const open = ref(false)
const lastAction = ref<'confirm' | 'cancel' | 'idle'>('idle')
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-3">
      <GrButton variant="primary" tone="danger" class="justify-self-start" @click="open = true">
        Delete workspace
      </GrButton>
      <GrBadge size="sm" :tone="lastAction === 'confirm' ? 'danger' : 'neutral'">
        {{ lastAction }}
      </GrBadge>
    </div>

    <GrConfirmDialog
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