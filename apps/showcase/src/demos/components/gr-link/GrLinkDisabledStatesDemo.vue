<script setup lang="ts">
import { GrCard, GrLink } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-3 p-4 text-sm">
    <div class="flex flex-wrap items-center gap-3">
      <GrLink href="#" size="md">
        Ready link
      </GrLink>
      <GrLink href="#" disabled size="md">
        Disabled link
      </GrLink>
      <GrLink href="#" underline="none" variant="muted" size="md">
        Muted helper link
      </GrLink>
    </div>

    <p class="text-[var(--muted-fg)]">
      Disabled mode рендерится как неинтерактивный текстовый элемент и сохраняет тот же layout внутри forms, cards и inline toolbars.
    </p>
  </GrCard>
</template>