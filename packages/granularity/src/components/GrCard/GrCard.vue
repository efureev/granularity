<script setup lang="ts">
import { computed, markRaw, useSlots, type Component } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

import {
  grCardRootClass,
  paddingClass,
  sectionDividerBottomClass,
  sectionDividerTopClass,
  type GrCardPadding,
  type GrCardVariant,
} from './grCardStyles'

export type { GrCardPadding, GrCardVariant } from './grCardStyles'

export interface GrCardProps {
  /**
   * Внутренние отступы. По умолчанию `none`: карточка — поверхность, а её
   * содержимое (`GrCollapse`, `GrList`) само знает про свои отступы.
   */
  padding?: GrCardPadding
  /** `elevated` — рамка, фон и тень; `outlined` — без тени; `ghost` — без рамки. */
  variant?: GrCardVariant
  /** Свой корневой тег (`RouterLink`, `Link` от Inertia). Сильнее `href`. */
  as?: string | Component
  /** Карточка-ссылка. */
  href?: string
  /** Карточка-кнопка: интерактивна вся поверхность. */
  clickable?: boolean
  /** Подсветка при наведении без интерактивности. */
  hoverable?: boolean
  /** Классы обёртки тела — она появляется вместе с секциями. */
  bodyClass?: string
}

const props = withDefaults(defineProps<GrCardProps>(), {
  // Настраивается через `GrConfigProvider`; дефолты — в резолверах ниже.
  padding: undefined,
  variant: undefined,
  as: undefined,
  href: undefined,
  clickable: false,
  hoverable: false,
  bodyClass: undefined,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()

const resolvedPadding = useGrComponentProp('GrCard', 'padding', () => props.padding, 'none')
const resolvedVariant = useGrComponentProp('GrCard', 'variant', () => props.variant, 'elevated')

const isInteractive = computed(() => !!props.as || !!props.href || props.clickable)

const rootTag = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)

  if (props.href)
    return 'a'

  return props.clickable ? 'button' : 'div'
})

/**
 * Обёртки появляются, только когда их попросили: карточка без секций остаётся
 * одним `<div>` со слотом внутри — ровно тем, что рендерили `GrCollapse` и
 * `GrList` до появления пропов.
 */
const hasSections = computed(() => Boolean(slots.header || slots.footer || props.bodyClass))

const rootClass = computed(() => grCardRootClass({
  variant: resolvedVariant.value,
  // С секциями отступ принадлежит каждой из них, а не поверхности целиком.
  padding: hasSections.value ? 'none' : resolvedPadding.value,
  interactive: isInteractive.value,
  hoverable: props.hoverable,
}))

const sectionPaddingClass = computed(() => paddingClass[resolvedPadding.value])

const headerClass = computed(() => [sectionPaddingClass.value, sectionDividerBottomClass].filter(Boolean).join(' '))
const footerClass = computed(() => [sectionPaddingClass.value, sectionDividerTopClass].filter(Boolean).join(' '))
const bodySectionClass = computed(() => [sectionPaddingClass.value, props.bodyClass].filter(Boolean).join(' '))

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <component
    :is="rootTag"
    data-gr-card
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootTag === 'a' ? href : undefined"
    :class="rootClass"
    @click="onClick"
  >
    <template v-if="hasSections">
      <div v-if="$slots.header" data-gr-card-header :class="headerClass">
        <slot name="header" />
      </div>

      <div data-gr-card-body :class="bodySectionClass">
        <slot />
      </div>

      <div v-if="$slots.footer" data-gr-card-footer :class="footerClass">
        <slot name="footer" />
      </div>
    </template>

    <slot v-else />
  </component>
</template>
