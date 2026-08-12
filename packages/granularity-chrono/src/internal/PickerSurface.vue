<script setup lang="ts">
import GrPopover from '@feugene/granularity/components/GrPopover'
import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'

import type { GrPickerSize } from './pickerFieldStyles'

/**
 * Поверхность пикера: панель в поповере либо на месте.
 *
 * Заведена ради `inline`. Без неё каждый пикер писал бы свою панель дважды —
 * в слоте поповера и рядом с ним, — и списки пропов у двух копий разъезжались
 * бы молча. Здесь панель остаётся одной разметкой, а `inline` решает лишь то,
 * во что она обёрнута.
 *
 * Заодно сюда переехала настройка поповера, одинаковая у всех пикеров:
 * открытие только программное (иначе клик по полю обрабатывался бы дважды),
 * без автофокуса на саму панель (фокус уводит пикер — в сетку или в колонку) и
 * без закрытия по клику внутри.
 */
export interface PickerSurfaceProps {
  /** Панель рисуется на месте: ни поля, ни поповера. */
  inline?: boolean
  open: boolean
  size: GrPickerSize
  placement: UseFloatingPlacement
  disabled?: boolean
  teleportTo?: string | HTMLElement
  /** Доступное имя панели. */
  panelLabel: string
}

withDefaults(defineProps<PickerSurfaceProps>(), {
  inline: false,
  disabled: false,
  teleportTo: undefined,
})

const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

defineSlots<{
  /** Поле пикера. В `inline` не рендерится вовсе. */
  trigger?: (props: { triggerProps: Record<string, unknown> }) => unknown
  /** Содержимое панели. */
  default?: () => unknown
}>()
</script>

<template>
  <div v-if="inline" data-gr-picker-inline>
    <slot />
  </div>

  <GrPopover
    v-else
    :open="open"
    :size="size"
    :placement="placement"
    :disabled="disabled"
    :teleport-to="teleportTo"
    :aria-label="panelLabel"
    :close-on-content-click="false"
    trigger="manual"
    :auto-focus="false"
    @update:open="emit('update:open', $event)"
  >
    <template #trigger="scope">
      <slot name="trigger" v-bind="scope" />
    </template>

    <template #content>
      <slot />
    </template>
  </GrPopover>
</template>
