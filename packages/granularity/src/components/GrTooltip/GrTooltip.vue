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
 * `placement` задаёт предпочтительную сторону, `flip` переворачивает подсказку,
 * если места не хватает, а `shift` не даёт ей вылезти за края viewport.
 */
import { computed, onMounted, onUnmounted, onUpdated, ref, useId, useSlots, watchEffect } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'

import { vClickOutside } from '../../directives'
import GrIcon from '../GrIcon'
import { useFloating, type UseFloatingPlacement } from '../../composables/useFloating'
import { useDismissible } from '../../composables/useDismissible'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { type GrTooltipSize, panelSizes, panelWidths, triggerIconSizes } from './grTooltipStyles'

import IconInfo from '~icons/lucide/info'

export type GrTooltipPlacement = UseFloatingPlacement

export interface GrTooltipProps {
  /** Текст подсказки. Разметка вместо текста — слот `#content`. */
  text?: string
  /** Цвет триггер-иконки (CSS color). По умолчанию — `var(--gr-muted-fg)`. */
  iconColor?: string
  /** Размер панели и дефолтной триггер-иконки. */
  size?: GrTooltipSize
  /** Предпочтительная сторона панели; `flip` может её изменить. */
  placement?: GrTooltipPlacement
  /** Зазор между триггером и панелью, px. */
  offsetPx?: number
  /** Задержка перед показом, мс. Спасает от мигания при проведении курсором по панели кнопок. */
  openDelay?: number
  /** Задержка перед скрытием, мс. */
  closeDelay?: number
  /** Подсказка не показывается ничем — ни курсором, ни фокусом, ни `v-model:open`. */
  disabled?: boolean
  /** Управляемая видимость. Без неё компонент ведёт видимость сам. */
  open?: boolean
}

const props = withDefaults(defineProps<GrTooltipProps>(), {
  text: undefined,
  iconColor: 'var(--gr-muted-fg)',
  size: undefined,
  placement: 'top',
  offsetPx: undefined,
  openDelay: 0,
  closeDelay: 0,
  disabled: false,
  open: undefined,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

defineSlots<{
  /** Триггер. По умолчанию — иконка info. */
  default?: () => unknown
  /** Содержимое подсказки; заменяет проп `text`. */
  content?: () => unknown
}>()

const slots = useSlots()

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

const uncontrolledOpen = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

/** Показывать нечего — пустая панель хуже отсутствующей. */
const hasContent = computed(() => Boolean(slots.content) || Boolean(props.text))

const open = computed<boolean>({
  get: () => {
    if (props.disabled || !hasContent.value) return false
    return props.open ?? uncontrolledOpen.value
  },
  set: (next) => {
    uncontrolledOpen.value = next
    emit('update:open', next)
  },
})

const { floatingStyle } = useFloating(triggerEl, panelEl, open, {
  placement: () => props.placement,
  // Геттер, а не значение: `useFloating` читает опцию на каждом пересчёте, и
  // так проп остаётся живым, а не замирает на моменте setup.
  get offsetPx() { return props.offsetPx },
  zIndexVar: '--gr-z-tooltip',
})

let delayTimer: ReturnType<typeof setTimeout> | undefined

function schedule(next: boolean, delayMs: number): void {
  clearTimeout(delayTimer)

  if (delayMs <= 0) {
    open.value = next
    return
  }

  delayTimer = setTimeout(() => { open.value = next }, delayMs)
}

function show(): void {
  if (props.disabled) return
  schedule(true, props.openDelay)
}

function hide(): void {
  schedule(false, props.closeDelay)
}

/** Escape и клик вне закрывают мгновенно: задержка тут читалась бы как залипание. */
function dismiss(): void {
  clearTimeout(delayTimer)
  if (open.value) open.value = false
}

// Нужен только тач-режиму: курсор и фокус закрывают подсказку сами.
const dismissOnOutside = computed(() => ({ handler: dismiss, enabled: open.value }))

/**
 * На тач-устройствах hover не существует, а фокус по тапу не гарантирован —
 * без этого подсказка там недоступна вовсе. Тап по триггеру переключает
 * панель, тап вне — закрывает (`vClickOutside`).
 */
function onTouch(): void {
  if (open.value) dismiss()
  else show()
}

onUnmounted(() => clearTimeout(delayTimer))

useDismissible(open, dismiss)

const FOCUSABLE_SELECTOR = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'

/**
 * Типовое употребление — подсказка у кнопки. Фокусируемая обёртка вокруг
 * фокусируемого контрола дала бы два таб-стопа на один визуальный элемент,
 * поэтому обёртка забирает `tabindex` только когда в слоте фокусироваться
 * нечему (текст, иконка). Разметку слота пишет потребитель, привязать к ней
 * `aria-describedby` из шаблона нельзя — отсюда единственная точка, где атрибут
 * ставится вручную.
 */
const slotFocusableEl = ref<HTMLElement | null>(null)

function syncSlotFocusable(): void {
  slotFocusableEl.value = slots.default
    ? triggerEl.value?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? null
    : null
}

onMounted(syncSlotFocusable)
onUpdated(syncSlotFocusable)

watchEffect((onCleanup) => {
  const el = slotFocusableEl.value
  if (!el) return

  el.setAttribute('aria-describedby', tooltipId)
  onCleanup(() => el.removeAttribute('aria-describedby'))
})

const wrapperTabindex = computed(() => (slotFocusableEl.value ? undefined : 0))
const wrapperDescribedBy = computed(() => (slotFocusableEl.value ? undefined : tooltipId))
</script>

<template>
  <span
    v-click-outside="dismissOnOutside"
    data-gr-tooltip
    class="relative inline-flex"
  >
    <span
      ref="triggerEl"
      data-gr-tooltip-trigger
      data-testid="gr-tooltip-trigger"
      :tabindex="wrapperTabindex"
      :aria-describedby="wrapperDescribedBy"
      class="inline-flex items-center justify-center focus:outline-none"
      :style="triggerStyle"
      @mouseenter="show"
      @mouseleave="hide"
      @focusin="show"
      @focusout="hide"
      @touchstart.passive="onTouch"
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
          <slot name="content">{{ text }}</slot>
        </span>
      </transition>
    </teleport>
  </span>
</template>
