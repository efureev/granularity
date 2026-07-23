<script setup lang="ts">
import { GrLink, type GrLinkTone } from '@feugene/granularity'

const tones: GrLinkTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']
</script>

<template>
  <div class="grid gap-5 text-sm">
    <div class="grid gap-2">
      <div class="text-xs font-600 uppercase tracking-wide text-[var(--gr-muted-fg)]">
        variant="default" — colored by tone
      </div>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <GrLink v-for="tone in tones" :key="tone" href="#" :tone="tone" size="md">
          {{ tone }}
        </GrLink>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-xs font-600 uppercase tracking-wide text-[var(--gr-muted-fg)]">
        variant="muted" — subdued, tone appears on hover
      </div>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <GrLink v-for="tone in tones" :key="tone" href="#" :tone="tone" variant="muted" underline="always" size="md">
          {{ tone }}
        </GrLink>
      </div>
    </div>
  </div>
</template>
