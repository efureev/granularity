<script setup lang="ts">
import { computed } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

import {
  grBadgeClass,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from './grBadgeStyles'

export interface GrBadgeProps {
    tone?: GrBadgeTone
    dark?: boolean
    size?: GrBadgeSize
    radius?: GrBadgeRadius
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
    },
)

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedTone = useGrComponentProp('GrBadge', 'tone', () => props.tone, 'neutral')
const resolvedSize = useGrComponentProp('GrBadge', 'size', () => props.size, 'sm')
const resolvedRadius = useGrComponentProp('GrBadge', 'radius', () => props.radius, 'round')

const className = computed(() => {
  return grBadgeClass({
    tone: resolvedTone.value,
    dark: props.dark,
    size: resolvedSize.value,
    radius: resolvedRadius.value,
  })
})

defineSlots<{
  /** Содержимое метки. */
  default?: () => any
}>()

</script>

<template>
  <span
      class="gr-badge inline-block border whitespace-nowrap leading-none"
      :class="className"
  >
    <span class="gr-badge__label">
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
 */
.gr-badge__label {
  display: flex;
  align-items: center;
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