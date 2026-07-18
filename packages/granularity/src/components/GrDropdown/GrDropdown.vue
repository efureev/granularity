<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/internal/useFloating'
import { useEscapeToClose } from '../../composables/internal/useEscapeToClose'
import {
  grDropdownContentClass,
  grDropdownOriginClass,
  grDropdownWidthClass,
  type GrDropdownAlign,
  type GrDropdownWidth,
} from './grDropdownStyles'

export interface GrDropdownProps {
  /** Выравнивание панели относительно триггера. */
  align?: GrDropdownAlign
  /** Ширина панели (tailwind-токены `w-*` или `auto`). */
  width?: GrDropdownWidth
  /** Закрывать панель по клику внутри content. */
  closeOnContentClick?: boolean
  /** Дополнительные классы контейнера content. */
  contentClass?: string
  /** Куда телепортировать панель (`body` по умолчанию). */
  teleportTo?: string | HTMLElement
}

const props = withDefaults(defineProps<GrDropdownProps>(), {
  align: 'right',
  width: '48',
  closeOnContentClick: true,
  contentClass: '',
  teleportTo: 'body',
})

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const clickOutsideExclude = [() => panelEl.value]

// `align='right'` — правый край панели совпадает с правым краем триггера (bottom-end);
// `align='left'` — левые края (bottom-start); `align='center'` — floating-ui сам
// центрирует панель под триггером при обычном `'bottom'` без суффикса.
const placementByAlign: Record<GrDropdownAlign, 'bottom-start' | 'bottom-end' | 'bottom'> = {
  left: 'bottom-start',
  right: 'bottom-end',
  center: 'bottom',
}

const { floatingStyle, resolvedPlacement, update: updateFloatingPosition } = useFloating(
  rootEl,
  panelEl,
  open,
  {
    placement: () => placementByAlign[props.align],
    zIndexVar: '--gr-z-dropdown',
  },
)

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

useEscapeToClose(open, close)

watch(
  () => props.align,
  () => {
    if (open.value) updateFloatingPosition()
  },
)

const widthClass = computed(() => grDropdownWidthClass(props.width))

const contentClasses = computed(() => grDropdownContentClass(props.contentClass))

const panelClasses = computed(() => {
  return [widthClass.value, grDropdownOriginClass(resolvedPlacement.value)].filter(Boolean)
})

function onContentClick(): void {
  if (props.closeOnContentClick) {
    close()
  }
}
</script>

<template>
  <div data-ds-dropdown>
    <div
      ref="rootEl"
      v-click-outside="{ handler: close, enabled: open, exclude: clickOutsideExclude }"
      data-ds-dropdown-trigger
      class="inline-block max-w-full"
      @click="toggle"
    >
      <slot name="trigger" :open="open" :toggle="toggle" :close="close" />
    </div>

    <teleport :to="teleportTo">
      <transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelEl"
          data-ds-dropdown-panel
          :class="panelClasses"
          :style="floatingStyle"
          @click="onContentClick"
        >
          <div data-ds-dropdown-content :class="contentClasses">
            <slot name="content" :close="close" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
