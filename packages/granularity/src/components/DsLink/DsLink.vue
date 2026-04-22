<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import {
  dsLinkClass,
  type DsLinkSize,
  type DsLinkUnderline,
  type DsLinkVariant,
} from './dsLinkStyles'

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
  variant?: DsLinkVariant
  underline?: DsLinkUnderline
  size?: DsLinkSize
}>(), {
  href: undefined,
  external: false,
  target: undefined,
  rel: undefined,
  disabled: false,
  ariaLabel: undefined,
  variant: 'primary',
  underline: 'auto',
  size: 'sm',
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

  if (props.external)
    return 'noopener noreferrer'

  return undefined
})

const className = computed(() => {
  return dsLinkClass({
    size: props.size,
    underline: props.underline,
    variant: props.variant,
    disabled: props.disabled,
  })
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
    class="inline-flex items-center gap-1 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    :class="className"
  >
    <slot />
  </a>

  <span
    v-else
    v-bind="attrs"
    :aria-label="ariaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    class="inline-flex items-center gap-1 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    :class="className"
  >
    <slot />
  </span>
</template>