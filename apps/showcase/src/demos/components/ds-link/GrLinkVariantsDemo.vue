<script setup lang="ts">
import {GrLink} from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="#" variant="primary" size="md">
      Primary navigation link
    </GrLink>
    <GrLink href="#" variant="default" size="md">
      Default inline action
    </GrLink>
    <GrLink href="#" variant="muted" underline="always" size="md">
      Muted link with persistent underline
    </GrLink>
    <GrLink href="#" variant="muted-primary" underline="always" size="md">
      Muted link with Primary on hover with persistent underline
    </GrLink>
    <GrLink href="#" variant="danger" size="md">
      Destructive secondary action
    </GrLink>
  </div>
</template>