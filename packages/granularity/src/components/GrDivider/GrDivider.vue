<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

/**
 * GrDivider — разделитель контента.
 *
 * - `orientation="horizontal"` (по умолчанию) — линия на всю ширину; с `label`
 *   или default-слотом рисует текст по центру/краю между отрезками линии.
 * - `orientation="vertical"` — тонкая вертикальная линия. Растягивается по
 *   высоте flex-родителя; вне flex-контекста высоту задаёт `length`.
 *
 * A11y: `role="separator"` делает потомков презентационными, поэтому подпись
 * скринридеру не достаётся — имя разделителя приходит через `aria-label`.
 */
import {
  horizontalLineClass,
  horizontalSpacingClass,
  labelLineClass,
  labelRootClass,
  lineVariantClass,
  verticalLineClass,
  verticalSpacingClass,
  type GrDividerAlign,
  type GrDividerOrientation,
  type GrDividerSpacing,
  type GrDividerVariant,
} from './grDividerStyles'

export interface GrDividerProps {
  orientation?: GrDividerOrientation
  label?: string
  align?: GrDividerAlign
  /** Начертание линии. Не задано — берётся из `GrConfigProvider`, иначе `solid`. */
  variant?: GrDividerVariant
  /** Отступы вокруг разделителя. Не задано — из `GrConfigProvider`, иначе `none`. */
  spacing?: GrDividerSpacing
  /** Толщина линии. Число трактуется как пиксели. */
  thickness?: number | string
  /**
   * Длина линии: высота вертикального разделителя, ширина горизонтального.
   * Нужна вертикальному вне flex-родителя — там ему не от чего растянуться.
   */
  length?: number | string
  /**
   * Имя разделителя для скринридера. Подпись из слота строкой не выразить,
   * поэтому имя задаётся отдельно; при `label` оно берётся из него.
   */
  ariaLabel?: string
}

import './defaults'

export type { GrDividerAlign, GrDividerOrientation, GrDividerSpacing, GrDividerVariant }

const props = withDefaults(
  defineProps<GrDividerProps>(),
  {
    orientation: 'horizontal',
    label: undefined,
    align: 'center',
    // Дефолты `variant`/`spacing` живут в резолверах ниже, а не здесь: Vue
    // подставил бы их до того, как компонент заглянет в `GrConfigProvider`.
    variant: undefined,
    spacing: undefined,
    thickness: undefined,
    length: undefined,
    ariaLabel: undefined,
  },
)

const slots = useSlots()

const resolvedVariant = useGrComponentProp('GrDivider', 'variant', () => props.variant, 'solid')
const resolvedSpacing = useGrComponentProp('GrDivider', 'spacing', () => props.spacing, 'none')

const hasLabel = computed(() =>
  props.orientation === 'horizontal' && (Boolean(props.label) || Boolean(slots.default)),
)

const accessibleName = computed(() => props.ariaLabel ?? props.label)

function toCssLength(value: number | string | undefined): string | undefined {
  if (value == null) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const rootStyle = computed(() => {
  const style: Record<string, string> = {}

  const thickness = toCssLength(props.thickness)
  if (thickness) style['--gr-divider-thickness'] = thickness

  const length = toCssLength(props.length)
  if (length) style[props.orientation === 'vertical' ? 'height' : 'width'] = length

  return style
})

const spacingClass = computed(() =>
  props.orientation === 'vertical'
    ? verticalSpacingClass[resolvedSpacing.value]
    : horizontalSpacingClass[resolvedSpacing.value],
)

const variantClass = computed(() => lineVariantClass[resolvedVariant.value])

defineSlots<{
  /** Подпись внутри линии: «или», название раздела. */
  default?: () => any
}>()

</script>

<template>
  <div
    v-if="orientation === 'vertical'"
    data-gr-divider
    role="separator"
    aria-orientation="vertical"
    :aria-label="accessibleName"
    :style="rootStyle"
    class="inline-block self-stretch"
    :class="[verticalLineClass, variantClass, spacingClass]"
  />

  <div
    v-else-if="hasLabel"
    data-gr-divider
    role="separator"
    aria-orientation="horizontal"
    :aria-label="accessibleName"
    :style="rootStyle"
    :class="[labelRootClass, spacingClass]"
  >
    <span
      v-if="align !== 'start'"
      :class="[labelLineClass, horizontalLineClass, variantClass]"
    />
    <span class="shrink-0"><slot>{{ label }}</slot></span>
    <span
      v-if="align !== 'end'"
      :class="[labelLineClass, horizontalLineClass, variantClass]"
    />
  </div>

  <hr
    v-else
    data-gr-divider
    :aria-label="accessibleName"
    :style="rootStyle"
    class="w-full"
    :class="[horizontalLineClass, variantClass, spacingClass]"
  >
</template>
