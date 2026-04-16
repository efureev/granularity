<script setup lang="ts">
import IconInbox from '~icons/lucide/inbox'

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
  <div class="rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--card)] p-6 text-center">
    <div class="flex justify-center">
      <div class="h-12 w-12 rounded-[12px] bg-[var(--muted)] border border-[var(--brd)] flex items-center justify-center">
        <IconInbox class="h-6 w-6 text-[var(--muted-fg)]" aria-hidden="true" />
      </div>
    </div>

    <div class="mt-4 text-[14px] font-700">
      {{ props.title }}
    </div>

    <div v-if="props.description" class="mt-1 text-[13px] text-[var(--muted-fg)]">
      {{ props.description }}
    </div>

    <div v-if="$slots.default" class="mt-4 flex justify-center">
      <slot />
    </div>
  </div>
</template>