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
<style>
[data-ds-button-group] {
  --ds-button-group-radius: 0.375rem;
}

[data-ds-button-group] > [data-ds-button] {
  border-radius: 0;
  position: relative;
}

[data-ds-button-group] > [data-ds-button] + [data-ds-button] {
  margin-inline-start: -1px;
}

[data-ds-button-group] > [data-ds-button]:hover,
[data-ds-button-group] > [data-ds-button]:focus-visible {
  z-index: 1;
}

[data-ds-button-group] > [data-ds-button]:first-child {
  border-start-start-radius: var(--ds-button-group-radius);
  border-end-start-radius: var(--ds-button-group-radius);
}

[data-ds-button-group] > [data-ds-button]:last-child {
  border-start-end-radius: var(--ds-button-group-radius);
  border-end-end-radius: var(--ds-button-group-radius);
}

</style>