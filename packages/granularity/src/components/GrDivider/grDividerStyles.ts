import type { GrComponentSize } from '../shared/sizes'

export type GrDividerOrientation = 'horizontal' | 'vertical'
export type GrDividerAlign = 'start' | 'center' | 'end'
export type GrDividerVariant = 'solid' | 'dashed' | 'dotted'
/** Отступы вокруг разделителя. `none` — вплотную, как было до появления пропа. */
export type GrDividerSpacing = 'none' | GrComponentSize

/**
 * Линия рисуется бордюром, а не фоном: `dashed` и `dotted` фоном не выразить,
 * а два разных механизма на три варианта одного и того же — путь к расхождению.
 * Толщину задаёт `--gr-divider-thickness`, поэтому классы про неё не знают.
 */
export const lineVariantClass: Record<GrDividerVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}

export const horizontalLineClass
  = 'border-0 border-t-[length:var(--gr-divider-thickness,1px)] border-[var(--gr-brd)]'

export const verticalLineClass
  = 'border-0 border-l-[length:var(--gr-divider-thickness,1px)] border-[var(--gr-brd)]'

export const horizontalSpacingClass: Record<GrDividerSpacing, string> = {
  none: '',
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-3',
  lg: 'my-4',
}

export const verticalSpacingClass: Record<GrDividerSpacing, string> = {
  none: '',
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-3',
  lg: 'mx-4',
}

export const labelRootClass = 'flex w-full items-center gap-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

/** Отрезок линии рядом с подписью: тянется по остатку ширины. */
export const labelLineClass = 'flex-1'
