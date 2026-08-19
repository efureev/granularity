<script setup lang="ts">
/**
 * Кнопка настроек виджета.
 *
 * `aria-expanded` намеренно нет: она описывает раскрывающийся элемент, а
 * модальное окно из кнопки не «раскрывается» — за него отвечает `aria-haspopup`.
 */
import { settingsButtonClass } from '../frameStyles'

withDefaults(defineProps<{
  label: string
  disabled?: boolean
}>(), { disabled: false })
</script>

<template>
  <button
    type="button"
    data-gr-dashboard-settings-button
    :class="settingsButtonClass"
    :aria-label="label"
    aria-haspopup="dialog"
    :disabled="disabled"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
        <circle cx="8" cy="8" r="2.1" />
        <path d="M8 1.6l1 1.7 1.9-.5.6 1.9 1.9.6-.5 1.9 1.2 1.5-1.2 1.5.5 1.9-1.9.6-.6 1.9-1.9-.5-1 1.7-1-1.7-1.9.5-.6-1.9-1.9-.6.5-1.9L1.4 8l1.2-1.5-.5-1.9 1.9-.6.6-1.9 1.9.5z" />
      </g>
    </svg>
  </button>
</template>
