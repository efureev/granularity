<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  lead?: string
}>()
</script>

<template>
  <header class="flex flex-col gap-3">
    <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] tracking-[0.08em] text-[var(--gr-muted-fg)] [text-transform:uppercase]">
      {{ eyebrow }}
    </p>
    <h1 class="text-[length:var(--gr-text-4xl)] font-600 leading-[1.15] tracking-[-0.02em]">
      {{ title }}
    </h1>
    <p v-if="lead" class="max-w-[72ch] text-[length:var(--gr-text-base)] leading-[var(--gr-leading-lg)] text-[var(--gr-muted-fg)]">
      {{ lead }}
    </p>
    <slot />
  </header>
</template>
