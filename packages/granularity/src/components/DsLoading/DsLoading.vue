<script setup lang="ts">
import { computed, type Component } from 'vue'

import IconLoader from '~icons/lucide/loader-circle'

import { dsLoadingRootClass } from './dsLoadingStyles'

const DEFAULT_LOADING_TEXT = 'Loading...'

/**
 * Props for {@link DsLoading}.
 * Overlay primitive that renders a centered spinner with optional text above sibling content.
 * Use `fullscreen` to cover the whole viewport, otherwise overlays the nearest positioned ancestor.
 */
export interface DsLoadingProps {
  /** Text under the spinner. Pass an empty string to hide the text entirely. Defaults to `'Loading...'`. */
  text?: string
  /** Custom spinner component (rendered instead of the default loader icon). */
  spinner?: Component
  /** Extra classes for the spinner element. */
  spinnerClass?: string
  /** When `true` (default), the default spinner rotates via `@keyframes ds-loading-spin`. */
  animated?: boolean
  /** Custom CSS `background-color`. When set, disables the default `bg-black/25` dim. */
  background?: string
  /** Cover the whole viewport (`position: fixed`) instead of the nearest positioned ancestor. */
  fullscreen?: boolean
  /** Custom `z-index`. */
  zIndex?: number
  /** Extra classes appended to the overlay root. */
  customClass?: string
}

const props = withDefaults(
  defineProps<DsLoadingProps>(),
  {
    text: undefined,
    spinner: undefined,
    spinnerClass: undefined,
    animated: true,
    background: undefined,
    fullscreen: false,
    zIndex: undefined,
    customClass: undefined,
  },
)

const Spinner = computed(() => props.spinner ?? IconLoader)

const displayText = computed(() => props.text ?? DEFAULT_LOADING_TEXT)

const rootClass = computed(() => {
  return dsLoadingRootClass({
    fullscreen: props.fullscreen,
    hasBackground: props.background !== undefined,
    customClass: props.customClass,
  })
})

const rootStyle = computed(() => {
  return {
    backgroundColor: props.background,
    zIndex: props.zIndex != null ? String(props.zIndex) : undefined,
  } as Record<string, string | undefined>
})

const spinnerClassName = computed(() => props.spinnerClass)
</script>

<template>
  <div
    data-ds-loading
    class="flex items-center justify-center cursor-wait select-none pointer-events-auto"
    :class="rootClass"
    :style="rootStyle"
    role="status"
    aria-live="polite"
  >
    <div class="flex flex-col items-center justify-center gap-2 px-4 text-center">
      <component
        :is="Spinner"
        data-ds-loading-spinner
        class="ds-loading__spinner h-7 w-7 text-[var(--muted-fg)]"
        :class="[animated ? 'ds-loading__spinner--animated' : '', spinnerClassName]"
        aria-hidden="true"
      />
      <div v-if="displayText" data-ds-loading-text class="text-sm text-[var(--muted-fg)]">
        {{ displayText }}
      </div>
    </div>
  </div>
</template>

<style>
@keyframes ds-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
.ds-loading__spinner--animated {
  transform-origin: center;
  animation: ds-loading-spin 1s linear infinite;
}
</style>
