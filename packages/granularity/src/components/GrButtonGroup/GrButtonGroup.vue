<script setup lang="ts">
import { computed } from 'vue'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton/grButtonStyles'
import { provideGrButtonGroup, type GrButtonGroupAppearance } from '../shared/buttonGroupContext'
import { useGrComponentProp } from '../shared/configContext'

export type GrButtonGroupOrientation = 'horizontal' | 'vertical'

export interface GrButtonGroupProps {
  /** Доступное имя группы: без него кнопки читаются как несвязанные. */
  ariaLabel?: string
  /** Направление ряда: `vertical` ставит кнопки столбцом. По умолчанию `horizontal`. */
  orientation?: GrButtonGroupOrientation
  /**
   * Склеивать кнопки в один блок. `false` — обычный ряд с зазором: каждая
   * кнопка сохраняет свои радиусы и границы. В лотке не действует.
   */
  attached?: boolean
  /**
   * Вид группы. `default` — ряд по `attached`; `tray` — лоток: звенья лежат в
   * общей подложке с зазором, прозрачные, а выбранное (`aria-pressed="true"` или
   * `aria-current`) — лист с рамкой поверх лотка. Вес и тон звена в лотке
   * решает группа, свой проп кнопки сильнее. По умолчанию `default`; тема меняет
   * его через `componentDefaults` («Глина»).
   */
  appearance?: GrButtonGroupAppearance
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
  appearance: undefined,
  size: undefined,
  variant: undefined,
  tone: undefined,
})

/** Лоток: подложка цвета бумаги с полями и зазором 2px вокруг звеньев. */
const trayClass = 'gap-0.5 p-0.5 rounded-[var(--gr-radius-md)] bg-[var(--gr-button-group-tray-bg,var(--gr-muted))]'

const resolvedAppearance = useGrComponentProp('GrButtonGroup', 'appearance', () => props.appearance, 'default')
const tray = computed(() => resolvedAppearance.value === 'tray')

provideGrButtonGroup({
  size: computed(() => props.size),
  variant: computed(() => props.variant),
  tone: computed(() => props.tone),
  appearance: resolvedAppearance,
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
      tray ? trayClass : attached ? '' : 'gap-2',
    ]"
    :data-orientation="orientation"
    :data-attached="attached && !tray ? '' : undefined"
    :data-appearance="tray ? 'tray' : undefined"
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
    --gr-button-group-radius: var(--gr-button-radius);
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

/* Шов между соседними solid-звеньями: заливки одного цвета сливаются, и
   «Опубликовать ▾» читалось бы одной кнопкой с шевроном в подписи. Кнопка
   рисует его своей тенью — здесь только переменная. */
[data-gr-button-group][data-attached][data-orientation='horizontal'] > [data-gr-variant='primary'] + [data-gr-variant='primary'] {
    --gr-button-divider: inset 1px 0 0 color-mix(in srgb, var(--gr-slate-0) 28%, transparent);
}

[data-gr-button-group][data-attached][data-orientation='vertical'] > [data-gr-variant='primary'] + [data-gr-variant='primary'] {
    --gr-button-divider: inset 0 1px 0 color-mix(in srgb, var(--gr-slate-0) 28%, transparent);
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
