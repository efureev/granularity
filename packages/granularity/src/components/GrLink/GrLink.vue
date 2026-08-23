<script setup lang="ts">
import { useGrComponentSize } from '../GrConfigProvider/context'
/**
 * GrLink — GR-примитив ссылки.
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
 * стили/поведение GR остаются едиными, а тег корня подменяется. Все
 * специфичные для роутера атрибуты (`method`, `replace`, `preserve-scroll` и т.п.)
 * проходят через fallthrough-attrs.
 */
import { computed, markRaw, useAttrs, type Component } from 'vue'

import GrIcon from '../GrIcon/GrIcon.vue'
import IconExternal from '~icons/lucide/external-link'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  baseRootClass,
  focusRingClass,
  type GrLinkSize,
  type GrLinkTone,
  type GrLinkUnderline,
  type GrLinkVariant,
  grLinkClass,
  grLinkColorStyle,
} from './grLinkStyles'

export interface GrLinkProps {
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
  /** Семантический цвет ссылки из палитры `GrTone`. */
  tone?: GrLinkTone
  /** Уровень акцента: `default` (окрашен) или `muted` (приглушён, акцент на hover). */
  variant?: GrLinkVariant
  underline?: GrLinkUnderline
  size?: GrLinkSize
  /**
  * Иконка внешней ссылки. По умолчанию показывается у любой ссылки, которая
  * открывается в новой вкладке, — не только при `external`.
  */
  externalIcon?: boolean
  /** i18n: скрытая подсказка «откроется в новой вкладке». */
  newTabLabel?: string
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<GrLinkProps>(), {
  as: undefined,
  href: undefined,
  external: false,
  target: undefined,
  rel: undefined,
  disabled: false,
  ariaLabel: undefined,
  tone: 'primary',
  variant: 'default',
  underline: 'auto',
  size: undefined,
  externalIcon: undefined,
  newTabLabel: undefined,
})

const attrs = useAttrs()

// Кастомный корень имеет приоритет над `<a>` — GR не пытается угадывать
// «правильный» тег за пользователя, если он явно его указал.
const isInteractive = computed(() => !props.disabled && (!!props.as || !!props.href))

const renderAs = computed<string | Component>(() => {
  if (!isInteractive.value)
    return 'span'
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

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrLink' })

const { t } = useGranularityTranslations()

/**
 * Смена контекста должна быть объявлена (WCAG 3.2.5). Условие — ссылка реально
 * открывается в новой вкладке, а не наличие пропа `external`: `target="_blank"`
 * снаружи даёт ровно тот же сюрприз (та же генерализация, что у `rel`).
 */
const opensInNewTab = computed(() => isInteractive.value && resolvedTarget.value === '_blank')
const newTabHint = computed(() => props.newTabLabel ?? t('gr.link.opensInNewTab', 'opens in a new tab'))

const showExternalIcon = computed(() => props.externalIcon ?? opensInNewTab.value)

/**
 * `aria-label` перекрывает содержимое целиком — вместе со скрытой подсказкой.
 * Поэтому, если имя задано руками, подсказка дописывается к нему.
 */
const resolvedAriaLabel = computed(() => {
  if (!props.ariaLabel)
    return undefined

  return opensInNewTab.value ? `${props.ariaLabel}, ${newTabHint.value}` : props.ariaLabel
})

const iconSize = computed(() => (resolvedSize.value === 'lg' ? 'sm' : 'xs'))

const rootClass = computed(() => {
  const variantClass = grLinkClass({
    size: resolvedSize.value,
    underline: props.underline,
    disabled: props.disabled,
  })

  // На disabled-ветке (`<span>`) focus-ring не нужен: элемент не фокусируется,
  // а если снаружи ему навесят `tabindex`, фокус-рамка на «отключённой» ссылке смотрелась бы странно.
  return props.disabled
    ? `${baseRootClass} ${variantClass}`
    : `${baseRootClass} ${focusRingClass} ${variantClass}`
})

// Цвет (tone × variant) прокидываем через CSS-переменные, чтобы не плодить классы.
const colorStyle = computed(() => grLinkColorStyle({
  tone: props.tone,
  variant: props.variant,
  disabled: props.disabled,
}))

defineSlots<{
  /** Текст ссылки. */
  default?: () => any
}>()
</script>

<template>
  <component
    :is="renderAs"
    v-bind="attrs"
    :href="isInteractive ? href : undefined"
    :target="isInteractive ? resolvedTarget : undefined"
    :rel="isInteractive ? resolvedRel : undefined"
    :aria-label="resolvedAriaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="rootClass"
    :style="colorStyle"
  >
    <slot />

    <GrIcon v-if="showExternalIcon" :size="iconSize">
      <IconExternal />
    </GrIcon>

    <!-- Подсказка не дублируется, когда её уже вобрал `aria-label`. -->
    <span v-if="opensInNewTab && !ariaLabel" class="sr-only">({{ newTabHint }})</span>
  </component>
</template>
