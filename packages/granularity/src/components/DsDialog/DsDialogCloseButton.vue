<script setup lang="ts">
import DsButton from '../DsButton/DsButton.vue'

import IconClose from '~icons/lucide/x'

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <DsButton
    data-ds-dialog-close
    variant="ghost"
    size="sm"
    square
    aria-label="Close"
    @click="$emit('click')"
  >
    <IconClose class="h-4 w-4" aria-hidden="true" />
  </DsButton>
</template>