<script setup lang="ts">
/**
 * GrLink — DS-примитив ссылки.
 *
 * Корневой тег зависит от пропов:
 * - кастомный компонент/тег из пропа `as` — когда `as` передан и не `disabled`
 *   (например, `Link` от `@inertiajs/vue3` или `RouterLink` от Vue Router);
 * - `<a>` — когда задан `href` и не `disabled`;
 * - `<span>` — во всех остальных случаях (включая `disabled`, даже если задан
 *   `href`/`as`).
 *
 * Это осознанное решение, чтобы отключённая ссылка не была кликабельной и
 * не участвовала в порядке табуляции. Учтите это в внешних CSS-селекторах.
 *
 * Проп `as` нужен для интеграции с роутерами (Inertia, Vue Router и пр.):
 * стили/поведение DS остаются едиными, а тег корня подменяется. Все
 * специфичные для роутера атрибуты (`method`, `replace`, `preserve-scroll` и т.п.)
 * проходят через fallthrough-attrs.
 */
import { computed, markRaw, useAttrs, type Component } from 'vue'

import {
  baseRootClass,
  focusRingClass,
  type GrLinkSize,
  type GrLinkUnderline,
  type GrLinkVariant,
  grLinkClass,
} from './grLinkStyles'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  /**
   * Кастомный корневой тег/компонент. Если передан и компонент не `disabled` —
   * рендерится через `<component :is="as">`. Игнорируется при `disabled`.
   */
  as?: string | Component
  href?: string
  external?: boolean
  target?: string
  rel?: string
  disabled?: boolean
  ariaLabel?: string
  variant?: GrLinkVariant
  underline?: GrLinkUnderline
  size?: GrLinkSize
}>(), {
  as: undefined,
  href: undefined,
  external: false,
  target: undefined,
  rel: undefined,
  disabled: false,
  ariaLabel: undefined,
  variant: 'primary',
  underline: 'auto',
  size: 'md',
})

const attrs = useAttrs()

// Кастомный корень имеет приоритет над `<a>` — DS не пытается угадывать
// «правильный» тег за пользователя, если он явно его указал.
const isInteractive = computed(() => !props.disabled && (!!props.as || !!props.href))

const renderAs = computed<string | Component>(() => {
  if (!isInteractive.value) return 'span'
  if (props.as) {
    // Если `as` — объект-компонент, помечаем его как нереактивный, чтобы избежать
    // оверхеда от Vue-прокси и предупреждений в консоли. Строки (нативные теги)
    // оставляем как есть.
    return typeof props.as === 'string' ? props.as : markRaw(props.as)
  }
  return 'a'
})

const resolvedTarget = computed(() => {
  if (props.target)
    return props.target

  if (props.external)
    return '_blank'

  return undefined
})

const resolvedRel = computed(() => {
  if (props.rel)
    return props.rel

  // Авто-защита для любых ссылок, открывающихся в новой вкладке,
  // а не только когда выставлен `external`.
  if (resolvedTarget.value === '_blank')
    return 'noopener noreferrer'

  return undefined
})

const rootClass = computed(() => {
  const variantClass = grLinkClass({
    size: props.size,
    underline: props.underline,
    variant: props.variant,
    disabled: props.disabled,
  })

  // На disabled-ветке (`<span>`) focus-ring не нужен: элемент не фокусируется,
  // а если снаружи ему навесят `tabindex`, фокус-рамка на «отключённой» ссылке смотрелась бы странно.
  return props.disabled
    ? `${baseRootClass} ${variantClass}`
    : `${baseRootClass} ${focusRingClass} ${variantClass}`
})
</script>

<template>
  <component
    :is="renderAs"
    v-bind="attrs"
    :href="isInteractive ? href : undefined"
    :target="isInteractive ? resolvedTarget : undefined"
    :rel="isInteractive ? resolvedRel : undefined"
    :aria-label="ariaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="rootClass"
  >
    <slot />
  </component>
</template>
