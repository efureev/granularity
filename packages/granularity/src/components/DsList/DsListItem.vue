<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="px-4 py-3 flex items-start justify-between gap-4">
    <div class="min-w-0">
      <div class="text-[13px] font-700">
        {{ title }}
      </div>
      <div v-if="description" class="text-[13px] ds-muted mt-0.5">
        {{ description }}
      </div>
    </div>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>