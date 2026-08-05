<script setup lang="ts">
import { GrButton, GrCard } from '@feugene/granularity'
</script>

<template>
  <!-- Отступ и раскладка тела — пропами карточки, а не `class` снаружи. -->
  <GrCard padding="md" body-class="grid gap-4">
    <div>
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Basic card
      </div>
      <div class="mt-1 text-sm text-[var(--gr-muted-fg)]">
        Карточка задаёт поверхность и отступы сама — потребителю остаётся содержимое.
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm">
        Primary action
      </GrButton>
      <GrButton size="sm" variant="outline">
        Secondary
      </GrButton>
    </div>
  </GrCard>
</template>
