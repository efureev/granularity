import { GR_TONES, type GrTone } from '../shared/tones'

/**
 * Архитектура цвета GrLink (согласована с остальной GR, ср. GrButton):
 *
 * - `tone` — семантический ЦВЕТ из общей палитры `GrTone`
 *   (`primary | neutral | success | warning | danger | info | slate | azure`).
 * - `variant` — уровень акцента (СТРУКТУРА), независимый от цвета:
 *   - `default` — текст окрашен в `tone` в покое, `tone-hover`/`tone-active` при
 *     наведении/нажатии (обычная акцентная ссылка);
 *   - `muted` — приглушённый текст (`--muted-fg`) в покое, окрашивается в `tone`
 *     при наведении (вторичные/inline-ссылки в плотных областях).
 *
 * Раньше `variant` смешивал цвет и акцент (`primary/default/muted/muted-primary/danger`).
 * Теперь это ортогональные оси: `tone` × `variant`.
 */
export type GrLinkTone = GrTone
export type GrLinkVariant = 'default' | 'muted'
export type GrLinkUnderline = 'auto' | 'always' | 'none'
export type GrLinkSize = 'sm' | 'md' | 'lg'

// Базовые классы корневого элемента (`<a>`/`<span>`). Вынесены сюда,
// чтобы быть единственным источником истины как для шаблона, так и для safelist.
export const baseRootClass = 'inline-flex items-center gap-1 rounded-[6px] transition-colors duration-150'
export const focusRingClass = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'

export const sizeClassBySize: Record<GrLinkSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

// Цвет управляется CSS-переменными (как трек в GrSwitch): один набор классов
// вместо class-эксплозии 8 тонов × 3 состояния. Safelist остаётся крошечным.
export const colorClass = 'text-[var(--gr-link-color)] visited:text-[var(--gr-link-color)] hover:text-[var(--gr-link-color-hover)] active:text-[var(--gr-link-color-active)]'

type GrLinkToneColors = { base: string, hover: string, active: string }

// Пары «цвет / hover / active» на каждый тон из ролей темы.
export const linkToneColors: Record<GrLinkTone, GrLinkToneColors> = {
  primary: { base: 'var(--primary)', hover: 'var(--primary-hover)', active: 'var(--primary-active)' },
  // Нейтральная ссылка: читаемый `--fg` в покое, акцент `--primary` при наведении.
  neutral: { base: 'var(--fg)', hover: 'var(--primary)', active: 'var(--primary-active)' },
  success: { base: 'var(--gr-success)', hover: 'var(--gr-success-hover)', active: 'var(--gr-success-active)' },
  warning: { base: 'var(--gr-warning)', hover: 'var(--gr-warning-hover)', active: 'var(--gr-warning-active)' },
  danger: { base: 'var(--gr-danger)', hover: 'var(--gr-danger-hover)', active: 'var(--gr-danger-active)' },
  info: { base: 'var(--gr-info)', hover: 'var(--gr-info-hover)', active: 'var(--gr-info-active)' },
  slate: { base: 'var(--gr-slate)', hover: 'var(--gr-slate-hover)', active: 'var(--gr-slate-active)' },
  azure: { base: 'var(--gr-azure)', hover: 'var(--gr-azure-hover)', active: 'var(--gr-azure-active)' },
}

/** Инлайновые CSS-переменные цвета для текущей комбинации `tone` × `variant`. */
export function grLinkColorStyle(options: { tone: GrLinkTone, variant: GrLinkVariant, disabled: boolean }): Record<string, string> {
  if (options.disabled) return {}

  const colors = linkToneColors[options.tone] ?? linkToneColors.primary

  if (options.variant === 'muted') {
    return {
      '--gr-link-color': 'var(--muted-fg)',
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

export const disabledStateClass = 'cursor-not-allowed opacity-60 text-[var(--muted-fg)]'

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

// Реэкспорт палитры тонов для потребителей/демо.
export { GR_TONES }
