<script setup lang="ts">
/**
 * GrTooltip — GR-примитив инлайн-подсказки на hover/focus.
 *
 * По умолчанию триггер — иконка info; можно заменить через слот.
 * A11y:
 * - `role="tooltip"` связывается с триггером через уникальный `aria-describedby`;
 * - подсказка закрывается по `Escape` (WCAG 1.4.13 «Content on Hover or Focus» —
 *   dismissible без необходимости двигать курсор/фокус);
 * - панель не интерактивна (`pointer-events-none`), поэтому «hoverable»-требование
 *   того же критерия неприменимо — навести курсор на саму подсказку невозможно.
 *
 * Позиционирование — через общий `useFloating` (см. `composables/internal`):
 * по умолчанию сверху по центру, но `flip` переворачивает подсказку вниз, если
 * места над триггером не хватает, а `shift` не даёт ей вылезти за края viewport.
 */
import { computed, onUnmounted, ref, useId, watch } from 'vue'

import GrIcon from '../GrIcon'
import { useFloating } from '../../composables/internal/useFloating'

import IconInfo from '~icons/lucide/info'

export interface GrTooltipProps {
  text: string
  /** Цвет триггер-иконки (CSS color). По умолчанию — `var(--muted-fg)`. */
  iconColor?: string
}

const props = withDefaults(defineProps<GrTooltipProps>(), {
  iconColor: 'var(--muted-fg)',
})

const tooltipId = `gr-tooltip-${useId()}`

const triggerStyle = computed(() => ({ color: props.iconColor }))

const isClient = typeof window !== 'undefined'

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

const { floatingStyle } = useFloating(triggerEl, panelEl, open, {
  placement: 'top',
  zIndexVar: '--gr-z-tooltip',
})

function show(): void {
  open.value = true
}

function hide(): void {
  open.value = false
}

function closeOnEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') hide()
}

watch(
  open,
  (isOpen) => {
    if (typeof document === 'undefined') return

    document.removeEventListener('keydown', closeOnEscape)
    if (isOpen) document.addEventListener('keydown', closeOnEscape)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <span data-gr-tooltip class="relative inline-flex">
    <span
      ref="triggerEl"
      data-gr-tooltip-trigger
      data-testid="gr-tooltip-trigger"
      tabindex="0"
      :aria-describedby="tooltipId"
      class="inline-flex items-center justify-center focus:outline-none"
      :style="triggerStyle"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
    >
      <slot>
        <GrIcon size="sm" aria-hidden="true">
          <IconInfo />
        </GrIcon>
      </slot>
    </span>

    <teleport to="body" :disabled="!isClient">
      <transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <span
          v-show="open"
          :id="tooltipId"
          ref="panelEl"
          role="tooltip"
          data-gr-tooltip-panel
          class="pointer-events-none max-w-[280px] rounded-md border border-[var(--brd)] bg-[var(--popover)] px-2 py-1 text-[12px] text-[var(--popover-fg)] shadow-[var(--gr-shadow-1)]"
          :style="floatingStyle"
        >
          {{ text }}
        </span>
      </transition>
    </teleport>
  </span>
</template>
