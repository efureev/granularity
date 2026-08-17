<script setup lang="ts">
import { valuePrefixClass, valueRootClass, valueSuffixClass } from './grValueStyles'

/**
 * Величина с приписками: префикс, значение, суффикс — и ничего больше.
 *
 * Примитив, на котором стоят `GrDelta` (величина со знаком и тоном) и
 * `GrStatistic` (величина плиткой с подписью). Сам он не форматирует число, не
 * знает про тон и не имеет своей шкалы размеров: значение приходит готовым, а
 * кегль и цвет наследуются от места, где величина стоит.
 *
 * Чем является приписка — валютой, единицей измерения или пометкой — компонент
 * не решает: оформление обеих задаётся токенами `--gr-value-*`.
 */
export interface GrValueProps {
  /** Готовое к показу значение. Не форматируется: «2 ч 15 мин» и «—» тоже величины. */
  value?: string | number | null
  /** Приписка перед значением: валюта, знак приближения. */
  prefix?: string
  /** Приписка после значения: единица измерения, валюта справа. */
  suffix?: string
}

defineProps<GrValueProps>()

defineSlots<{
  /** Значение вместо пропа. */
  default?: () => unknown
  /** Приписка перед значением. */
  prefix?: () => unknown
  /** Приписка после значения. */
  suffix?: () => unknown
  /**
   * Перед префиксом: знак величины у `GrDelta`, стрелка направления.
   * Слотом, а не пропом, — разметка там принадлежит потребителю.
   */
  lead?: () => unknown
  /** После значения: скрытый узел для диктора у `GrStatistic`. */
  trail?: () => unknown
}>()
</script>

<template>
  <span data-gr-value :class="valueRootClass">
    <slot name="lead" />

    <span v-if="prefix || $slots.prefix" data-gr-value-prefix :class="valuePrefixClass">
      <slot name="prefix">{{ prefix }}</slot>
    </span>

    <span data-gr-value-number>
      <slot>{{ value }}</slot>
    </span>

    <slot name="trail" />

    <span v-if="suffix || $slots.suffix" data-gr-value-suffix :class="valueSuffixClass">
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>
