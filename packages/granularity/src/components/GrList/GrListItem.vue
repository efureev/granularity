<script setup lang="ts">
import { computed, markRaw, useSlots, watch, type Component } from 'vue'

import { isFocusableTag } from '../shared/polymorphicRoot'

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
  /**
   * Свой корневой тег строки: компонент-ссылка (`RouterLink`, `Link` от Inertia)
   * или тег ради разметки. Сильнее `href`. Неинтерактивный тег — только замена
   * `div`: ни подсветки, ни кольца фокуса.
   */
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

/** Тег, который заказал потребитель. Интерактивность из него не следует. */
const requestedTag = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)

  if (props.href)
    return 'a'

  return props.clickable ? 'button' : 'div'
})

/**
 * Строка попадает в таб-порядок сама. Компонент-ссылка (`RouterLink`, Inertia
 * `Link`) рендерит `<a>`, но узнать это до рендера нельзя — считаем, что умеет.
 */
const isFocusableRow = computed(() => (
  typeof requestedTag.value === 'string'
    ? isFocusableTag(requestedTag.value, !!props.href)
    : true
))

/**
 * Потребитель попросил строку-действие. Отсюда клик, курсор и маркер контрола —
 * но не кольцо фокуса: `clickable` на теге вне таб-порядка остаётся действием
 * для мыши, и гасить его молча значило бы сломать работающий код.
 */
const isAction = computed(() => !props.disabled
  && (props.clickable || !!props.href || isFocusableRow.value))

/** Действие, до которого можно добраться с клавиатуры. */
const isInteractive = computed(() => isAction.value && isFocusableRow.value)

/**
 * `role="listitem"` остаётся на обёртке, а строка целиком — вложенный элемент:
 * `<a role="listitem">` потерял бы роль ссылки, а интерактив снаружи разорвал бы
 * связку `list` → `listitem`. Обычная строка идёт по той же схеме, чтобы
 * разметка содержимого была написана один раз, а не по копии на ветку.
 *
 * Отключённая строка не может остаться ссылкой или кнопкой: `disabled` у
 * `<a href>` не существует, и убрать её из таб-порядка можно только тем, что
 * интерактивный тег не рендерится вовсе. Разметочному схлопываться не от чего.
 */
const rowTag = computed<string | Component>(() => (
  props.disabled && isFocusableRow.value ? 'div' : requestedTag.value
))

/** Строковый тег, кроме `a`, атрибут не понимает — там он и гасится. */
const rowHref = computed(() => (
  typeof rowTag.value === 'string' && rowTag.value !== 'a' ? undefined : props.href
))

const rowClass = computed(() => [
  itemLayoutClass,
  grListItemPaddingClass(props.density),
  isInteractive.value ? itemInteractiveClass : '',
  isAction.value || (props.hoverable && !props.disabled) ? itemHoverClass : '',
  props.disabled ? itemDisabledClass : '',
].filter(Boolean).join(' '))

function onClick(event: MouseEvent): void {
  // `disabled` сюда попадает вместе с обычной строкой: и то и другое —
  // не-действие, а кликов не эмитит ни один.
  if (!isAction.value)
    return

  emit('click', event)
}

if (__GR_DEV__) {
  watch(
    () => [isAction.value, isFocusableRow.value, props.as] as const,
    ([action, focusable, as]) => {
      if (!action || focusable || typeof as !== 'string')
        return

      console.warn(
        `[granularity] GrListItem: as="${as}" не попадает в таб-порядок — строка кликается `
        + 'мышью, но не с клавиатуры. Возьмите тег, умеющий фокус (`button`, `a` со ссылкой), '
        + 'или компонент роутера.',
      )
    },
    { immediate: true },
  )
}

defineSlots<{
  /** Содержимое пункта вместо пары «заголовок и описание». */
  default?: () => any
  /** Аддон слева: иконка, аватар, чекбокс. */
  prefix?: () => any
  /** Заголовок пункта вместо пропа `title`. */
  title?: () => any
  /** Описание под заголовком вместо пропа `description`. */
  description?: () => any
}>()
</script>

<template>
  <div
    data-gr-list-item
    role="listitem"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <component
      :is="rowTag"
      :data-gr-list-item-action="isAction ? '' : undefined"
      :type="rowTag === 'button' ? 'button' : undefined"
      :href="rowHref"
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
