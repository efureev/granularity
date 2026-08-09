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

    <!-- Модальный слой обязан иметь имя: заголовок здесь свёрстан в теле,
         поэтому имя отдаём пропом. Альтернатива — слот #title. -->
    <GrModal
      v-model="open"
      size="sm"
      aria-label="Bare modal shell"
    >
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          Bare modal shell
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          `GrModal` handles the overlay, focus trap and panel sizing — you assemble the content yourself.
        </div>
        <GrButton class="justify-self-start" @click="open = false">
          Close
        </GrButton>
      </div>
    </GrModal>
  </div>
</template>
