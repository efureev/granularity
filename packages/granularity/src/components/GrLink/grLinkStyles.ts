import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

/**
 * Архитектура цвета GrLink (согласована с остальной GR, ср. GrButton):
 *
 * - `tone` — семантический ЦВЕТ из общей палитры `GrTone`
 *   (`primary | neutral | success | warning | danger | info | slate | azure`).
 * - `variant` — уровень акцента (СТРУКТУРА), независимый от цвета:
 *   - `default` — текст окрашен в `tone` в покое, `tone-hover`/`tone-active` при
 *     наведении/нажатии (обычная акцентная ссылка);
 *   - `muted` — приглушённый текст (`--gr-muted-fg`) в покое, окрашивается в `tone`
 *     при наведении (вторичные/inline-ссылки в плотных областях).
 *
 * Оси ортогональны намеренно: «красная ссылка» и «приглушённая ссылка» —
 * независимые решения, и любая их комбинация осмысленна.
 */
export type GrLinkTone = GrTone
export type GrLinkVariant = 'default' | 'muted'
export type GrLinkUnderline = 'auto' | 'always' | 'none'
export type GrLinkSize = GrComponentSize

// Базовые классы корневого элемента (`<a>`/`<span>`). Вынесены сюда,
// чтобы быть единственным источником истины как для шаблона, так и для safelist.
export const baseRootClass = 'inline-flex items-center gap-1 rounded-[6px] transition-colors duration-150'
export const focusRingClass = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const sizeClassBySize: Record<GrLinkSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

// Цвет управляется CSS-переменными (как трек в GrSwitch): один набор классов
// вместо class-эксплозии 8 тонов × 3 состояния. Safelist остаётся крошечным.
export const colorClass = 'text-[var(--gr-link-color)] visited:text-[var(--gr-link-color)] hover:text-[var(--gr-link-color-hover)] active:text-[var(--gr-link-color-active)]'

type GrLinkToneColors = { base: string, hover: string, active: string }

/**
 * Пары «цвет / hover / active» на каждый тон из ролей темы.
 *
 * Ссылка — это ТЕКСТ на фоне страницы, поэтому тона берутся из `-text`, а не
 * из насыщенного `--gr-{tone}`: последний под текст не рассчитан
 * (`--gr-success` на `--gr-bg` — 2.2:1). Готовых `-text-hover/-active` в
 * системе нет, поэтому они выводятся тем же приёмом, что и `--gr-{tone}-hover`
 * в `tokens.css` — подмесом `--gr-fg`. В светлой теме это делает ссылку темнее
 * при наведении, в тёмной — светлее, то есть в обеих контраст растёт.
 */
function toneTextColors(tone: string): GrLinkToneColors {
  const base = `var(--gr-${tone}-text)`

  return {
    base,
    hover: `color-mix(in srgb, ${base} 92%, var(--gr-fg))`,
    active: `color-mix(in srgb, ${base} 84%, var(--gr-fg))`,
  }
}

const linkToneColors: Record<GrLinkTone, GrLinkToneColors> = {
  primary: { base: 'var(--gr-primary)', hover: 'var(--gr-primary-hover)', active: 'var(--gr-primary-active)' },
  // Нейтральная ссылка: читаемый `--gr-fg` в покое, акцент `--gr-primary` при наведении.
  neutral: { base: 'var(--gr-fg)', hover: 'var(--gr-primary)', active: 'var(--gr-primary-active)' },
  success: toneTextColors('success'),
  warning: toneTextColors('warning'),
  danger: toneTextColors('danger'),
  info: toneTextColors('info'),
  slate: toneTextColors('slate'),
  azure: toneTextColors('azure'),
}

/** Инлайновые CSS-переменные цвета для текущей комбинации `tone` × `variant`. */
export function grLinkColorStyle(options: { tone: GrLinkTone, variant: GrLinkVariant, disabled: boolean }): Record<string, string> {
  if (options.disabled) return {}

  const colors = linkToneColors[options.tone] ?? linkToneColors.primary

  if (options.variant === 'muted') {
    return {
      '--gr-link-color': 'var(--gr-muted-fg)',
      '--gr-link-color-hover': colors.base,
      '--gr-link-color-active': colors.active,
    }
  }

  return {
    '--gr-link-color': colors.base,
    '--gr-link-color-hover': colors.hover,
    '--gr-link-color-active': colors.active,
  }
}

/**
 * Отключённая ссылка гасится цветом, а не `opacity`: прозрачность разбавляет
 * выверенный на AA `--gr-muted-fg` и роняет контраст ниже нормы.
 */
export const disabledStateClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'

const UNDERLINE_VALUES: readonly GrLinkUnderline[] = ['auto', 'always', 'none']

function underlineClass(underline: GrLinkUnderline, disabled: boolean): string {
  if (disabled) return 'no-underline'
  if (underline === 'always') return 'underline underline-offset-4'
  if (underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

// Derived from `underlineClass` so that there is a single source of truth:
// any change/extension of the underline logic is automatically reflected
// in the safelist without manual updates.
export const underlineClasses: readonly string[] = [...new Set(
  UNDERLINE_VALUES.flatMap(u => [underlineClass(u, false), underlineClass(u, true)]),
)]

export function grLinkClass(options: { size: GrLinkSize, underline: GrLinkUnderline, disabled: boolean }): string {
  return [
    sizeClassBySize[options.size],
    underlineClass(options.underline, options.disabled),
    options.disabled ? disabledStateClass : colorClass,
  ]
    .filter(Boolean)
    .join(' ')
}
