<script setup lang="ts">
defineProps<{
  name: string
  value?: string
  /** Образец текста поверх заливки — для пар «подпись на заливке». */
  sample?: string
}>()
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <span
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--gr-radius-md)] border border-[color-mix(in_srgb,var(--gr-fg)_14%,transparent)] text-[length:var(--gr-text-sm)] font-600 leading-none"
      :style="{ background: `var(${name})`, color: sample }"
      aria-hidden="true"
    >
      <template v-if="sample">Aa</template>
    </span>
    <span class="flex min-w-0 flex-col">
      <code class="truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ name }}</code>
      <span v-if="value" class="truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ value }}</span>
    </span>
  </div>
</template>
