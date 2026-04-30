<script setup lang="ts">
/**
 * GrTooltip — DS-примитив инлайн-подсказки на hover/focus.
 *
 * По умолчанию триггер — иконка info; можно заменить через слот.
 * A11y: `<span role="tooltip">` связывается с триггером через
 * уникальный `aria-describedby`, чтобы скринридер озвучил подсказку
 * при фокусе.
 *
 * Ограничения: без автопозиционирования/flip — подсказка всегда
 * сверху по центру триггера.
 */
import { computed, useId } from 'vue'

import GrIcon from '../GrIcon'

import IconInfo from '~icons/lucide/info'

export interface GrTooltipProps {
  text: string
  /** Цвет триггер-иконки (CSS color). По умолчанию — `var(--muted-fg)`. */
  iconColor?: string
}

const props = withDefaults(defineProps<GrTooltipProps>(), {
  iconColor: 'var(--muted-fg)',
})

const tooltipId = `ds-tooltip-${useId()}`

const triggerStyle = computed(() => ({ color: props.iconColor }))
</script>

<template>
  <span data-ds-tooltip class="group relative inline-flex">
    <span
      data-ds-tooltip-trigger
      data-testid="ds-tooltip-trigger"
      tabindex="0"
      :aria-describedby="tooltipId"
      class="inline-flex items-center justify-center focus:outline-none"
      :style="triggerStyle"
    >
      <slot>
        <GrIcon size="sm" aria-hidden="true">
          <IconInfo />
        </GrIcon>
      </slot>
    </span>
    <span
      :id="tooltipId"
      role="tooltip"
      class="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--brd)] bg-[var(--popover)] px-2 py-1 text-[12px] text-[var(--popover-fg)] opacity-0 shadow-[var(--ds-shadow-1)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {{ text }}
    </span>
  </span>
</template>
