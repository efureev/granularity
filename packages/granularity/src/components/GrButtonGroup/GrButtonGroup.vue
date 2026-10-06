<script setup lang="ts">
import { computed } from 'vue'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton/grButtonStyles'
import { provideGrButtonGroup } from '../shared/buttonGroupContext'

export type GrButtonGroupOrientation = 'horizontal' | 'vertical'

export interface GrButtonGroupProps {
  /** Доступное имя группы: без него кнопки читаются как несвязанные. */
  ariaLabel?: string
  /** Направление ряда: `vertical` ставит кнопки столбцом. По умолчанию `horizontal`. */
  orientation?: GrButtonGroupOrientation
  /**
   * Склеивать кнопки в один блок. `false` — обычный ряд с зазором: каждая
   * кнопка сохраняет свои радиусы и границы.
   */
  attached?: boolean
  /** Оформление, общее для кнопок группы. Проп самой кнопки сильнее. */
  size?: GrButtonSize
  /** Вес всех кнопок группы: `primary`, `outline`, `ghost` и т. д. Проп самой кнопки сильнее. */
  variant?: GrButtonVariant
  /** Тон всех кнопок группы. Проп самой кнопки сильнее. */
  tone?: GrButtonTone
}

const props = withDefaults(defineProps<GrButtonGroupProps>(), {
  ariaLabel: undefined,
  orientation: 'horizontal',
  attached: true,
  size: undefined,
  variant: undefined,
  tone: undefined,
})

provideGrButtonGroup({
  size: computed(() => props.size),
  variant: computed(() => props.variant),
  tone: computed(() => props.tone),
})

defineSlots<{
  /** Кнопки группы. */
  default?: () => any
}>()
</script>

<template>
  <div
    data-gr-button-group
    class="inline-flex"
    :class="[
      orientation === 'vertical' ? 'flex-col items-stretch' : 'items-stretch',
      attached ? '' : 'gap-2',
    ]"
    :data-orientation="orientation"
    :data-attached="attached ? '' : undefined"
    role="group"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<style>
/*
 * Склейка держится на понятии «звено группы» — прямом потомке, который сам
 * кнопка или содержит кнопку. Обёртка (тултип, `<span v-if>`, роутерная
 * ссылка) поэтому не разрывает ряд, а не-кнопочный потомок (разделитель,
 * подпись) в склейку не попадает и скругление себе не забирает.
 *
 * Края считаются от соседства звеньев, а не от `:first-child`/`:last-child`:
 * ведущий край гасится у звена, перед которым уже было звено, ведомый — у
 * звена, за которым звено ещё будет.
 *
 * Гасится он переменной, а не `border-*-radius`. Этот лист живёт в слое
 * `granum.components`, а радиус кнопке ставит утилита из `granum.utilities` —
 * более поздний слой побеждает при любой специфичности, и правило
 * «внутренний угол — 0» молча проигрывало: группа выглядела рядом отдельных
 * кнопок. Утилита кнопки читает радиус каждого угла из своей переменной
 * (`--gr-button-radius-ss` … `-ee`), а переменные утилиты не задают — спорить
 * слоям не о чем. Углы логические, поэтому RTL отражает группу сам.
 */
[data-gr-button-group] {
    --gr-button-group-radius: var(--gr-button-radius, 0.375rem);
}

[data-gr-button-group][data-attached] [data-gr-button] {
    --gr-button-radius: var(--gr-button-group-radius);
    position: relative;
}

/* Кнопка под курсором или с фокусом — поверх соседей: иначе её граница и
   фокус-кольцо срезаются наложением. */
[data-gr-button-group] [data-gr-button]:hover,
[data-gr-button-group] [data-gr-button]:focus-visible {
    z-index: 1;
}

/* ————— Горизонтальная группа. */

[data-gr-button-group][data-attached][data-orientation='horizontal'] > :is([data-gr-button], :has([data-gr-button])) ~ :is([data-gr-button], :has([data-gr-button])) {
    margin-inline-start: -1px;
}

[data-gr-button-group][data-attached][data-orientation='horizontal'] > :is([data-gr-button], :has([data-gr-button])) ~ [data-gr-button],
[data-gr-button-group][data-attached][data-orientation='horizontal'] > :is([data-gr-button], :has([data-gr-button])) ~ :has([data-gr-button]) [data-gr-button] {
    --gr-button-radius-ss: 0;
    --gr-button-radius-es: 0;
}

[data-gr-button-group][data-attached][data-orientation='horizontal'] > [data-gr-button]:has(~ :is([data-gr-button], :has([data-gr-button]))),
[data-gr-button-group][data-attached][data-orientation='horizontal'] > :has([data-gr-button]):has(~ :is([data-gr-button], :has([data-gr-button]))) [data-gr-button] {
    --gr-button-radius-se: 0;
    --gr-button-radius-ee: 0;
}

/* ————— Вертикальная группа: та же логика, другая ось. */

[data-gr-button-group][data-attached][data-orientation='vertical'] > :is([data-gr-button], :has([data-gr-button])) ~ :is([data-gr-button], :has([data-gr-button])) {
    margin-block-start: -1px;
}

[data-gr-button-group][data-attached][data-orientation='vertical'] > :is([data-gr-button], :has([data-gr-button])) ~ [data-gr-button],
[data-gr-button-group][data-attached][data-orientation='vertical'] > :is([data-gr-button], :has([data-gr-button])) ~ :has([data-gr-button]) [data-gr-button] {
    --gr-button-radius-ss: 0;
    --gr-button-radius-se: 0;
}

[data-gr-button-group][data-attached][data-orientation='vertical'] > [data-gr-button]:has(~ :is([data-gr-button], :has([data-gr-button]))),
[data-gr-button-group][data-attached][data-orientation='vertical'] > :has([data-gr-button]):has(~ :is([data-gr-button], :has([data-gr-button]))) [data-gr-button] {
    --gr-button-radius-es: 0;
    --gr-button-radius-ee: 0;
}
</style>
