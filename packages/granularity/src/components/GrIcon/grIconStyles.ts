import { splitClassTokens } from '../shared/classTokens'
import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

export type GrIconSize = GrComponentSize

/** Цвет иконки: тон палитры либо наследование от родителя. */
export type GrIconTone = GrTone | 'current'

/**
 * Шкала размеров — токенами, а не числами: иконка обязана масштабироваться
 * вместе с темой, а не вместе с пересборкой пакета. Произвольный размер
 * задаётся числом прямо на компоненте, это escape-hatch мимо шкалы.
 */
export const iconSizeVarBySize: Record<GrIconSize, string> = {
  xs: 'var(--gr-icon-size-xs)',
  sm: 'var(--gr-icon-size-sm)',
  md: 'var(--gr-icon-size-md)',
  lg: 'var(--gr-icon-size-lg)',
}

/**
 * Тон → токен **текста**, а не насыщенный тон: правило пакета запрещает
 * насыщенный цвет как цвет текста (контраст на `-light`-подложках падает до
 * 2:1). Отображение повторяет `GrAlert/grAlertStyles.ts`: у `primary` и
 * `neutral` пары `-text` нет, поэтому берутся ближайшие семантические роли.
 */
export const iconToneClass: Record<GrTone, string> = {
  primary: 'text-[var(--gr-primary)]',
  neutral: 'text-[var(--gr-muted-fg)]',
  success: 'text-[var(--gr-success-text)]',
  warning: 'text-[var(--gr-warning-text)]',
  danger: 'text-[var(--gr-danger-text)]',
  info: 'text-[var(--gr-info-text)]',
  slate: 'text-[var(--gr-slate-text)]',
  azure: 'text-[var(--gr-azure-text)]',
}

/** `gr-icon` — не утилита, а зацепка для глобального стиля компонента. */
export const iconHookClass = 'gr-icon'
export const iconUtilityClass = 'inline-flex items-center justify-center align-middle'
export const iconBaseClass = `${iconHookClass} ${iconUtilityClass}`
export const iconSpinClass = 'animate-spin'

export function grIconToneClass(tone: GrIconTone): string {
  return tone === 'current' ? '' : iconToneClass[tone]
}

// В safelist идут только утилиты: `gr-icon` CSS не порождает — он лишь селектор
// собственного стиля компонента, и гейт `documentedConfig` справедливо считает
// такую запись мёртвой.
export const grIconClassTokens = [
  ...splitClassTokens(iconUtilityClass),
  ...splitClassTokens(iconSpinClass),
  ...Object.values(iconToneClass).flatMap(splitClassTokens),
]
