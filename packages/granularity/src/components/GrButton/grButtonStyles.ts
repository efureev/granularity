import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
/** Вид загрузки: спиннер или свет, проходящий по подписи. */
export type GrButtonLoadingIndicator = 'spinner' | 'shimmer'
export type GrButtonTone = GrTone
export type GrButtonSize = GrComponentSize

export type GrButtonClassOptions = {
  variant: GrButtonVariant
  tone: GrButtonTone
  size: GrButtonSize
  square: boolean
  /** Необязательные: `grButtonClass` — публичный хелпер, его зовёт и `GrRadio`. */
  disabled?: boolean
  block?: boolean
  loading?: boolean
  /** Есть аддон слева: отступ с его стороны на 2px меньше, чтобы глиф стоял оптически по центру. */
  prefix?: boolean
  /** Есть аддон справа — то же со стороны конца. */
  suffix?: boolean
}

export type GrButtonToneTokens = {
  solidBackground: string
  solidBackgroundHover: string
  solidBackgroundActive: string
  solidForeground: string
  accentText: string
  softBackground: string
  softBackgroundHover: string
  softBackgroundActive: string
  softForeground: string
  /** Рамка secondary в покое: тон приглушён, чтобы второстепенный вес не спорил с primary. */
  borderSoft: string
  border: string
  borderHover: string
  borderActive: string
}

/**
 * Фокус — `outline` с отступом, а не `ring`. Кольцо вплотную к заливке того же
 * тона читалось утолщением кнопки (индиго на индиго — 1.4:1), а `box-shadow`
 * в forced-colors выключается целиком; `outline` там остаётся и перекрашивается
 * в системный цвет.
 */
export const base
  = 'relative inline-flex max-w-full items-center justify-center select-none whitespace-nowrap [font-weight:var(--gr-button-font-weight,var(--gr-font-medium))] rounded-ss-[var(--gr-button-radius-ss,var(--gr-button-radius,0.375rem))] rounded-se-[var(--gr-button-radius-se,var(--gr-button-radius,0.375rem))] rounded-ee-[var(--gr-button-radius-ee,var(--gr-button-radius,0.375rem))] rounded-es-[var(--gr-button-radius-es,var(--gr-button-radius,0.375rem))] transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gr-ring)] disabled:cursor-not-allowed'

/**
 * Нажатие — вдавливание на 2%. Только у живой кнопки: отключённая и ждущая
 * сервер на нажатие не отвечают, и сжатие соврало бы. С reduced-motion
 * остаётся одна смена цвета.
 */
export const pressClass = 'motion-safe:active:scale-98'

/** Кнопка на всю ширину контейнера. */
export const blockClass = 'w-full'

/**
 * Отключённая кнопка гасится токенами, а не `opacity`: прозрачность разбавляет
 * выверенные на AA цвета, а кнопка чаще всего оказывается на цветной подложке,
 * где разбавленный текст проваливается первым.
 *
 * Классы применяются ВМЕСТО вариантных, а не поверх: два `bg-*` одной
 * специфичности разрулил бы порядок в сгенерированном CSS, а не порядок в
 * списке классов. Отсюда же и разбиение по вариантам: у прозрачных
 * (`outline`, `ghost`, `ghost-border`) заливки нет и в отключённом виде —
 * иначе стрелка пагинации превращалась бы в залитую плашку.
 */
export const disabledClassByVariant: Record<GrButtonVariant, string> = {
  'primary': 'bg-[var(--gr-button-disabled-bg)] text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-brd)] cursor-not-allowed',
  'secondary': 'bg-[var(--gr-button-disabled-bg)] text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-brd)] cursor-not-allowed',
  'outline': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-brd)] cursor-not-allowed',
  'ghost': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-transparent cursor-not-allowed',
  'ghost-border': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-transparent cursor-not-allowed',
}

export const grButtonBaseClass = base

/** Высота, кегль и зазор ступени — без боковых отступов: те зависят от аддонов. */
export const sizeBase: Record<GrButtonSize, string> = {
  xs: 'h-7 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] gap-1',
  sm: 'h-8 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] gap-1.5',
  md: 'h-10 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] gap-2',
  lg: 'h-11 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)] gap-2',
}

export const paddingStart: Record<GrButtonSize, string> = { xs: 'ps-2.5', sm: 'ps-3', md: 'ps-4', lg: 'ps-5' }
export const paddingEnd: Record<GrButtonSize, string> = { xs: 'pe-2.5', sm: 'pe-3', md: 'pe-4', lg: 'pe-5' }
export const paddingStartAdorned: Record<GrButtonSize, string> = { xs: 'ps-2', sm: 'ps-2.5', md: 'ps-3.5', lg: 'ps-4.5' }
export const paddingEndAdorned: Record<GrButtonSize, string> = { xs: 'pe-2', sm: 'pe-2.5', md: 'pe-3.5', lg: 'pe-4.5' }

/** Ступень целиком, без аддонов. Её же берёт отключённое радио-«кнопка» `GrRadio`. */
export const sizes: Record<GrButtonSize, string> = {
  xs: `${sizeBase.xs} ${paddingStart.xs} ${paddingEnd.xs}`,
  sm: `${sizeBase.sm} ${paddingStart.sm} ${paddingEnd.sm}`,
  md: `${sizeBase.md} ${paddingStart.md} ${paddingEnd.md}`,
  lg: `${sizeBase.lg} ${paddingStart.lg} ${paddingEnd.lg}`,
}

/** Свои глифы кнопки — спиннер и стрелка внешней ссылки — растут со ступенью, как иконка: 14 / 16 / 16 / 20. */
export const glyphSizes: Record<GrButtonSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/**
 * Квадратный режим — через `--gr-button-square-size` с размерным дефолтом в
 * fallback: потребитель задаёт переменную в своём CSS и подгоняет кнопку под
 * свою сетку (приём из `GrSlider`). Размер задаётся только здесь: инлайн-стиль
 * в SFC перекрыл бы эти классы, и переменная перестала бы что-либо значить.
 */
export const squareSizes: Record<GrButtonSize, string> = {
  xs: 'h-[var(--gr-button-square-size,1.75rem)] w-[var(--gr-button-square-size,1.75rem)] min-w-[var(--gr-button-square-size,1.75rem)] p-0',
  sm: 'h-[var(--gr-button-square-size,2rem)] w-[var(--gr-button-square-size,2rem)] min-w-[var(--gr-button-square-size,2rem)] p-0',
  md: 'h-[var(--gr-button-square-size,2.5rem)] w-[var(--gr-button-square-size,2.5rem)] min-w-[var(--gr-button-square-size,2.5rem)] p-0',
  lg: 'h-[var(--gr-button-square-size,2.75rem)] w-[var(--gr-button-square-size,2.75rem)] min-w-[var(--gr-button-square-size,2.75rem)] p-0',
}

export const tones: Record<GrButtonTone, GrButtonToneTokens> = {
  primary: {
    solidBackground: 'var(--gr-button-primary-bg,var(--gr-primary))',
    solidBackgroundHover: 'var(--gr-button-primary-bg-hover,var(--gr-primary-hover))',
    solidBackgroundActive: 'var(--gr-button-primary-bg-active,var(--gr-primary-active))',
    solidForeground: 'var(--gr-button-primary-fg,var(--gr-primary-fg))',
    accentText: 'var(--gr-accent-fg)',
    softBackground: 'var(--gr-button-primary-soft-bg)',
    softBackgroundHover: 'var(--gr-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-primary-soft-bg-active)',
    softForeground: 'var(--gr-accent-fg)',
    borderSoft: 'var(--gr-button-primary-border-soft)',
    border: 'var(--gr-button-primary-border)',
    borderHover: 'var(--gr-primary)',
    borderActive: 'var(--gr-primary-active)',
  },
  neutral: {
    // Заливка нейтральной solid-кнопки — хук: тема, где главная кнопка не серая
    // плашка, задаёт её («Глина» — графит); без хука это `--gr-secondary`.
    solidBackground: 'var(--gr-button-neutral-bg,var(--gr-secondary))',
    solidBackgroundHover: 'var(--gr-button-neutral-bg-hover,var(--gr-secondary-hover))',
    solidBackgroundActive: 'var(--gr-button-neutral-bg-active,var(--gr-secondary-active))',
    solidForeground: 'var(--gr-button-neutral-fg,var(--gr-secondary-fg))',
    accentText: 'var(--gr-fg)',
    softBackground: 'var(--gr-button-neutral-soft-bg)',
    softBackgroundHover: 'var(--gr-button-neutral-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-neutral-soft-bg-active)',
    softForeground: 'var(--gr-secondary-fg)',
    borderSoft: 'var(--gr-button-neutral-border)',
    border: 'var(--gr-button-neutral-border)',
    borderHover: 'var(--gr-brd-hover,var(--gr-brd))',
    borderActive: 'var(--gr-brd-active,var(--gr-brd))',
  },
  success: {
    solidBackground: 'var(--gr-button-success-bg,var(--gr-success))',
    solidBackgroundHover: 'var(--gr-button-success-bg-hover,var(--gr-success-hover))',
    solidBackgroundActive: 'var(--gr-button-success-bg-active,var(--gr-success-active))',
    solidForeground: 'var(--gr-button-success-fg,var(--gr-success-fg,var(--gr-fg)))',
    accentText: 'var(--gr-success-text,var(--gr-success))',
    softBackground: 'var(--gr-button-success-soft-bg)',
    softBackgroundHover: 'var(--gr-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-success-soft-bg-active)',
    softForeground: 'var(--gr-success-text,var(--gr-success))',
    borderSoft: 'var(--gr-button-success-border-soft)',
    border: 'var(--gr-button-success-border)',
    borderHover: 'var(--gr-success)',
    borderActive: 'var(--gr-success-active)',
  },
  warning: {
    solidBackground: 'var(--gr-button-warning-bg,var(--gr-warning))',
    solidBackgroundHover: 'var(--gr-button-warning-bg-hover,var(--gr-warning-hover))',
    solidBackgroundActive: 'var(--gr-button-warning-bg-active,var(--gr-warning-active))',
    solidForeground: 'var(--gr-button-warning-fg,var(--gr-warning-fg,var(--gr-fg)))',
    accentText: 'var(--gr-warning-text,var(--gr-warning))',
    softBackground: 'var(--gr-button-warning-soft-bg)',
    softBackgroundHover: 'var(--gr-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-warning-soft-bg-active)',
    softForeground: 'var(--gr-warning-text,var(--gr-warning))',
    borderSoft: 'var(--gr-button-warning-border-soft)',
    border: 'var(--gr-button-warning-border)',
    borderHover: 'var(--gr-warning)',
    borderActive: 'var(--gr-warning-active)',
  },
  danger: {
    solidBackground: 'var(--gr-button-danger-bg,var(--gr-danger))',
    solidBackgroundHover: 'var(--gr-button-danger-bg-hover,var(--gr-danger-hover))',
    solidBackgroundActive: 'var(--gr-button-danger-bg-active,var(--gr-danger-active))',
    solidForeground: 'var(--gr-button-danger-fg,var(--gr-danger-fg,var(--gr-fg)))',
    accentText: 'var(--gr-danger-text,var(--gr-danger))',
    softBackground: 'var(--gr-button-danger-soft-bg)',
    softBackgroundHover: 'var(--gr-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-danger-soft-bg-active)',
    softForeground: 'var(--gr-danger-text,var(--gr-danger))',
    borderSoft: 'var(--gr-button-danger-border-soft)',
    border: 'var(--gr-button-danger-border)',
    borderHover: 'var(--gr-danger)',
    borderActive: 'var(--gr-danger-active)',
  },
  info: {
    solidBackground: 'var(--gr-button-info-bg,var(--gr-info))',
    solidBackgroundHover: 'var(--gr-button-info-bg-hover,var(--gr-info-hover))',
    solidBackgroundActive: 'var(--gr-button-info-bg-active,var(--gr-info-active))',
    solidForeground: 'var(--gr-button-info-fg,var(--gr-info-fg,var(--gr-fg)))',
    accentText: 'var(--gr-info-text,var(--gr-info))',
    softBackground: 'var(--gr-button-info-soft-bg)',
    softBackgroundHover: 'var(--gr-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-info-soft-bg-active)',
    softForeground: 'var(--gr-info-text,var(--gr-info))',
    borderSoft: 'var(--gr-button-info-border-soft)',
    border: 'var(--gr-button-info-border)',
    borderHover: 'var(--gr-info)',
    borderActive: 'var(--gr-info-active)',
  },
  slate: {
    solidBackground: 'var(--gr-button-slate-bg,var(--gr-slate))',
    solidBackgroundHover: 'var(--gr-button-slate-bg-hover,var(--gr-slate-hover))',
    solidBackgroundActive: 'var(--gr-button-slate-bg-active,var(--gr-slate-active))',
    solidForeground: 'var(--gr-button-slate-fg,var(--gr-slate-fg,var(--gr-fg)))',
    accentText: 'var(--gr-slate-text,var(--gr-slate))',
    softBackground: 'var(--gr-button-slate-soft-bg)',
    softBackgroundHover: 'var(--gr-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-slate-soft-bg-active)',
    softForeground: 'var(--gr-slate-text,var(--gr-slate))',
    borderSoft: 'var(--gr-button-slate-border-soft)',
    border: 'var(--gr-button-slate-border)',
    borderHover: 'var(--gr-slate)',
    borderActive: 'var(--gr-slate-active)',
  },
  azure: {
    solidBackground: 'var(--gr-button-azure-bg,var(--gr-azure))',
    solidBackgroundHover: 'var(--gr-button-azure-bg-hover,var(--gr-azure-hover))',
    solidBackgroundActive: 'var(--gr-button-azure-bg-active,var(--gr-azure-active))',
    solidForeground: 'var(--gr-button-azure-fg,var(--gr-azure-fg,var(--gr-fg)))',
    accentText: 'var(--gr-azure-text,var(--gr-azure))',
    softBackground: 'var(--gr-button-azure-soft-bg)',
    softBackgroundHover: 'var(--gr-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-azure-soft-bg-active)',
    softForeground: 'var(--gr-azure-text,var(--gr-azure))',
    borderSoft: 'var(--gr-button-azure-border-soft)',
    border: 'var(--gr-button-azure-border)',
    borderHover: 'var(--gr-azure)',
    borderActive: 'var(--gr-azure-active)',
  },
}

/**
 * Объём solid-кнопки: блик в 1px по верхней кромке и тень `--gr-shadow-1`, в
 * нажатии тень уходит внутрь. Отключённая кнопка этих классов не получает —
 * объём снимается вместе с вариантом.
 *
 * `--gr-button-divider` — шов между соседними solid-звеньями, его ставит
 * `GrButtonGroup`. Не своим `box-shadow`: лист группы живёт в слое
 * компонентов и утилите кнопки проиграл бы при любой специфичности.
 */
export const solidShadowClass = 'shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow)] active:shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow-active)] hover:active:shadow-[var(--gr-button-divider,0_0_transparent),var(--gr-button-shadow-active)]'

/** «Обычная» нейтральная кнопка лежит на поверхности карточки и чуть приподнята над ней. */
export const surfaceShadowClass = 'shadow-[var(--gr-shadow-1)]'

function withVar(token: string): string {
  return `[${token}]`
}

/**
 * Подложка прозрачных весов (`outline`, `ghost`, `ghost-border`) под указателем.
 * Токен тона они делят с плашкой `secondary`, поэтому оттенок, общий для всех
 * тонов («Глина» — оттенок бумаги), тема задаёт отдельным хуком, не трогая плашку.
 */
function transparentFill(tokens: GrButtonToneTokens): { hover: string, active: string } {
  return {
    hover: `var(--gr-button-ghost-bg-hover,${tokens.softBackgroundHover})`,
    active: `var(--gr-button-ghost-bg-active,${tokens.softBackgroundActive})`,
  }
}

export function variantClass(variant: GrButtonVariant, tone: GrButtonTone): string {
  const tokens = tones[tone]
  const transparent = transparentFill(tokens)

  if (variant === 'primary') {
    return [
      `bg-${withVar(tokens.solidBackground)}`,
      `text-${withVar(tokens.solidForeground)}`,
      `border border-${withVar(tokens.solidBackground)}`,
      `hover:bg-${withVar(tokens.solidBackgroundHover)}`,
      `hover:border-${withVar(tokens.solidBackgroundHover)}`,
      `active:bg-${withVar(tokens.solidBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.solidBackgroundActive)}`,
      `active:border-${withVar(tokens.solidBackgroundActive)}`,
      `hover:active:border-${withVar(tokens.solidBackgroundActive)}`,
      solidShadowClass,
    ].join(' ')
  }

  if (variant === 'secondary') {
    return [
      `bg-${withVar(tokens.softBackground)}`,
      `text-${withVar(tokens.softForeground)}`,
      `border border-${withVar(tokens.borderSoft)}`,
      `hover:bg-${withVar(tokens.softBackgroundHover)}`,
      `hover:border-${withVar(tokens.border)}`,
      `active:bg-${withVar(tokens.softBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.softBackgroundActive)}`,
      `active:border-${withVar(tokens.borderHover)}`,
      `hover:active:border-${withVar(tokens.borderHover)}`,
      tone === 'neutral' ? surfaceShadowClass : '',
    ].filter(Boolean).join(' ')
  }

  if (variant === 'outline') {
    return [
      'bg-transparent',
      `text-${withVar(tokens.accentText)}`,
      `border border-${withVar(tokens.border)}`,
      `hover:bg-${withVar(transparent.hover)}`,
      `hover:border-${withVar(tokens.borderHover)}`,
      `active:bg-${withVar(transparent.active)}`,
      `hover:active:bg-${withVar(transparent.active)}`,
      `active:border-${withVar(tokens.borderActive)}`,
      `hover:active:border-${withVar(tokens.borderActive)}`,
    ].join(' ')
  }

  if (variant === 'ghost') {
    return [
      'bg-transparent',
      `text-${withVar(tokens.accentText)}`,
      'border border-transparent',
      `hover:bg-${withVar(transparent.hover)}`,
      `active:bg-${withVar(transparent.active)}`,
      `hover:active:bg-${withVar(transparent.active)}`,
    ].join(' ')
  }

  return [
    'bg-transparent',
    `text-${withVar(tokens.accentText)}`,
    'border border-transparent',
    `hover:bg-${withVar(transparent.hover)}`,
    `hover:border-${withVar(tokens.border)}`,
    `active:bg-${withVar(transparent.active)}`,
    `hover:active:bg-${withVar(transparent.active)}`,
    `active:border-${withVar(tokens.borderActive)}`,
    `hover:active:border-${withVar(tokens.borderActive)}`,
  ].join(' ')
}

function sizeClass(options: GrButtonClassOptions): string {
  if (options.square)
    return squareSizes[options.size]

  return [
    sizeBase[options.size],
    options.prefix ? paddingStartAdorned[options.size] : paddingStart[options.size],
    options.suffix ? paddingEndAdorned[options.size] : paddingEnd[options.size],
  ].join(' ')
}

export function grButtonClass(options: GrButtonClassOptions): string {
  return [
    sizeClass(options),
    options.block ? blockClass : '',
    // `loading` отключённым не выглядит: о нём говорит спиннер. Но нажатие он
    // не принимает — и не изображает.
    options.disabled ? disabledClassByVariant[options.variant] : variantClass(options.variant, options.tone),
    options.disabled || options.loading ? '' : pressClass,
  ].filter(Boolean).join(' ')
}
