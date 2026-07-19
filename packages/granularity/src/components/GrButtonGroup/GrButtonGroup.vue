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
      data-gr-button-group
      class="inline-flex items-stretch"
      role="group"
      :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>
<style>
[data-gr-button-group] {
  --gr-button-group-radius: 0.375rem;
}

[data-gr-button-group] > [data-gr-button] {
  border-radius: 0;
  position: relative;
}

[data-gr-button-group] > [data-gr-button] + [data-gr-button] {
  margin-inline-start: -1px;
}

[data-gr-button-group] > [data-gr-button]:hover,
[data-gr-button-group] > [data-gr-button]:focus-visible {
  z-index: 1;
}

[data-gr-button-group] > [data-gr-button]:first-child {
  border-start-start-radius: var(--gr-button-group-radius);
  border-end-start-radius: var(--gr-button-group-radius);
}

[data-gr-button-group] > [data-gr-button]:last-child {
  border-start-end-radius: var(--gr-button-group-radius);
  border-end-end-radius: var(--gr-button-group-radius);
}

</style>