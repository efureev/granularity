<script setup lang="ts">
/**
 * GrLink — DS-примитив ссылки.
 *
 * Корневой тег зависит от пропов:
 * - `<a>` — когда заданы `href` и не `disabled`;
 * - `<span>` — во всех остальных случаях (включая `disabled`, даже если `href` задан).
 *
 * Это осознанное решение, чтобы отключённая ссылка не была кликабельной и
 * не участвовала в порядке табуляции. Учтите это в внешних CSS-селекторах.
 */
import { computed, useAttrs } from 'vue'

import {
  baseRootClass,
  grLinkClass,
  type GrLinkSize,
  type GrLinkUnderline,
  type GrLinkVariant,
  focusRingClass,
} from './grLinkStyles'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
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

const isAnchor = computed(() => !!props.href && !props.disabled)

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
  <a
    v-if="isAnchor"
    v-bind="attrs"
    :href="href"
    :target="resolvedTarget"
    :rel="resolvedRel"
    :aria-label="ariaLabel"
    :class="rootClass"
  >
    <slot />
  </a>

  <span
    v-else
    v-bind="attrs"
    :aria-label="ariaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="rootClass"
  >
    <slot />
  </span>
</template>