<script setup lang="ts">
import { resizeHandleClass } from '../frameStyles'

/**
 * Ручка растягивания — обычная кнопка с говорящим именем.
 *
 * `aria-valuenow` и соседи здесь недопустимы: они разрешены ролям `slider`,
 * `spinbutton`, `separator` и `progressbar`, а ни одна из них не описывает
 * изменение размера **по двум осям** (axe: `aria-allowed-attr`). Текущий размер
 * поэтому живёт в имени кнопки, а каждое изменение объявляется в живой регион.
 */
withDefaults(defineProps<{
  label: string
  disabled?: boolean
}>(), { disabled: false })
</script>

<template>
  <button
    type="button"
    data-gr-dashboard-resize-handle
    :class="resizeHandleClass"
    :aria-label="label"
    :tabindex="disabled ? -1 : 0"
    :disabled="disabled"
  />
</template>
