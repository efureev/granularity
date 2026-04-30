<script setup lang="ts">
type LabelClass = string | string[] | Record<string, boolean>

const props = withDefaults(
  defineProps<{
    label?: string
    forId?: string
    error?: string
    labelClass?: LabelClass
  }>(),
  {
    label: undefined,
    forId: undefined,
    error: undefined,
    labelClass: undefined,
  },
)
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="props.label"
      :for="props.forId"
      class="text-sm text-[var(--muted-fg)]"
      :class="props.labelClass"
    >
      {{ props.label }}
    </label>
    <slot />
    <div v-if="props.error" class="text-sm text-[var(--ds-danger)]">
      {{ props.error }}
    </div>
  </div>
</template>
