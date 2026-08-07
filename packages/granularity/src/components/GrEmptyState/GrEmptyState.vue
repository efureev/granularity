<script setup lang="ts">
import { computed } from 'vue'

import IconInbox from '~icons/lucide/inbox'

import GrIcon from '../GrIcon/GrIcon.vue'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  actionsBaseClass,
  actionsBySize,
  descriptionBaseClass,
  descriptionBySize,
  grEmptyStateRootClass,
  iconBoxBaseClass,
  iconBoxBySize,
  iconSizeBySize,
  titleBaseClass,
  titleBySize,
  type GrEmptyStateHeadingLevel,
  type GrEmptyStateSize,
  type GrEmptyStateVariant,
} from './grEmptyStateStyles'

export type {
  GrEmptyStateHeadingLevel,
  GrEmptyStateSize,
  GrEmptyStateVariant,
} from './grEmptyStateStyles'

/**
 * GrEmptyState — карточка пустого состояния: иконка, заголовок, описание и
 * слот действий.
 *
 * Заголовок — настоящий heading: без него пустое состояние не находится
 * навигацией по заголовкам, а именно оно и объясняет, почему на экране ничего
 * нет.
 */
export interface GrEmptyStateProps {
  /** Заголовок. Не задан — берётся из локали; слот `#title` сильнее обоих. */
  title?: string
  description?: string
  size?: GrEmptyStateSize
  /** `ghost` снимает рамку и фон: карточка внутри карточки рисует вторую рамку. */
  variant?: GrEmptyStateVariant
  headingLevel?: GrEmptyStateHeadingLevel
}

const props = withDefaults(defineProps<GrEmptyStateProps>(), {
  title: undefined,
  description: undefined,
  size: undefined,
  variant: undefined,
  headingLevel: undefined,
})

const slots = defineSlots<{
  /** Иконка вместо встроенной. */
  icon?: () => unknown
  /** Заголовок разметкой: ссылка, выделение, счётчик. */
  title?: () => unknown
  description?: () => unknown
  /** Действия под текстом: центрируются. */
  default?: () => unknown
}>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrEmptyState' })
const resolvedVariant = useGrComponentProp('GrEmptyState', 'variant', () => props.variant, 'outlined')
const headingLevel = useGrComponentProp('GrEmptyState', 'headingLevel', () => props.headingLevel, 3)

const headingTag = computed(() => `h${headingLevel.value}`)
const resolvedTitle = computed(() => props.title ?? t('gr.emptyState.title', 'Nothing here yet'))
const hasDescription = computed(() => Boolean(props.description) || Boolean(slots.description))
</script>

<template>
  <div
    data-gr-empty-state
    :class="grEmptyStateRootClass({ variant: resolvedVariant, size: resolvedSize })"
  >
    <div class="flex justify-center">
      <div data-gr-empty-state-icon :class="[iconBoxBaseClass, iconBoxBySize[resolvedSize]]">
        <slot name="icon">
          <GrIcon :size="iconSizeBySize[resolvedSize]">
            <IconInbox aria-hidden="true" />
          </GrIcon>
        </slot>
      </div>
    </div>

    <component
      :is="headingTag"
      data-gr-empty-state-title
      :class="[titleBaseClass, titleBySize[resolvedSize]]"
    >
      <slot name="title">
        {{ resolvedTitle }}
      </slot>
    </component>

    <div
      v-if="hasDescription"
      data-gr-empty-state-description
      :class="[descriptionBaseClass, descriptionBySize[resolvedSize]]"
    >
      <slot name="description">
        {{ description }}
      </slot>
    </div>

    <div
      v-if="$slots.default"
      data-gr-empty-state-actions
      :class="[actionsBaseClass, actionsBySize[resolvedSize]]"
    >
      <slot />
    </div>
  </div>
</template>
