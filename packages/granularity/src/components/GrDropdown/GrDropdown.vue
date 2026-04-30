<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import { vClickOutside } from '../../directives'
import {
  grDropdownAlignmentClass,
  grDropdownContentClass,
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
const panelStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
  zIndex: '2147483647',
})
let syncFrame = 0

function cancelPanelPositionSync(): void {
  if (typeof window === 'undefined') return
  if (!syncFrame) return

  window.cancelAnimationFrame(syncFrame)
  syncFrame = 0
}

function syncPanelPosition(): void {
  if (typeof window === 'undefined') return

  const root = rootEl.value
  if (!root) return

  const rootRect = root.getBoundingClientRect()
  const left = (() => {
    if (props.align === 'right') return rootRect.right
    if (props.align === 'center') return rootRect.left + (rootRect.width / 2)
    return rootRect.left
  })()

  panelStyle.value = {
    left: `${left}px`,
    top: `${rootRect.bottom + 8}px`,
    zIndex: '2147483647',
  }
}

function schedulePanelPositionSync(): void {
  if (typeof window === 'undefined') return
  if (syncFrame) return

  syncFrame = window.requestAnimationFrame(() => {
    syncFrame = 0

    if (open.value) {
      syncPanelPosition()
    }
  })
}

function bindPanelPositionListeners(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', schedulePanelPositionSync)
  window.addEventListener('scroll', schedulePanelPositionSync, true)
}

function unbindPanelPositionListeners(): void {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', schedulePanelPositionSync)
  window.removeEventListener('scroll', schedulePanelPositionSync, true)
}

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

function closeOnEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

watch(
  open,
  (isOpen) => {
    if (typeof document === 'undefined') return

    document.removeEventListener('keydown', closeOnEscape)
    unbindPanelPositionListeners()
    cancelPanelPositionSync()
    if (isOpen) document.addEventListener('keydown', closeOnEscape)

    if (!isOpen) return

    bindPanelPositionListeners()
    syncPanelPosition()
  },
  { immediate: true },
)

watch(
  () => props.align,
  () => {
    if (open.value) {
      schedulePanelPositionSync()
    }
  },
)

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', closeOnEscape)
  unbindPanelPositionListeners()
  cancelPanelPositionSync()
})

const widthClass = computed(() => grDropdownWidthClass(props.width))

const contentClasses = computed(() => grDropdownContentClass(props.contentClass))

const panelClasses = computed(() => {
  return ['fixed z-50', widthClass.value, grDropdownAlignmentClass(props.align)].filter(Boolean)
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
          :style="panelStyle"
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
