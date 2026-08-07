<script setup lang="ts">
import { computed, useId } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

import {
  formSectionActionsClass,
  formSectionDescriptionClass,
  formSectionHeaderClass,
  formSectionRootClass,
  formSectionTitleClass,
  type GrFormSectionHeadingLevel,
} from './grFormSectionStyles'

export type { GrFormSectionHeadingLevel } from './grFormSectionStyles'

/**
 * Секция формы: заголовок, необязательное описание и контент.
 *
 * Структуру длинной формы незрячий пользователь обходит **по заголовкам**,
 * поэтому заголовок здесь настоящий (`h2`…`h6`), а не жирный текст.
 */
export interface GrFormSectionProps {
  title?: string
  description?: string
  /** Уровень заголовка под структуру страницы. Не задан — берётся из `GrConfigProvider`, иначе `3`. */
  headingLevel?: GrFormSectionHeadingLevel
  /**
   * Объявить секцию лендмарком `region`.
   *
   * По умолчанию выключено: пять секций формы дали бы пять лендмарков и
   * засорили обзор, а структуру и так несёт заголовок. Включать стоит там, где
   * секция действительно крупная и к ней хочется прыгать как к региону.
   */
  landmark?: boolean
}

const props = withDefaults(defineProps<GrFormSectionProps>(), {
  title: undefined,
  description: undefined,
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  headingLevel: undefined,
  landmark: false,
})

const slots = defineSlots<{
  /** Контент секции. */
  default?: () => unknown
  /** Заголовок целиком — вместо строки `title`. */
  title?: () => unknown
  /** Описание целиком — вместо строки `description`. */
  description?: () => unknown
  /** Действия в правой части шапки: «Добавить», «Сбросить». */
  actions?: () => unknown
}>()

const titleId = useId()
const descriptionId = useId()

const headingLevel = useGrComponentProp('GrFormSection', 'headingLevel', () => props.headingLevel, 3)
const headingTag = computed(() => `h${headingLevel.value}`)

const hasTitle = computed(() => Boolean(props.title || slots.title))
const hasDescription = computed(() => Boolean(props.description || slots.description))

// Имя навешивается только у лендмарка: безымянная `<section>` регионом не
// считается и в обзор не попадает.
const labelledBy = computed(() => (props.landmark && hasTitle.value ? titleId : undefined))
const describedBy = computed(() => (hasDescription.value ? descriptionId : undefined))
</script>

<template>
  <section
    data-gr-form-section
    :class="formSectionRootClass"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
  >
    <div v-if="hasTitle || hasDescription || $slots.actions" :class="formSectionHeaderClass">
      <div class="min-w-0">
        <component
          :is="headingTag"
          v-if="hasTitle"
          :id="titleId"
          data-gr-form-section-title
          :class="formSectionTitleClass"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </component>

        <div
          v-if="hasDescription"
          :id="descriptionId"
          data-gr-form-section-description
          :class="formSectionDescriptionClass"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </div>

      <div v-if="$slots.actions" data-gr-form-section-actions :class="formSectionActionsClass">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </section>
</template>
