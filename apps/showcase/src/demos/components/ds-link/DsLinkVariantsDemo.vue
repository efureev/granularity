<script setup lang="ts">
import { DsLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <DsLink href="#" variant="primary" size="md">
      Primary navigation link
    </DsLink>
    <DsLink href="#" variant="default" size="md">
      Default inline action
    </DsLink>
    <DsLink href="#" variant="muted" underline="always" size="md">
      Muted link with persistent underline
    </DsLink>
    <DsLink href="#" variant="danger" size="md">
      Destructive secondary action
    </DsLink>
  </div>
</template>