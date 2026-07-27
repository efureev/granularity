<script setup lang="ts">
import { GrButton, GrConfigProvider, GrInput } from '@feugene/granularity'
</script>

<template>
  <!-- Внешний провайдер: size = lg. -->
  <GrConfigProvider size="lg">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Outer provider — <code>size="lg"</code>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Large" class="max-w-[14rem]" aria-label="Large input" />
        <GrButton>Large</GrButton>
      </div>

      <!-- Вложенный провайдер переопределяет только size; остальное наследуется. -->
      <GrConfigProvider size="sm">
        <div class="grid gap-3 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Inner provider — <code>size="sm"</code>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <GrInput model-value="Small" class="max-w-[14rem]" aria-label="Small input" />
            <GrButton>Small</GrButton>
          </div>
        </div>
      </GrConfigProvider>
    </div>
  </GrConfigProvider>
</template>
