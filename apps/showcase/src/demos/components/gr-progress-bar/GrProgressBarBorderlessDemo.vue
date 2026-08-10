<script setup lang="ts">
import { GrCard, GrProgressBar } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <GrCard padding="md" body-class="grid gap-2">
      <div class="text-sm font-600">
        С рамкой
      </div>
      <GrProgressBar :value="64" show-value aria-label="Bordered progress" />
      <div class="text-xs text-[var(--gr-muted-fg)]">
        Дефолт: трек обведён `--gr-brd` и виден на любом фоне.
      </div>
    </GrCard>

    <GrCard padding="md" body-class="grid gap-2">
      <div class="text-sm font-600">
        borderless
      </div>
      <GrProgressBar :value="64" borderless show-value aria-label="Borderless progress" />
      <div class="text-xs text-[var(--gr-muted-fg)]">
        Внутри карточки рамка трека становится второй рамкой рядом с её собственной.
      </div>
    </GrCard>
  </div>
</template>
