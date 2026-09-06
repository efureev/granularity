<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

import { warnRenamedProp } from '../shared/renamedProp'

import {
  badgeDotClassFor,
  badgeIconClass,
  badgeIconSizeClassBySize,
  grBadgeClass,
  type GrBadgeDotTone,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from './grBadgeStyles'

export interface GrBadgeProps {
  tone?: GrBadgeTone
  dark?: boolean
  size?: GrBadgeSize
  radius?: GrBadgeRadius
  /**
   * Точка-маркер перед подписью: «● Активен».
   *
   * Имя тона красит маркер отдельно от плашки — ради пары «тихая плашка +
   * цветной маркер», из-за которой паттерн и существует. `true` берёт тон
   * самого бейджа.
   *
   * На заливке (`dark`) маркер всегда цвета текста: тон там слился бы с
   * подложкой, взятой из того же слоя.
   */
  dot?: GrBadgeDotTone | boolean
}

const props = withDefaults(
  defineProps<GrBadgeProps>(),
  {
    // `tone`/`size`/`radius` настраиваются через `GrConfigProvider`, поэтому
    // их дефолты живут в резолверах ниже, а не в `withDefaults`.
    tone: undefined,
    dark: false,
    size: undefined,
    radius: undefined,
    dot: false,
  },
)

const slots = defineSlots<{
  /** Содержимое метки. */
  default?: () => any
  /**
   * Иконка перед подписью: статус со спиннером, флаг, значок типа.
   *
   * Размер задаёт обёртка по ступени `size`, поэтому содержимое слота тянется
   * до неё — `class="h-full w-full"`, как у `GrChip`. Вращение спиннера —
   * `animate-spin` на самой иконке.
   *
   * `GrProgressCircle` сюда не кладут: у кругового индикатора шкала виджетная,
   * нижняя ступень — `2rem`, и в строку бейджа он не помещается.
   */
  icon?: () => any
}>()

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedTone = useGrComponentProp('GrBadge', 'tone', () => props.tone, 'neutral')
const resolvedSize = useGrComponentProp('GrBadge', 'size', () => props.size, 'sm')
const resolvedRadius = useGrComponentProp('GrBadge', 'radius', () => props.radius, 'round')

// `variant` переименован в `tone`: незнакомый атрибут Vue сажает на корневой
// узел, поэтому старое имя не роняет ни типы, ни рантайм — компонент молча
// рисуется дефолтным тоном.
warnRenamedProp('GrBadge', useAttrs(), { variant: 'tone' })

const className = computed(() => {
  return grBadgeClass({
    tone: resolvedTone.value,
    dark: props.dark,
    size: resolvedSize.value,
    radius: resolvedRadius.value,
  })
})

const iconSizeClass = computed(() => badgeIconSizeClassBySize[resolvedSize.value])

// Иконка и маркер стоят на одном месте и говорят об одном; два подряд — шум.
// Выигрывает иконка: она несёт больше, чем цвет.
const showDot = computed(() => Boolean(props.dot) && !slots.icon)

const dotClass = computed(() => badgeDotClassFor({
  tone: typeof props.dot === 'string' ? props.dot : resolvedTone.value,
  dark: props.dark,
  size: resolvedSize.value,
}))

if (__GR_DEV__) {
  watchEffect(() => {
    if (props.dot && slots.icon) {
      console.warn(
        '[granularity] GrBadge: `dot` и слот `icon` заняли бы одно место перед подписью — '
        + 'нарисована иконка, маркер пропущен.',
      )
    }

    if (props.dark && typeof props.dot === 'string') {
      console.warn(
        `[granularity] GrBadge: маркер тона \`${props.dot}\` на заливке не рисуется — `
        + 'подложка filled-бейджа берётся из того же слоя цветов, и маркер слился бы с ней. '
        + 'На заливке он всегда цвета текста.',
      )
    }
  })
}
</script>

<template>
  <span
      class="gr-badge inline-block border whitespace-nowrap leading-none"
      :class="className"
  >
    <span class="gr-badge__label">
      <span
        v-if="showDot"
        data-gr-badge-dot
        :class="dotClass"
        aria-hidden="true"
      />
      <span
        v-if="$slots.icon"
        data-gr-badge-icon
        :class="[badgeIconClass, iconSizeClass]"
      >
        <slot name="icon" />
      </span>
      <span class="gr-badge__text">
        <slot />
      </span>
    </span>
  </span>
</template>

<style scoped>
/*
 * Оптически центрируем текст по вертикали независимо от регистра,
 * не уменьшая высоту самого бейджа.
 *
 * Высоту держит обёртка `.gr-badge__label` (`min-height: 1lh` — высота
 * line-box при `leading-none`), а текст (`.gr-badge__text`) обрезается до
 * cap-height и центрируется внутри этой высоты через flex.
 *
 * Обрезка обязана жить на вложенном узле, а не на самом тексте: `text-box-trim`
 * уменьшает line-box, и повесь его прямо на текст — вместе с ним просядет
 * высота контента, а за ней и весь бейдж.
 *
 * `gap` задан в `em`, чтобы просвет перед маркером или иконкой шёл за кеглем
 * ступени, а не за корневым размером. Бейджа без них он не касается: у
 * flex-контейнера с единственным ребёнком просветов нет.
 */
.gr-badge__label {
  display: flex;
  align-items: center;
  gap: 0.25em;
  min-height: 1lh;
}

.gr-badge__text {
  display: block;
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
  /* Шорткат для браузеров с поддержкой нового синтаксиса. */
  text-box: trim-both cap alphabetic;
}
</style>
