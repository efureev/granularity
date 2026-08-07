<script setup lang="ts">
/**
 * GrAvatarGroup — ряд аватаров со стекингом и счётчиком скрытых.
 *
 * Группа объявлена `role="group"` с именем и числом участников: без этого
 * скринридер читает набор безымянных картинок и не понимает, что их больше,
 * чем видно.
 */
import { computed, provide, type VNode } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrSizeWithPx } from '../shared/sizes'

import { GR_AVATAR_GROUP_KEY } from './avatarContext'
import {
  grAvatarClass,
  groupBaseClass,
  groupItemClass,
  groupOverflowClass,
  rootBaseClass,
  type GrAvatarShape,
} from './grAvatarStyles'

const GR_AVATAR_GROUP_SIZE_PX = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
} as const

export interface GrAvatarGroupProps {
  /** Размер и форма ряда: дети берут их из контекста. */
  size?: GrSizeWithPx
  shape?: GrAvatarShape
  /** Сколько аватаров показывать; остальные сворачиваются в «+N». */
  max?: number
  /** Сколько участников всего, если в слоте лежит лишь часть. */
  total?: number
  /** Имя группы. Не задано — берётся из локали. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrAvatarGroupProps>(), {
  size: undefined,
  shape: undefined,
  max: undefined,
  total: undefined,
  ariaLabel: undefined,
})

const slots = defineSlots<{
  /** Аватары ряда. */
  default?: () => VNode[]
}>()

const { t } = useGranularityTranslations()

provide(GR_AVATAR_GROUP_KEY, {
  get size() {
    return props.size
  },
  get shape() {
    return props.shape
  },
})

const children = computed(() => slots.default?.() ?? [])

// `v-for` внутри слота приходит фрагментом — считаем его детей, иначе весь
// список выглядел бы одним аватаром.
const items = computed<VNode[]>(() => children.value.flatMap((node) => {
  const nested = node.children
  return Array.isArray(nested) && typeof node.type === 'symbol' ? (nested as VNode[]) : [node]
}))

const visible = computed(() => (props.max === undefined ? items.value : items.value.slice(0, Math.max(0, props.max))))

const hiddenCount = computed(() => {
  const total = props.total ?? items.value.length
  return Math.max(0, total - visible.value.length)
})

const overflowSizePx = computed(() => (
  typeof props.size === 'number' ? props.size : GR_AVATAR_GROUP_SIZE_PX[props.size ?? 'md']
))

const overflowStyle = computed(() => {
  const px = `${overflowSizePx.value}px`
  return { width: px, height: px, fontSize: `${Math.max(10, Math.round(overflowSizePx.value / 3))}px` }
})

const groupLabel = computed(() => props.ariaLabel ?? t('gr.avatar.group', 'People'))

const accessibleLabel = computed(() => (hiddenCount.value > 0
  ? `${groupLabel.value}, ${t('gr.avatar.groupOverflow', 'and {count} more', { count: hiddenCount.value, n: hiddenCount.value })}`
  : groupLabel.value))
</script>

<template>
  <div
    data-gr-avatar-group
    role="group"
    :aria-label="accessibleLabel"
    :class="groupBaseClass"
  >
    <component
      :is="node"
      v-for="(node, index) in visible"
      :key="index"
      :class="groupItemClass"
    />

    <span
      v-if="hiddenCount > 0"
      data-gr-avatar-group-overflow
      aria-hidden="true"
      :class="[rootBaseClass, groupOverflowClass, groupItemClass, grAvatarClass(shape ?? 'circle')]"
      :style="overflowStyle"
    >+{{ hiddenCount }}</span>
  </div>
</template>
