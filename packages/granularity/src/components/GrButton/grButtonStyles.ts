import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
/** Вид загрузки: спиннер, свет по подписи или отрезок, бегущий по нижней кромке. */
export type GrButtonLoadingIndicator = 'spinner' | 'shimmer' | 'track'
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
  /** Префикс в ячейке у начального края: отступа с той стороны нет, его место — у ячейки. */
  prefixCell?: boolean
  /** Нажатый переключатель — компонент ставит ему `data-gr-pressed`. */
  pressed?: boolean
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
  /** Подложка прозрачных весов под указателем и в нажатии — токен темы на тон. */
  ghostBackgroundHover: string
  ghostBackgroundActive: string
  softForeground: string
  /** Рамка secondary в покое: тон приглушён, чтобы второстепенный вес не спорил с primary. */
  borderSoft: string
  /** Рамка secondary под указателем — токен темы: тема без рамки у мягкого веса держит её прозрачной. */
  borderSoftHover: string
  border: string
  borderHover: string
  borderActive: string
  /** Цвет тени тона у solid-кнопки — токен темы на тон: формула темы не знает тона элемента. */
  glow: string
}

/**
 * Фокус — `outline` с отступом, а не `ring`. Кольцо вплотную к заливке того же
 * тона читалось утолщением кнопки (индиго на индиго — 1.4:1), а `box-shadow`
 * в forced-colors выключается целиком; `outline` там остаётся и перекрашивается
 * в системный цвет.
 */
export const base
  = 'relative isolate inline-flex max-w-full items-center justify-center select-none whitespace-nowrap [font-weight:var(--gr-button-font-weight)] rounded-ss-[var(--gr-button-radius-ss,var(--gr-button-corner-radius))] rounded-se-[var(--gr-button-radius-se,var(--gr-button-corner-radius))] rounded-ee-[var(--gr-button-radius-ee,var(--gr-button-corner-radius))] rounded-es-[var(--gr-button-radius-es,var(--gr-button-corner-radius))] transition-[color,background-color,border-color,box-shadow,transform,outline-offset] duration-[var(--gr-button-motion-duration)] ease-[var(--gr-button-motion-ease)] outline-none outline-offset-[var(--gr-button-focus-offset-from)] motion-reduce:outline-offset-[var(--gr-button-focus-offset)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[var(--gr-button-focus-offset)] focus-visible:outline-[var(--gr-ring)] disabled:cursor-not-allowed'

/**
 * Нажатие — вдавливание на 2%, наведение — подъём темы (`--gr-button-lift`).
 * Только у живой кнопки: отключённая и ждущая сервер на указатель не отвечают,
 * и движение соврало бы. С reduced-motion остаётся одна смена цвета.
 */
export const pressClass = 'motion-safe:active:scale-[var(--gr-button-press-scale)] motion-safe:hover:translate-y-[var(--gr-button-lift)]'

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
  'primary': 'bg-[var(--gr-button-disabled-bg)] bg-[image:var(--gr-button-disabled-image)] text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-brd)] [border-style:var(--gr-button-disabled-border-style)] cursor-not-allowed',
  'secondary': 'bg-[var(--gr-button-disabled-bg)] bg-[image:var(--gr-button-disabled-image)] text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-brd)] [border-style:var(--gr-button-disabled-border-style)] cursor-not-allowed',
  'outline': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-[var(--gr-button-disabled-outline-brd)] [border-style:var(--gr-button-disabled-border-style)] cursor-not-allowed',
  'ghost': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-transparent cursor-not-allowed',
  'ghost-border': 'bg-transparent text-[var(--gr-button-disabled-fg)] border border-transparent cursor-not-allowed',
}

export const grButtonBaseClass = base

/** Радиус ступени из темы — его берёт `--gr-button-corner-radius`, пока ручка `--gr-button-radius` не задана. */
export const stepRadius: Record<GrButtonSize, string> = {
  xs: '[--gr-button-step-radius:var(--gr-button-radius-xs)]',
  sm: '[--gr-button-step-radius:var(--gr-button-radius-sm)]',
  md: '[--gr-button-step-radius:var(--gr-button-radius-md)]',
  lg: '[--gr-button-step-radius:var(--gr-button-radius-lg)]',
}

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
  xs: `${sizeBase.xs} ${stepRadius.xs} ${paddingStart.xs} ${paddingEnd.xs}`,
  sm: `${sizeBase.sm} ${stepRadius.sm} ${paddingStart.sm} ${paddingEnd.sm}`,
  md: `${sizeBase.md} ${stepRadius.md} ${paddingStart.md} ${paddingEnd.md}`,
  lg: `${sizeBase.lg} ${stepRadius.lg} ${paddingStart.lg} ${paddingEnd.lg}`,
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
    solidBackground: 'var(--gr-button-primary-bg)',
    solidBackgroundHover: 'var(--gr-button-primary-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-primary-bg-active)',
    solidForeground: 'var(--gr-button-primary-fg)',
    accentText: 'var(--gr-accent-fg)',
    softBackground: 'var(--gr-button-primary-soft-bg)',
    softBackgroundHover: 'var(--gr-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-primary-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-primary-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-primary-ghost-bg-active)',
    softForeground: 'var(--gr-accent-fg)',
    borderSoft: 'var(--gr-button-primary-border-soft)',
    border: 'var(--gr-button-primary-border)',
    borderSoftHover: 'var(--gr-button-primary-border-soft-hover)',
    borderHover: 'var(--gr-button-primary-border-hover)',
    borderActive: 'var(--gr-button-primary-border-active)',
    glow: 'var(--gr-button-primary-glow)',
  },
  neutral: {
    solidBackground: 'var(--gr-button-neutral-bg)',
    solidBackgroundHover: 'var(--gr-button-neutral-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-neutral-bg-active)',
    solidForeground: 'var(--gr-button-neutral-fg)',
    accentText: 'var(--gr-fg)',
    softBackground: 'var(--gr-button-neutral-soft-bg)',
    softBackgroundHover: 'var(--gr-button-neutral-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-neutral-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-neutral-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-neutral-ghost-bg-active)',
    softForeground: 'var(--gr-secondary-fg)',
    borderSoft: 'var(--gr-button-neutral-border-soft)',
    border: 'var(--gr-button-neutral-border)',
    borderSoftHover: 'var(--gr-button-neutral-border-soft-hover)',
    borderHover: 'var(--gr-button-neutral-border-hover)',
    borderActive: 'var(--gr-button-neutral-border-active)',
    glow: 'var(--gr-button-neutral-glow)',
  },
  success: {
    solidBackground: 'var(--gr-button-success-bg)',
    solidBackgroundHover: 'var(--gr-button-success-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-success-bg-active)',
    solidForeground: 'var(--gr-button-success-fg)',
    accentText: 'var(--gr-success-text)',
    softBackground: 'var(--gr-button-success-soft-bg)',
    softBackgroundHover: 'var(--gr-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-success-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-success-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-success-ghost-bg-active)',
    softForeground: 'var(--gr-success-text)',
    borderSoft: 'var(--gr-button-success-border-soft)',
    border: 'var(--gr-button-success-border)',
    borderSoftHover: 'var(--gr-button-success-border-soft-hover)',
    borderHover: 'var(--gr-button-success-border-hover)',
    borderActive: 'var(--gr-button-success-border-active)',
    glow: 'var(--gr-button-success-glow)',
  },
  warning: {
    solidBackground: 'var(--gr-button-warning-bg)',
    solidBackgroundHover: 'var(--gr-button-warning-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-warning-bg-active)',
    solidForeground: 'var(--gr-button-warning-fg)',
    accentText: 'var(--gr-warning-text)',
    softBackground: 'var(--gr-button-warning-soft-bg)',
    softBackgroundHover: 'var(--gr-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-warning-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-warning-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-warning-ghost-bg-active)',
    softForeground: 'var(--gr-warning-text)',
    borderSoft: 'var(--gr-button-warning-border-soft)',
    border: 'var(--gr-button-warning-border)',
    borderSoftHover: 'var(--gr-button-warning-border-soft-hover)',
    borderHover: 'var(--gr-button-warning-border-hover)',
    borderActive: 'var(--gr-button-warning-border-active)',
    glow: 'var(--gr-button-warning-glow)',
  },
  danger: {
    solidBackground: 'var(--gr-button-danger-bg)',
    solidBackgroundHover: 'var(--gr-button-danger-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-danger-bg-active)',
    solidForeground: 'var(--gr-button-danger-fg)',
    accentText: 'var(--gr-danger-text)',
    softBackground: 'var(--gr-button-danger-soft-bg)',
    softBackgroundHover: 'var(--gr-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-danger-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-danger-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-danger-ghost-bg-active)',
    softForeground: 'var(--gr-danger-text)',
    borderSoft: 'var(--gr-button-danger-border-soft)',
    border: 'var(--gr-button-danger-border)',
    borderSoftHover: 'var(--gr-button-danger-border-soft-hover)',
    borderHover: 'var(--gr-button-danger-border-hover)',
    borderActive: 'var(--gr-button-danger-border-active)',
    glow: 'var(--gr-button-danger-glow)',
  },
  info: {
    solidBackground: 'var(--gr-button-info-bg)',
    solidBackgroundHover: 'var(--gr-button-info-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-info-bg-active)',
    solidForeground: 'var(--gr-button-info-fg)',
    accentText: 'var(--gr-info-text)',
    softBackground: 'var(--gr-button-info-soft-bg)',
    softBackgroundHover: 'var(--gr-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-info-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-info-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-info-ghost-bg-active)',
    softForeground: 'var(--gr-info-text)',
    borderSoft: 'var(--gr-button-info-border-soft)',
    border: 'var(--gr-button-info-border)',
    borderSoftHover: 'var(--gr-button-info-border-soft-hover)',
    borderHover: 'var(--gr-button-info-border-hover)',
    borderActive: 'var(--gr-button-info-border-active)',
    glow: 'var(--gr-button-info-glow)',
  },
  slate: {
    solidBackground: 'var(--gr-button-slate-bg)',
    solidBackgroundHover: 'var(--gr-button-slate-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-slate-bg-active)',
    solidForeground: 'var(--gr-button-slate-fg)',
    accentText: 'var(--gr-slate-text)',
    softBackground: 'var(--gr-button-slate-soft-bg)',
    softBackgroundHover: 'var(--gr-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-slate-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-slate-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-slate-ghost-bg-active)',
    softForeground: 'var(--gr-slate-text)',
    borderSoft: 'var(--gr-button-slate-border-soft)',
    border: 'var(--gr-button-slate-border)',
    borderSoftHover: 'var(--gr-button-slate-border-soft-hover)',
    borderHover: 'var(--gr-button-slate-border-hover)',
    borderActive: 'var(--gr-button-slate-border-active)',
    glow: 'var(--gr-button-slate-glow)',
  },
  azure: {
    solidBackground: 'var(--gr-button-azure-bg)',
    solidBackgroundHover: 'var(--gr-button-azure-bg-hover)',
    solidBackgroundActive: 'var(--gr-button-azure-bg-active)',
    solidForeground: 'var(--gr-button-azure-fg)',
    accentText: 'var(--gr-azure-text)',
    softBackground: 'var(--gr-button-azure-soft-bg)',
    softBackgroundHover: 'var(--gr-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-azure-soft-bg-active)',
    ghostBackgroundHover: 'var(--gr-button-azure-ghost-bg-hover)',
    ghostBackgroundActive: 'var(--gr-button-azure-ghost-bg-active)',
    softForeground: 'var(--gr-azure-text)',
    borderSoft: 'var(--gr-button-azure-border-soft)',
    border: 'var(--gr-button-azure-border)',
    borderSoftHover: 'var(--gr-button-azure-border-soft-hover)',
    borderHover: 'var(--gr-button-azure-border-hover)',
    borderActive: 'var(--gr-button-azure-border-active)',
    glow: 'var(--gr-button-azure-glow)',
  },
}

/**
 * Объём solid-кнопки: тень темы (`--gr-button-shadow`), под ней — тень цвета
 * тона (`--gr-button-glow` с цветом `--gr-button-<тон>-glow`), в нажатии тень
 * уходит внутрь. Отключённая кнопка этих классов не получает — объём снимается
 * вместе с вариантом.
 *
 * `--gr-button-divider` — шов между соседними solid-звеньями, его ставит
 * `GrButtonGroup`. Не своим `box-shadow`: лист группы живёт в слое
 * компонентов и утилите кнопки проиграл бы при любой специфичности.
 */
export function solidShadowClass(tokens: GrButtonToneTokens): string {
  const divider = 'var(--gr-button-divider,0_0_transparent)'
  return [
    `shadow-[${divider},var(--gr-button-shadow),var(--gr-button-glow)_${tokens.glow}]`,
    `hover:shadow-[${divider},var(--gr-button-shadow),var(--gr-button-glow-hover)_${tokens.glow}]`,
    `active:shadow-[${divider},var(--gr-button-shadow-active)]`,
    `hover:active:shadow-[${divider},var(--gr-button-shadow-active)]`,
  ].join(' ')
}

/** Слой поверх заливки solid-кнопки из темы: у «Тактильной» — градиент света. */
export const solidImageClass = 'bg-[image:var(--gr-button-solid-image)]'

/** «Обычная» нейтральная кнопка лежит на поверхности карточки и чуть приподнята над ней. */
export const surfaceShadowClass = 'shadow-[var(--gr-button-surface-shadow)]'

function withVar(token: string): string {
  return `[${token}]`
}

/**
 * Подложка прозрачных весов (`outline`, `ghost`, `ghost-border`) под указателем:
 * токен темы на тон, отдельный от плашки `secondary`, — тема задаёт оттенок, общий
 * для всех тонов («Глина» — оттенок бумаги), не трогая плашку. Хук поверх — одна
 * подложка на все тоны от приложения.
 */
function transparentFill(tokens: GrButtonToneTokens): { hover: string, active: string } {
  return {
    hover: `var(--gr-button-ghost-bg-hover,${tokens.ghostBackgroundHover})`,
    active: `var(--gr-button-ghost-bg-active,${tokens.ghostBackgroundActive})`,
  }
}

export function variantClass(variant: GrButtonVariant, tone: GrButtonTone): string {
  return variantClassOf(variant, tone)
}

/**
 * Нажатая кнопка-переключатель (`aria-pressed="true"`, атрибут `data-gr-pressed`
 * ставит компонент) держит вид своего нажатого состояния: иначе включённое и
 * выключенное различались бы только для AT. Классы — зеркало `active:` того же
 * веса, с `hover:` — чтобы наведение их не перебивало. Получает их только нажатая
 * кнопка: зеркало — пятая часть строки классов, и каждая обычная кнопка несла бы
 * его в разметке впустую.
 */
export function pressedClass(variant: GrButtonVariant, tone: GrButtonTone): string {
  return variantClassOf(variant, tone)
    .split(' ')
    .filter(token => token.startsWith('active:'))
    .map(token => token.slice('active:'.length))
    .flatMap(rest => [`data-[gr-pressed]:${rest}`, `data-[gr-pressed]:hover:${rest}`])
    .join(' ')
}

function variantClassOf(variant: GrButtonVariant, tone: GrButtonTone): string {
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
      solidImageClass,
      solidShadowClass(tokens),
    ].join(' ')
  }

  if (variant === 'secondary') {
    return [
      `bg-${withVar(tokens.softBackground)}`,
      `text-${withVar(tokens.softForeground)}`,
      `border border-${withVar(tokens.borderSoft)}`,
      `hover:bg-${withVar(tokens.softBackgroundHover)}`,
      `hover:border-${withVar(tokens.borderSoftHover)}`,
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
    return `${squareSizes[options.size]} ${stepRadius[options.size]}`

  return [
    sizeBase[options.size],
    stepRadius[options.size],
    options.prefixCell ? 'ps-0' : options.prefix ? paddingStartAdorned[options.size] : paddingStart[options.size],
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
    options.pressed && !options.disabled ? pressedClass(options.variant, options.tone) : '',
    options.disabled || options.loading ? '' : pressClass,
  ].filter(Boolean).join(' ')
}
