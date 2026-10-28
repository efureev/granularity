<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'

import { useGrComponentProp } from '../shared/configContext'

export type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from './grBadgeStyles'

import { warnRenamedProp } from '../shared/renamedProp'

import {
  type GrBadgeDotTone,
  grBadgeLookAttrs,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from './grBadgeStyles'

export interface GrBadgeProps {
  /**
   * Тон метки: несёт смысл, а не только цвет — «Оплачено» в `success`,
   * «Просрочено» в `danger`. Не задан — из `GrConfigProvider`, иначе `neutral`.
   */
  tone?: GrBadgeTone
  /**
   * Заливка вместо мягкой подложки: плотный вес для пёстрого фона и для
   * метки, которая обязана выделяться. Цвета — из слоя `--gr-badge-{tone}-bg`/`-fg`.
   */
  dark?: boolean
  /**
   * Ступень контрольной шкалы `--gr-control-text-*`: бейдж чаще стоит рядом с
   * кнопками и полями, чем внутри абзаца. Не задан — из `GrConfigProvider`.
   */
  size?: GrBadgeSize
  /**
   * Форма: `round` — таблетка статуса, `semi` — ярлык категории или кода,
   * `square` — штамп. Не задан — из `GrConfigProvider`, иначе `round`.
   */
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
  // `boolean` — первым: рантайм-тип пропа идёт в порядке объединения, и при
  // `[String, Boolean]` Vue оставляет голый атрибут `dot` пустой строкой, а не
  // `true` — точка из документации молча не рисовалась.
  dot?: boolean | GrBadgeDotTone
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

const lookAttrs = computed(() => grBadgeLookAttrs({
  tone: resolvedTone.value,
  dark: props.dark,
  size: resolvedSize.value,
  radius: resolvedRadius.value,
}))

// Иконка и маркер стоят на одном месте и говорят об одном; два подряд — шум.
// Выигрывает иконка: она несёт больше, чем цвет.
const showDot = computed(() => Boolean(props.dot) && !slots.icon)

// Свой тон маркеру нужен, только если он отличается от тона метки: иначе
// переменные тона маркер наследует от корня.
const dotTone = computed(() => (typeof props.dot === 'string' && props.dot !== resolvedTone.value ? props.dot : undefined))

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
  <span data-gr-badge v-bind="lookAttrs">
    <span>
      <span v-if="$slots.icon" data-gr-badge-icon>
        <slot name="icon" />
      </span>
      <span v-else-if="showDot" data-gr-badge-dot :data-gr-tone="dotTone" aria-hidden="true" />
      <span>
        <slot />
      </span>
    </span>
  </span>
</template>

<style>
/*
 * Вид метки — лист по атрибутам, а не утилиты (`docs/markup-weight.md`): меток в
 * таблице десятки, и вид, записанный в разметку каждой, умножался бы на них.
 * Палитра тонов и радиусы общие с `GrChip`: чип стоит с бейджем в одном ряду и не
 * расходится с ним по цвету, поэтому правила тона и формы знают и его корень.
 *
 * Правило тона раскладывает роли по переменным `--gr-badge-tone-*`, вид читает
 * только их. Мягкий вид — подложка `-light` и текст `-text`: насыщенный тон на
 * своей подложке не держит контраст (`--gr-success` на `--gr-success-light` —
 * 2.24:1). Заливка — слой `--gr-badge-<тон>-bg`/`-fg`, а не роль тона: в светлом
 * режиме `--gr-<тон>` — яркая заливка под тёмный текст, и метка читалась бы
 * тяжёлой почти чёрной плашкой. Слой уводит её на `-solid`, как у кнопок.
 */
:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='neutral'] {
  --gr-badge-tone-soft-bg: var(--gr-muted);
  --gr-badge-tone-soft-fg: var(--gr-fg);
  --gr-badge-tone-soft-brd: var(--gr-brd);
  --gr-badge-tone-bg: var(--gr-badge-neutral-bg);
  --gr-badge-tone-fg: var(--gr-badge-neutral-fg);
  /* Нейтральный вес — инверсия страницы, а не тон: рамка тянется к тексту, а не к заливке. */
  --gr-badge-tone-brd: color-mix(in srgb, var(--gr-fg) 35%, var(--gr-brd));
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='primary'] {
  --gr-badge-tone-soft-bg: var(--gr-accent);
  --gr-badge-tone-soft-fg: var(--gr-accent-fg);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-primary) 30%, var(--gr-accent));
  --gr-badge-tone-bg: var(--gr-badge-primary-bg);
  --gr-badge-tone-fg: var(--gr-badge-primary-fg);
  --gr-badge-tone-brd: var(--gr-badge-primary-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='success'] {
  --gr-badge-tone-soft-bg: var(--gr-success-light);
  --gr-badge-tone-soft-fg: var(--gr-success-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-success) 30%, var(--gr-success-light));
  --gr-badge-tone-bg: var(--gr-badge-success-bg);
  --gr-badge-tone-fg: var(--gr-badge-success-fg);
  --gr-badge-tone-brd: var(--gr-badge-success-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='warning'] {
  --gr-badge-tone-soft-bg: var(--gr-warning-light);
  --gr-badge-tone-soft-fg: var(--gr-warning-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-warning) 30%, var(--gr-warning-light));
  --gr-badge-tone-bg: var(--gr-badge-warning-bg);
  --gr-badge-tone-fg: var(--gr-badge-warning-fg);
  --gr-badge-tone-brd: var(--gr-badge-warning-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='danger'] {
  --gr-badge-tone-soft-bg: var(--gr-danger-light);
  --gr-badge-tone-soft-fg: var(--gr-danger-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-danger) 30%, var(--gr-danger-light));
  --gr-badge-tone-bg: var(--gr-badge-danger-bg);
  --gr-badge-tone-fg: var(--gr-badge-danger-fg);
  --gr-badge-tone-brd: var(--gr-badge-danger-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='info'] {
  --gr-badge-tone-soft-bg: var(--gr-info-light);
  --gr-badge-tone-soft-fg: var(--gr-info-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-info) 30%, var(--gr-info-light));
  --gr-badge-tone-bg: var(--gr-badge-info-bg);
  --gr-badge-tone-fg: var(--gr-badge-info-fg);
  --gr-badge-tone-brd: var(--gr-badge-info-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='slate'] {
  --gr-badge-tone-soft-bg: var(--gr-slate-light);
  --gr-badge-tone-soft-fg: var(--gr-slate-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-slate) 30%, var(--gr-slate-light));
  --gr-badge-tone-bg: var(--gr-badge-slate-bg);
  --gr-badge-tone-fg: var(--gr-badge-slate-fg);
  --gr-badge-tone-brd: var(--gr-badge-slate-bg);
}

:is([data-gr-badge], [data-gr-badge-dot], [data-gr-chip])[data-gr-tone='azure'] {
  --gr-badge-tone-soft-bg: var(--gr-azure-light);
  --gr-badge-tone-soft-fg: var(--gr-azure-text);
  --gr-badge-tone-soft-brd: color-mix(in srgb, var(--gr-azure) 30%, var(--gr-azure-light));
  --gr-badge-tone-bg: var(--gr-badge-azure-bg);
  --gr-badge-tone-fg: var(--gr-badge-azure-fg);
  --gr-badge-tone-brd: var(--gr-badge-azure-bg);
}

/*
 * Силу рамки мягкого вида задаёт тема (`--gr-badge-light-brd`): 100% — рамка тона,
 * 0% — рамка цвета подложки, то есть её нет. Сама рамка остаётся, и метка не
 * меняет размер.
 */
/*
 * Цвета корня `GrChip` — тоже здесь: палитру читает тот, кто её задаёт. Недоступный
 * чип заливку не берёт — его гасит лист `GrChip`.
 */
:is([data-gr-badge], [data-gr-chip]) {
  border-color: color-mix(in srgb, var(--gr-badge-tone-soft-brd) var(--gr-badge-light-brd), var(--gr-badge-tone-soft-bg));
  background-color: var(--gr-badge-tone-soft-bg);
  color: var(--gr-badge-tone-soft-fg);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-dark]:not([data-gr-off]) {
  border-color: var(--gr-badge-tone-brd);
  background-color: var(--gr-badge-tone-bg);
  color: var(--gr-badge-tone-fg);
}

[data-gr-badge] {
  display: inline-block;
  border-width: 1px;
  line-height: 1;
  white-space: nowrap;
}

[data-gr-badge][data-gr-size='xs'] {
  padding: 0.1rem 0.5rem;
  font-size: var(--gr-control-text-2xs);
}

[data-gr-badge][data-gr-size='sm'] {
  padding: 0.125rem 0.625rem;
  font-size: var(--gr-control-text-xs);
}

[data-gr-badge][data-gr-size='md'] {
  padding: 0.25rem 0.75rem;
  font-size: var(--gr-control-text-sm);
}

[data-gr-badge][data-gr-size='lg'] {
  padding: 0.375rem 0.875rem;
  font-size: var(--gr-control-text-md);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='round'] {
  border-radius: var(--gr-radius-full);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='square'] {
  border-radius: var(--gr-radius-none);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='semi'][data-gr-size='xs'] {
  border-radius: var(--gr-badge-semi-radius-xs);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='semi'][data-gr-size='sm'] {
  border-radius: var(--gr-badge-semi-radius-sm);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='semi'][data-gr-size='md'] {
  border-radius: var(--gr-badge-semi-radius-md);
}

:is([data-gr-badge], [data-gr-chip])[data-gr-radius='semi'][data-gr-size='lg'] {
  border-radius: var(--gr-badge-semi-radius-lg);
}

/*
 * Оптически центрируем текст по вертикали независимо от регистра, не уменьшая
 * высоту самого бейджа.
 *
 * Высоту держит обёртка подписи (`min-height: 1lh` — высота line-box при
 * `line-height: 1`), а текст обрезается до cap-height и центрируется внутри
 * этой высоты через flex.
 *
 * Обрезка обязана жить на вложенном узле, а не на самом тексте: `text-box-trim`
 * уменьшает line-box, и повесь его прямо на текст — вместе с ним просядет
 * высота контента, а за ней и весь бейдж.
 *
 * `gap` задан в `em`, чтобы просвет перед маркером или иконкой шёл за кеглем
 * ступени, а не за корневым размером. Бейджа без них он не касается: у
 * flex-контейнера с единственным ребёнком просветов нет.
 */
[data-gr-badge] > span {
  display: flex;
  align-items: center;
  gap: 0.25em;
  min-height: 1lh;
}

[data-gr-badge] > span > :last-child {
  display: block;
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
  text-box: trim-both cap alphabetic;
}

/*
 * Иконка растёт медленнее кегля: на нижних ступенях плашка узкая, и иконка «один
 * в один с текстом» разгоняла бы её по высоте. Не жмётся: подпись не переносится.
 */
[data-gr-badge-icon] {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

[data-gr-badge][data-gr-size='xs'] [data-gr-badge-icon] {
  width: 0.75rem;
  height: 0.75rem;
}

[data-gr-badge][data-gr-size='sm'] [data-gr-badge-icon] {
  width: 0.875rem;
  height: 0.875rem;
}

/*
 * Маркер мельче иконки и растёт медленнее: он обязан оставаться маркером, а не
 * третьим элементом строки.
 *
 * На мягкой подложке он красится тем же слоем, что заливка (`--gr-badge-<тон>-bg`),
 * а не ролью тона: `--gr-<тон>` в светлом режиме не берёт 3:1 ни на одной подложке,
 * `-solid` заваливает тёмный режим. Гейт — `__tests__/grBadgeContrast.test.ts`. На
 * заливке маркер — цвет текста: того же тона он слился бы с подложкой, а текст
 * поверен на 4.5:1.
 */
[data-gr-badge-dot] {
  flex-shrink: 0;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--gr-radius-full);
  background-color: var(--gr-badge-tone-bg);
}

[data-gr-badge]:is([data-gr-size='md'], [data-gr-size='lg']) [data-gr-badge-dot] {
  width: 0.5rem;
  height: 0.5rem;
}

[data-gr-badge][data-gr-dark] [data-gr-badge-dot] {
  background-color: currentColor;
}
</style>
