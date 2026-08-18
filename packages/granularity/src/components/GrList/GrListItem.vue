<script setup lang="ts">
import { computed, markRaw, useSlots, watch, type Component } from 'vue'

import {
  grListItemPaddingClass,
  itemDescriptionClass,
  itemDisabledClass,
  itemHoverClass,
  itemInteractiveClass,
  itemLayoutClass,
  itemTitleClass,
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

export interface GrListItemEmits {
  (e: 'click', event: MouseEvent): void
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

const emit = defineEmits<GrListItemEmits>()

const slots = useSlots()

const hasTitle = computed(() => !!slots.title || !!props.title)
const hasDescription = computed(() => !!slots.description || !!props.description)

const isInteractive = computed(() => !props.disabled && (!!props.as || !!props.href || props.clickable))

/**
 * `role="listitem"` остаётся на обёртке, а строка целиком — вложенный элемент:
 * `<a role="listitem">` потерял бы роль ссылки, а интерактив снаружи разорвал бы
 * связку `list` → `listitem`. Обычная строка идёт по той же схеме, чтобы
 * разметка содержимого была написана один раз, а не по копии на ветку.
 */
const rowTag = computed<string | Component>(() => {
  if (!isInteractive.value)
    return 'div'

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
  // `disabled` сюда попадает вместе с обычной строкой: и то и другое —
  // не-интерактив, а кликов не эмитит ни один.
  if (!isInteractive.value)
    return

  emit('click', event)
}

/** Теги, попадающие в таб-порядок сами. `<a>` — только со ссылкой. */
function isFocusableTag(tag: string): boolean {
  return tag === 'button' || (tag === 'a' && !!props.href)
}

if (__GR_DEV__) {
  watch(
    () => [isInteractive.value, props.as] as const,
    ([interactive, as]) => {
      // Компонент из `as` (`RouterLink`, Inertia `Link`) рендерит `<a>`, но узнать
      // это до рендера нельзя — предупреждаем только по явно названному тегу.
      if (!interactive || typeof as !== 'string' || isFocusableTag(as)) return

      console.warn(
        `[granularity] GrListItem: as="${as}" не попадает в таб-порядок — строка кликается `
        + 'мышью, но не с клавиатуры. Возьмите тег, умеющий фокус (`button`, `a` со ссылкой), '
        + 'или компонент роутера.',
      )
    },
    { immediate: true },
  )
}
</script>

<template>
  <div
    data-gr-list-item
    role="listitem"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <component
      :is="rowTag"
      :data-gr-list-item-action="isInteractive ? '' : undefined"
      :type="rowTag === 'button' ? 'button' : undefined"
      :href="isInteractive ? href : undefined"
      :class="rowClass"
      @click="onClick"
    >
      <div v-if="$slots.prefix" class="shrink-0">
        <slot name="prefix" />
      </div>
      <div class="min-w-0 flex-1">
        <div v-if="hasTitle" :class="itemTitleClass">
          <slot name="title">
{{ title }}
</slot>
        </div>
        <div
          v-if="hasDescription"
          :class="itemDescriptionClass"
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
</template>
