<script setup lang="ts">
import { computed, markRaw, useSlots, type Component } from 'vue'

import {
  grListItemPaddingClass,
  itemDisabledClass,
  itemHoverClass,
  itemInteractiveClass,
  itemLayoutClass,
  type GrListItemDensity,
} from './grListStyles'

export type { GrListItemDensity } from './grListStyles'

export interface GrListItemProps {
  /** Заголовок строки. Если передан слот `#title`, проп игнорируется. */
  title?: string
  /** Описание под заголовком. Если передан слот `#description`, проп игнорируется. */
  description?: string
  /** Плотность вертикальных отступов: `regular` — 12px, `compact` — 8px. */
  density?: GrListItemDensity
  /** Ссылка: строка становится `<a>`. */
  href?: string
  /** Свой корневой тег строки (`RouterLink`, `Link` от Inertia). Сильнее `href`. */
  as?: string | Component
  /** Кликабельная строка без ссылки — `<button>` с событием `click`. */
  clickable?: boolean
  /** Подсветка при наведении без интерактивности. */
  hoverable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<GrListItemProps>(), {
  title: undefined,
  description: undefined,
  density: 'regular',
  href: undefined,
  as: undefined,
  clickable: false,
  hoverable: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()

const hasTitle = computed(() => !!slots.title || !!props.title)
const hasDescription = computed(() => !!slots.description || !!props.description)

const isInteractive = computed(() => !props.disabled && (!!props.as || !!props.href || props.clickable))

/**
 * `role="listitem"` остаётся на обёртке, а интерактивным становится вложенный
 * элемент во всю строку: `<a role="listitem">` потерял бы роль ссылки, а
 * интерактив снаружи разорвал бы связку `list` → `listitem`.
 */
const interactiveTag = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)

  return props.href ? 'a' : 'button'
})

const rowClass = computed(() => [
  itemLayoutClass,
  grListItemPaddingClass(props.density),
  isInteractive.value ? `${itemInteractiveClass} ${itemHoverClass}` : '',
  !isInteractive.value && props.hoverable && !props.disabled ? itemHoverClass : '',
  props.disabled ? itemDisabledClass : '',
].filter(Boolean).join(' '))

function onClick(event: MouseEvent): void {
  if (props.disabled)
    return

  emit('click', event)
}
</script>

<template>
  <div v-if="isInteractive" data-gr-list-item role="listitem">
    <component
      :is="interactiveTag"
      data-gr-list-item-action
      :type="interactiveTag === 'button' ? 'button' : undefined"
      :href="interactiveTag === 'a' ? href : undefined"
      :class="rowClass"
      @click="onClick"
    >
      <div v-if="$slots.prefix" class="shrink-0">
        <slot name="prefix" />
      </div>
      <div class="min-w-0 flex-1">
        <div v-if="hasTitle" class="text-[13px] font-700">
          <slot name="title">
{{ title }}
</slot>
        </div>
        <div
          v-if="hasDescription"
          class="text-[13px] text-[var(--gr-muted-fg)] mt-0.5"
        >
          <slot name="description">
{{ description }}
</slot>
        </div>
      </div>
      <div v-if="$slots.default" class="shrink-0">
        <slot />
      </div>
    </component>
  </div>

  <div
    v-else
    data-gr-list-item
    role="listitem"
    :class="rowClass"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div v-if="$slots.prefix" class="shrink-0">
      <slot name="prefix" />
    </div>
    <div class="min-w-0 flex-1">
      <div v-if="hasTitle" class="text-[13px] font-700">
        <slot name="title">
{{ title }}
</slot>
      </div>
      <div
        v-if="hasDescription"
        class="text-[13px] text-[var(--gr-muted-fg)] mt-0.5"
      >
        <slot name="description">
{{ description }}
</slot>
      </div>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>
