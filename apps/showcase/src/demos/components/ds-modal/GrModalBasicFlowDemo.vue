<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open bare modal
    </GrButton>

    <GrModal v-model="open" size="sm">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Bare modal shell
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          `GrModal` отвечает за overlay, focus trap и panel sizing — содержимое вы собираете сами.
        </div>
        <GrButton class="justify-self-start" @click="open = false">
          Close
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>