<script setup lang="ts">
import { DsCard, DsLink } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-3 p-4 text-sm">
    <div class="flex flex-wrap items-center gap-3">
      <DsLink href="#" size="md">
        Ready link
      </DsLink>
      <DsLink href="#" disabled size="md">
        Disabled link
      </DsLink>
      <DsLink href="#" underline="none" variant="muted" size="md">
        Muted helper link
      </DsLink>
    </div>

    <p class="text-[var(--muted-fg)]">
      Disabled mode рендерится как неинтерактивный текстовый элемент и сохраняет тот же layout внутри forms, cards и inline toolbars.
    </p>
  </DsCard>
</template>