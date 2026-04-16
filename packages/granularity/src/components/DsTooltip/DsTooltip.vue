<script setup lang="ts">
import IconInfo from '~icons/lucide/info'

const props = withDefaults(
  defineProps<{
    text: string
    iconColor?: string
  }>(),
  {
    iconColor: 'var(--muted-fg)',
  },
)

const triggerStyle = {
  '--ds-tooltip-icon-color': props.iconColor,
}
</script>

<template>
  <span class="group relative inline-flex">
    <span
      tabindex="0"
      class="inline-flex items-center justify-center text-[var(--ds-tooltip-icon-color)] focus:outline-none"
      data-testid="ds-tooltip-trigger"
      :style="triggerStyle"
    >
      <slot>
        <IconInfo class="h-4 w-4" aria-hidden="true" />
      </slot>
    </span>

    <span
      role="tooltip"
      class="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--brd)] bg-[var(--popover)] px-2 py-1 text-[12px] text-[var(--popover-fg)] opacity-0 shadow-[var(--ds-shadow-1)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {{ props.text }}
    </span>
  </span>
</template>