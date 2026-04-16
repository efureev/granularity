<script setup lang="ts">
const props = withDefaults(defineProps<{
  height?: string
  width?: string
  rounded?: string
}>(), {
  height: '12px',
  width: '100%',
  rounded: '9999px',
})
</script>

<template>
  <div
    class="animate-pulse bg-[var(--muted)] border border-[var(--brd)]"
    :style="{ height: props.height, width: props.width, borderRadius: props.rounded }"
    aria-hidden="true"
  />
</template>