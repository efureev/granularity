<script setup lang="ts">
import { computed } from 'vue'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

import {
  grBadgeClass,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from './grBadgeStyles'

const props = withDefaults(
    defineProps<{
      tone?: GrBadgeTone
      dark?: boolean
      size?: GrBadgeSize
      radius?: GrBadgeRadius
    }>(),
    {
      tone: 'neutral',
      dark: false,
      size: 'sm',
      radius: 'round',
    },
)

const className = computed(() => {
  return grBadgeClass({
    tone: props.tone,
    dark: props.dark,
    size: props.size,
    radius: props.radius,
  })
})
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
 * Раньше `text-box-trim` висел прямо на тексте и обрезал line-box до
 * cap-height: текст центрировался корректно, но высота контента
 * падала до cap-height, из-за чего бейдж становился ниже.
 *
 * Теперь высоту держит обёртка `.gr-badge__label` (`min-height: 1lh` —
 * исходная высота line-box при `leading-none`), а сам текст
 * (`.gr-badge__text`) обрезается до cap-height/базовой линии и
 * центрируется внутри этой высоты через flex. В итоге высота бейджа
 * не меняется, а строчный/заглавный текст выглядит по центру.
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