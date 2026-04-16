<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
  }>(),
  {
    ariaLabel: undefined,
  },
)
</script>

<template>
  <div
    data-ds-button-group
    class="inline-flex items-stretch"
    role="group"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>