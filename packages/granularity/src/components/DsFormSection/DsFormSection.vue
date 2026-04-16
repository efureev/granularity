<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: undefined,
  },
)
</script>

<template>
  <section class="grid gap-4">
    <div>
      <div class="text-[14px] font-700">
        {{ props.title }}
      </div>
      <div v-if="props.description" class="mt-1 text-[13px] ds-muted">
        {{ props.description }}
      </div>
    </div>
    <slot />
  </section>
</template>