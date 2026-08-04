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
import { computed, ref, useId } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'

import GrIcon from '../GrIcon'
import { useFloating } from '../../composables/useFloating'
import { useDismissible } from '../../composables/useDismissible'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { type GrTooltipSize, panelSizes, panelWidths, triggerIconSizes } from './grTooltipStyles'

import IconInfo from '~icons/lucide/info'

export interface GrTooltipProps {
  text: string
  /** Цвет триггер-иконки (CSS color). По умолчанию — `var(--gr-muted-fg)`. */
  iconColor?: string
  /** Размер панели и дефолтной триггер-иконки. */
  size?: GrTooltipSize
}

const props = withDefaults(defineProps<GrTooltipProps>(), {
  iconColor: 'var(--gr-muted-fg)',
  size: undefined,
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTooltip' })

const panelClass = computed(() => [
  panelSizes[resolvedSize.value],
  panelWidths[resolvedSize.value],
].join(' '))
const triggerIconSize = computed(() => triggerIconSizes[resolvedSize.value])

const tooltipId = `gr-tooltip-${useId()}`

const triggerStyle = computed(() => ({ color: props.iconColor }))

// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

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

useDismissible(open, hide)
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
        <GrIcon :size="triggerIconSize" aria-hidden="true">
          <IconInfo />
        </GrIcon>
      </slot>
    </span>

    <teleport to="body" :disabled="!teleportEnabled">
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
          class="pointer-events-none rounded-md border border-[var(--gr-brd)] bg-[var(--gr-popover)] text-[var(--gr-popover-fg)] shadow-[var(--gr-shadow-1)]"
          :class="panelClass"
          :style="floatingStyle"
        >
          {{ text }}
        </span>
      </transition>
    </teleport>
  </span>
</template>
