<script setup lang="ts">
import { computed, type Component } from 'vue'

import { dsLoadingRootClass } from './dsLoadingStyles'

import IconLoader from '~icons/lucide/loader-circle'

const DEFAULT_LOADING_TEXT = 'Loading...'

const props = withDefaults(
  defineProps<{
    text?: string
    spinner?: Component
    spinnerClass?: string
    animated?: boolean
    background?: string
    fullscreen?: boolean
    zIndex?: number
    customClass?: string
  }>(),
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

const displayText = computed(() => {
  if (props.text !== undefined) {
    return props.text
  }

  return DEFAULT_LOADING_TEXT
})

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

const spinnerClass = computed(() => props.spinnerClass)
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
        v-if="props.animated"
        :is="Spinner"
        class="ds-loading__spinner ds-loading__spinner--animated h-7 w-7 text-[var(--muted-fg)]"
        :class="spinnerClass"
        aria-hidden="true"
      />
      <component
        v-else
        :is="Spinner"
        class="ds-loading__spinner h-7 w-7 text-[var(--muted-fg)]"
        :class="spinnerClass"
        aria-hidden="true"
      />
      <div v-if="displayText" class="text-sm ds-muted">
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