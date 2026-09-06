import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrBadgeTone = GrTone

/**
 * Тон маркера — отдельным литеральным перечислением, а не `GrTone`.
 *
 * Компилятор SFC выводит рантайм-типы пропов из TypeScript, но `GrTone` это
 * `typeof GR_TONES[number]`, и развернуть его в конструкторы он не умеет. У
 * `dot?: GrTone | boolean` из объединения выживал один `Boolean`, и строковый
 * тон отбраковывался предупреждением Vue у каждого потребителя — при том, что
 * компонент работал. Литеральное объединение разрешается и даёт
 * `type: [Boolean, String]`; так же написан `showTooltip` у `GrSlider`.
 *
 * От расхождения с `GR_TONES` держит `assertDotToneCoversTones` ниже: списки
 * обязаны совпадать в обе стороны, иначе `vue-tsc` роняет сборку.
 */
export type GrBadgeDotTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'

type AssertMutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

export const assertDotToneCoversTones: AssertMutual<GrBadgeDotTone, GrTone> = true
export type GrBadgeSize = GrComponentSize
export type GrBadgeRadius = 'square' | 'semi' | 'round'
export const sizeClassBySize: Record<GrBadgeSize, string> = {
  xs: 'px-2 py-0.4 text-[length:var(--gr-control-text-2xs)] leading-[var(--gr-control-leading-2xs)]',
  sm: 'px-2.5 py-0.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  md: 'px-3 py-1 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  lg: 'px-3.5 py-1.5 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
}
/**
 * Иконка перед подписью растёт медленнее кегля: на нижних ступенях плашка
 * узкая, и иконка «один в один с текстом» разгоняла бы её по высоте.
 *
 * Своя карта, а не заимствованная у `GrChip`: у чипа фиксированная высота
 * плитки и своя шкала кегля, и совпадение значений на средних ступенях —
 * совпадение, а не общий контракт.
 */
export const badgeIconSizeClassBySize: Record<GrBadgeSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
}

/** Иконка не жмётся: подпись бейджа не переносится, сжиматься должно нечему. */
export const badgeIconClass = 'shrink-0'

export const semiRadiusClassBySize: Record<GrBadgeSize, string> = {
  xs: 'rounded-[var(--gr-badge-semi-radius-xs,3px)]',
  sm: 'rounded-[var(--gr-badge-semi-radius-sm,3px)]',
  md: 'rounded-[var(--gr-badge-semi-radius-md,5px)]',
  lg: 'rounded-[var(--gr-badge-semi-radius-lg,7px)]',
}
export const lightToneClassByTone: Record<GrBadgeTone, string> = {
  neutral: 'bg-[var(--gr-muted)] text-[var(--gr-fg)] border-[var(--gr-brd)]',
  primary:
    'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)] border-[color-mix(in_srgb,var(--gr-primary)_30%,var(--gr-accent))]',
  // Текст на тонированной подложке — только `-text`, никогда не насыщенный тон:
  // `--gr-success` на `--gr-success-light` даёт 2.24:1, `-text` — 6.78:1.
  // slate/azure ниже уже были сделаны правильно.
  success: 'bg-[var(--gr-success-light)] text-[var(--gr-success-text)] border-[color-mix(in_srgb,var(--gr-success)_30%,var(--gr-success-light))]',
  warning: 'bg-[var(--gr-warning-light)] text-[var(--gr-warning-text)] border-[color-mix(in_srgb,var(--gr-warning)_30%,var(--gr-warning-light))]',
  danger: 'bg-[var(--gr-danger-light)] text-[var(--gr-danger-text)] border-[color-mix(in_srgb,var(--gr-danger)_30%,var(--gr-danger-light))]',
  info: 'bg-[var(--gr-info-light)] text-[var(--gr-info-text)] border-[color-mix(in_srgb,var(--gr-info)_30%,var(--gr-info-light))]',
  slate: 'bg-[var(--gr-slate-light)] text-[var(--gr-slate-text)] border-[color-mix(in_srgb,var(--gr-slate)_30%,var(--gr-slate-light))]',
  azure: 'bg-[var(--gr-azure-light)] text-[var(--gr-azure-text)] border-[color-mix(in_srgb,var(--gr-azure)_30%,var(--gr-azure-light))]',
}
/**
 * Заливка filled-бейджа идёт через покомпонентный слой `--gr-badge-{tone}-*`, а
 * не напрямую из роли тона, потому что нужный вес у тем разный.
 *
 * В светлой теме `--gr-{tone}` — это яркая заливка под **тёмный** текст (`-fg`
 * там обязан быть тёмным: белый на `--gr-success` даёт 2.54:1), и filled-бейдж
 * читался как тяжёлая почти чёрная плашка. Слой уводит его на `-solid`/`-solid-fg`
 * — заливку кнопочного веса под светлый текст, ту же, что у solid-кнопок.
 * В тёмной теме пастельная заливка с тёмным текстом — штатная конвенция, и слой
 * оставляет прежние роли. Значения — `themes/{light,dark}.css`.
 */
export const darkToneClassByTone: Record<GrBadgeTone, string> = {
  // Нейтральный вес — инверсия страницы, а не тон: `-solid`-роли у него нет.
  neutral: 'bg-[var(--gr-badge-neutral-bg,var(--gr-fg))] text-[var(--gr-badge-neutral-fg,var(--gr-bg))] border-[color-mix(in_srgb,var(--gr-fg)_35%,var(--gr-brd))]',
  primary: 'bg-[var(--gr-badge-primary-bg,var(--gr-primary-solid))] text-[var(--gr-badge-primary-fg,var(--gr-primary-solid-fg))] border-[var(--gr-badge-primary-bg,var(--gr-primary-solid))]',
  success: 'bg-[var(--gr-badge-success-bg,var(--gr-success-solid))] text-[var(--gr-badge-success-fg,var(--gr-success-solid-fg))] border-[var(--gr-badge-success-bg,var(--gr-success-solid))]',
  warning: 'bg-[var(--gr-badge-warning-bg,var(--gr-warning-solid))] text-[var(--gr-badge-warning-fg,var(--gr-warning-solid-fg))] border-[var(--gr-badge-warning-bg,var(--gr-warning-solid))]',
  danger: 'bg-[var(--gr-badge-danger-bg,var(--gr-danger-solid))] text-[var(--gr-badge-danger-fg,var(--gr-danger-solid-fg))] border-[var(--gr-badge-danger-bg,var(--gr-danger-solid))]',
  info: 'bg-[var(--gr-badge-info-bg,var(--gr-info-solid))] text-[var(--gr-badge-info-fg,var(--gr-info-solid-fg))] border-[var(--gr-badge-info-bg,var(--gr-info-solid))]',
  slate: 'bg-[var(--gr-badge-slate-bg,var(--gr-slate-solid))] text-[var(--gr-badge-slate-fg,var(--gr-slate-solid-fg))] border-[var(--gr-badge-slate-bg,var(--gr-slate-solid))]',
  azure: 'bg-[var(--gr-badge-azure-bg,var(--gr-azure-solid))] text-[var(--gr-badge-azure-fg,var(--gr-azure-solid-fg))] border-[var(--gr-badge-azure-bg,var(--gr-azure-solid))]',
}
/**
 * Экспортируются ради `GrChip`: у чипа те же три радиуса и та же палитра тонов,
 * и копия этих двух ветвлений разошлась бы с оригиналом молча. Свои у чипа
 * только размеры — он интерактивен, и цель нажатия у него не метки, а контрола.
 */
export function radiusClass(radius: GrBadgeRadius, size: GrBadgeSize): string {
  if (radius === 'square')
    return 'rounded-[var(--gr-radius-none)]'
  if (radius === 'semi')
    return semiRadiusClassBySize[size]
  return 'rounded-[var(--gr-radius-full)]'
}
export function toneClass(tone: GrBadgeTone, dark: boolean): string {
  return dark ? darkToneClassByTone[tone] : lightToneClassByTone[tone]
}
export function grBadgeClass(options: { tone: GrBadgeTone, dark: boolean, size: GrBadgeSize, radius: GrBadgeRadius }): string {
  return [
    radiusClass(options.radius, options.size),
    sizeClassBySize[options.size],
    toneClass(options.tone, options.dark),
  ].join(' ')
}

/**
 * Точка-маркер перед подписью.
 *
 * Кружок мельче иконки и растёт медленнее: маркер обязан оставаться маркером,
 * а не превращаться в третий элемент строки. Повтор значений на концах шкалы —
 * тот же приём, что у `badgeIconSizeClassBySize`.
 */
export const badgeDotSizeClassBySize: Record<GrBadgeSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2 w-2',
}

/** Маркер не жмётся: подпись бейджа не переносится, сжиматься нечему. */
export const badgeDotClass = 'shrink-0 rounded-[var(--gr-radius-full)]'

/**
 * Маркер на мягкой подложке красится **тем же покомпонентным слоем**, что и
 * заливка filled-бейджа, и это не экономия на токенах.
 *
 * Роль тона напрямую здесь не работает ни в одном виде, и обе ветки измерены:
 * `--gr-{tone}` в светлой теме — яркая заливка под тёмный текст, как маркер она
 * не берёт 3:1 **ни на одной** подложке (`success` 2.06–2.32, `warning`
 * 2.27–2.56); `--gr-{tone}-solid` берёт светлую тему и заваливает тёмную
 * (до 1.37). Слой `--gr-badge-{tone}-bg` как раз и означает «насыщенный вес,
 * который читается в этой теме»: `-solid` в светлой, роль тона в тёмной.
 *
 * На нём проходят все 128 пар «тон маркера × тон бейджа × тема», включая
 * одноимённую, — поэтому булев `dot` берёт тон самого бейджа, а не отдельный
 * цвет. Гейт — `__tests__/grBadgeContrast.test.ts`.
 */
export const badgeDotToneClass: Record<GrBadgeTone, string> = {
  neutral: 'bg-[var(--gr-badge-neutral-bg)]',
  primary: 'bg-[var(--gr-badge-primary-bg)]',
  success: 'bg-[var(--gr-badge-success-bg)]',
  warning: 'bg-[var(--gr-badge-warning-bg)]',
  danger: 'bg-[var(--gr-badge-danger-bg)]',
  info: 'bg-[var(--gr-badge-info-bg)]',
  slate: 'bg-[var(--gr-badge-slate-bg)]',
  azure: 'bg-[var(--gr-badge-azure-bg)]',
}

/**
 * Маркер на **заливке** — цветом текста бейджа.
 *
 * Тон здесь не годится по построению: подложка filled-бейджа сама берётся из
 * `--gr-badge-{tone}-bg`, и маркер того же тона слился бы с ней в один цвет.
 * `currentColor` равен тексту бейджа, а он поверен на AA 4.5:1 — то есть
 * заведомо проходит порог для графики.
 */
export const badgeDotCurrentColorClass = 'bg-[currentColor]'

export function badgeDotClassFor(options: {
  tone: GrBadgeTone
  dark: boolean
  size: GrBadgeSize
}): string {
  return [
    badgeDotClass,
    badgeDotSizeClassBySize[options.size],
    options.dark ? badgeDotCurrentColorClass : badgeDotToneClass[options.tone],
  ].join(' ')
}
