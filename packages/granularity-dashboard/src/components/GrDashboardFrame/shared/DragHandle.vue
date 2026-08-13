<script setup lang="ts">
import { computed } from 'vue'

import { dragHandleClass, dragHandleGrabbedClass } from '../frameStyles'

const props = withDefaults(defineProps<{
  label: string
  /** Виджет взят с клавиатуры: ручка держит фокус и меняет вид. */
  grabbed?: boolean
  tabindex?: number
  disabled?: boolean
}>(), { grabbed: false, tabindex: 0, disabled: false })

const classes = computed(() => [dragHandleClass, props.grabbed ? dragHandleGrabbedClass : ''])
</script>

<template>
  <button
    type="button"
    data-gr-dashboard-drag-handle
    :class="classes"
    :aria-label="label"
    :aria-pressed="grabbed ? 'true' : 'false'"
    :tabindex="disabled ? -1 : tabindex"
    :disabled="disabled"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <circle cx="6" cy="4" r="1.4" />
        <circle cx="10" cy="4" r="1.4" />
        <circle cx="6" cy="8" r="1.4" />
        <circle cx="10" cy="8" r="1.4" />
        <circle cx="6" cy="12" r="1.4" />
        <circle cx="10" cy="12" r="1.4" />
      </g>
    </svg>
  </button>
</template>
