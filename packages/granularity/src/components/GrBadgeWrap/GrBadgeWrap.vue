<script setup lang="ts">
const props = withDefaults(defineProps<{
  value?: string | number
  dot?: boolean
}>(), {
  value: undefined,
  dot: false,
})
</script>

<template>
  <span class="relative inline-flex">
    <slot />

    <span
      v-if="props.dot"
      class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--ds-danger)]"
      aria-hidden="true"
    />

    <span
      v-else-if="props.value !== undefined"
      class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-[var(--ds-danger)] text-[var(--destructive-fg)] text-[11px] font-700 inline-flex items-center justify-center"
      aria-hidden="true"
    >
      {{ props.value }}
    </span>
  </span>
</template>