export type GrSliderSize = 'sm' | 'md' | 'lg'
/** Значение: число (single) или кортеж `[lo, hi]` (range при `range=true`). */
export type GrSliderModelValue = number | [number, number]
/** Метка деления: словарь `value → label` или просто массив значений (label = значение). */
export type GrSliderMarks = Record<number, string> | number[]

// Высота дорожки (rail/fill) по размеру.
export const sliderTrackHeightBySize: Record<GrSliderSize, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

// Размер «бегунка» (thumb) по размеру.
export const sliderThumbSizeBySize: Record<GrSliderSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

// Вертикальный отступ обёртки, чтобы thumb не обрезался краями дорожки.
export const sliderPaddingBySize: Record<GrSliderSize, string> = {
  sm: 'py-1.5',
  md: 'py-2',
  lg: 'py-2.5',
}

export const sliderRailClass = 'absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--muted)_45%,transparent)]'
export const sliderFillClass = 'absolute top-0 bottom-0 rounded-full bg-[var(--primary)]'

export const sliderThumbBaseClass = 'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--primary)] bg-[var(--bg)] shadow-[var(--gr-shadow-1)] transition-[box-shadow,transform] duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]'

export function sliderThumbClass(options: { size: GrSliderSize, disabled: boolean }): string {
  return [
    sliderThumbBaseClass,
    sliderThumbSizeBySize[options.size],
    options.disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110',
  ].join(' ')
}

export const sliderTooltipClass = 'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[var(--fg)] px-1.5 py-0.5 text-[11px] font-medium leading-tight text-[var(--bg)] shadow-[var(--gr-shadow-2)]'

export const sliderMarkTickClass = 'absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bg)] ring-1 ring-[var(--brd)]'
export const sliderMarkLabelClass = 'absolute top-full mt-1.5 -translate-x-1/2 text-[11px] leading-none text-[var(--muted-fg)]'

export function sliderRootClass(options: { size: GrSliderSize, disabled: boolean }): string {
  return [
    'relative w-full select-none',
    sliderPaddingBySize[options.size],
    options.disabled ? 'opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ')
}
