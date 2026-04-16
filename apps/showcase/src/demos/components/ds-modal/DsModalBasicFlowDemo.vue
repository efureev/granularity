<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" @click="open = true">
      Open bare modal
    </DsButton>

    <DsModal v-model="open" size="sm">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Bare modal shell
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          `DsModal` отвечает за overlay, focus trap и panel sizing — содержимое вы собираете сами.
        </div>
        <DsButton class="justify-self-start" @click="open = false">
          Close
        </DsButton>
      </div>
    </DsModal>
  </div>
</template>