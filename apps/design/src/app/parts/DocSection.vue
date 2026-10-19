<script setup lang="ts">
defineProps<{
  title: string
  lead?: string
}>()
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)] tracking-[-0.01em]">
        {{ title }}
      </h2>
      <p v-if="lead" class="max-w-[76ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
        {{ lead }}
      </p>
    </div>
    <slot />
  </section>
</template>
