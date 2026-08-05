<script setup lang="ts">
import { computed, markRaw, type Component } from 'vue'

import IconLoader from '~icons/lucide/loader-circle'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export type { GrButtonSize, GrButtonTone, GrButtonVariant } from './grButtonStyles'

import {
  grButtonBaseClass,
  grButtonClass,
  type GrButtonSize,
  type GrButtonTone,
  type GrButtonVariant,
} from './grButtonStyles'

const props = withDefaults(
  defineProps<{
    variant?: GrButtonVariant
    tone?: GrButtonTone
    size?: GrButtonSize
    loading?: boolean
    /** i18n: что именно грузится. `aria-busy` сам по себе часть AT не объявляет. */
    loadingText?: string
    disabled?: boolean
    square?: boolean
    /** Кнопка на всю ширину контейнера. */
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
    ariaLabel?: string
    /** Полиморфизм: кастомный корневой тег/компонент (например, RouterLink). */
    as?: string | Component
    /** Рендерит кнопку как `<a href>` (если не задан `as`). */
    href?: string
    target?: string
    rel?: string
    external?: boolean
  }>(),
  {
    // `variant`/`tone`/`size`/`square` настраиваются через `GrConfigProvider`,
    // поэтому их дефолты живут в резолверах ниже, а не здесь: Vue подставил бы
    // дефолт до того, как компонент успеет заглянуть в конфиг.
    variant: undefined,
    tone: undefined,
    size: undefined,
    loading: false,
    loadingText: undefined,
    disabled: false,
    square: undefined,
    block: false,
    type: 'button',
    ariaLabel: undefined,
    as: undefined,
    href: undefined,
    target: undefined,
    rel: undefined,
    external: false,
  },
)

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrButton' })
const resolvedVariant = useGrComponentProp('GrButton', 'variant', () => props.variant, 'primary')
const resolvedTone = useGrComponentProp('GrButton', 'tone', () => props.tone, 'primary')
const isSquare = useGrComponentProp('GrButton', 'square', () => props.square, false)

const { t } = useGranularityTranslations()
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.button.loading', 'Loading…'))

// Полиморфный корень: `as` → `<a href>` → `<button>`.
const isLink = computed(() => Boolean(props.as || props.href))
const renderAs = computed<string | Component>(() => {
  if (props.as) return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

// Неинтерактивно при явном `disabled` ИЛИ во время `loading`.
const blocked = computed(() => props.disabled || props.loading)

// Ключевое: `loading` НЕ ставит нативный `disabled` (элемент бы выпал из фокуса и
// скринридер потерял бы контекст) — вместо этого `aria-disabled` + перехват клика.
// Нативный `disabled` (только у `<button>`) оставляем лишь для явного `disabled`.
const nativeDisabled = computed(() => (renderAs.value === 'button' && props.disabled) ? true : undefined)
const ariaDisabled = computed(() => (props.loading || (isLink.value && props.disabled)) ? 'true' : undefined)

const resolvedTarget = computed(() => props.target ?? (props.external ? '_blank' : undefined))
const resolvedRel = computed(() => props.rel ?? (resolvedTarget.value === '_blank' ? 'noopener noreferrer' : undefined))

function onClickCapture(e: MouseEvent): void {
  // Блокируем и дефолт (submit/навигация), и внешние обработчики (в т.ч. по Enter/Space),
  // сохраняя фокус на элементе.
  if (blocked.value) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}

const className = computed(() => {
  return grButtonClass({
    variant: resolvedVariant.value,
    tone: resolvedTone.value,
    size: resolvedSize.value,
    square: isSquare.value,
    disabled: props.disabled,
    block: props.block,
  })
})
</script>

<template>
  <component
    :is="renderAs"
    data-gr-button
    :data-gr-variant="resolvedVariant"
    :data-gr-tone="resolvedTone"
    :type="renderAs === 'button' ? props.type : undefined"
    :disabled="nativeDisabled"
    :href="isLink && !props.disabled ? props.href : undefined"
    :target="isLink && !props.disabled ? resolvedTarget : undefined"
    :rel="isLink && !props.disabled ? resolvedRel : undefined"
    :aria-busy="props.loading ? 'true' : undefined"
    :aria-disabled="ariaDisabled"
    :aria-label="props.ariaLabel"
    :tabindex="isLink && props.disabled ? -1 : undefined"
    :class="[grButtonBaseClass, className, blocked ? 'cursor-not-allowed' : '']"
    @click.capture="onClickCapture"
  >
    <!-- Спиннер занимает место префикса: две иконки рядом читались бы как ошибка. -->
    <IconLoader v-if="props.loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot v-else name="prefix" />

    <slot />

    <slot name="suffix" />

    <span v-if="props.loading" class="sr-only">{{ resolvedLoadingText }}</span>
  </component>
</template>
