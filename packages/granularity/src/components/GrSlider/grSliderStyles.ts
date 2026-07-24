export type GrSliderSize = 'sm' | 'md' | 'lg'
/** Значение: число (single) или кортеж `[lo, hi]` (range при `range=true`). */
export type GrSliderModelValue = number | [number, number]
/** Метка деления: словарь `value → label` или просто массив значений (label = значение). */
export type GrSliderMarks = Record<number, string> | number[]

/**
 * Кастомизация через CSS-переменные (можно задать на самом слайдере или любом
 * предке — inline `style`, класс, тема). Значение по умолчанию — второй аргумент
 * `var(--name, default)`, поэтому переопределять можно точечно:
 *
 * - `--gr-slider-rail`         — цвет фона дорожки (неактивная часть).
 * - `--gr-slider-fill`         — цвет активной (заполненной) части.
 * - `--gr-slider-thumb-bg`     — заливка бегунка.
 * - `--gr-slider-thumb-border` — цвет окантовки бегунка (по умолчанию = fill).
 * - `--gr-slider-thumb-size`   — диаметр бегунка (по умолчанию — из `size`).
 * - `--gr-slider-track-height` — толщина дорожки (по умолчанию — из `size`).
 */

// Высота дорожки (rail/fill) по размеру — дефолт для `--gr-slider-track-height`.
export const sliderTrackHeightBySize: Record<GrSliderSize, string> = {
  sm: 'h-[var(--gr-slider-track-height,0.25rem)]',
  md: 'h-[var(--gr-slider-track-height,0.375rem)]',
  lg: 'h-[var(--gr-slider-track-height,0.5rem)]',
}

// Размер «бегунка» (thumb) по размеру — дефолт для `--gr-slider-thumb-size`.
export const sliderThumbSizeBySize: Record<GrSliderSize, string> = {
  sm: 'h-[var(--gr-slider-thumb-size,0.875rem)] w-[var(--gr-slider-thumb-size,0.875rem)]',
  md: 'h-[var(--gr-slider-thumb-size,1rem)] w-[var(--gr-slider-thumb-size,1rem)]',
  lg: 'h-[var(--gr-slider-thumb-size,1.25rem)] w-[var(--gr-slider-thumb-size,1.25rem)]',
}

// Вертикальный отступ обёртки, чтобы thumb не обрезался краями дорожки.
export const sliderPaddingBySize: Record<GrSliderSize, string> = {
  sm: 'py-1.5',
  md: 'py-2',
  lg: 'py-2.5',
}

export const sliderRailClass = 'absolute inset-0 rounded-full bg-[var(--gr-slider-rail,color-mix(in_srgb,var(--gr-muted)_45%,transparent))]'
export const sliderFillClass = 'absolute top-0 bottom-0 rounded-full bg-[var(--gr-slider-fill,var(--gr-primary))]'

// Окантовка бегунка: цветной border (по умолчанию = fill) + тонкая контрастная
// обводка (`ring`), чтобы бегунок не сливался ни с фоном страницы, ни с заливкой.
export const sliderThumbBaseClass = 'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--gr-slider-thumb-border,var(--gr-slider-fill,var(--gr-primary)))] bg-[var(--gr-slider-thumb-bg,var(--gr-bg))] ring-1 ring-[color-mix(in_srgb,var(--gr-fg)_22%,transparent)] shadow-[var(--gr-shadow-1)] transition-[box-shadow,transform] duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--gr-bg)]'

export function sliderThumbClass(options: { size: GrSliderSize, disabled: boolean }): string {
  return [
    sliderThumbBaseClass,
    sliderThumbSizeBySize[options.size],
    options.disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110',
  ].join(' ')
}

export const sliderTooltipClass = 'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[var(--gr-fg)] px-1.5 py-0.5 text-[11px] font-medium leading-tight text-[var(--gr-bg)] shadow-[var(--gr-shadow-2)]'

export const sliderMarkTickClass = 'absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gr-bg)] ring-1 ring-[var(--gr-brd)]'
// Подписи меток уводим под дорожку (`top-full` + отступ, ниже бегунка) и запрещаем
// перенос (`whitespace-nowrap`) — иначе крайняя подпись рвётся по буквам.
export const sliderMarkLabelClass = 'absolute top-full mt-2.5 whitespace-nowrap text-[11px] leading-none text-[var(--gr-muted-fg)]'

// Выравнивание подписи по позиции: центр для внутренних меток, а крайние (0% и
// 100%) прижимаем внутрь, чтобы они не вылезали за края дорожки и не обрезались.
export function sliderMarkLabelClassFor(pct: number): string {
  const align = pct <= 0.5 ? 'translate-x-0' : pct >= 99.5 ? '-translate-x-full' : '-translate-x-1/2'
  return `${sliderMarkLabelClass} ${align}`
}

export function sliderRootClass(options: { size: GrSliderSize, disabled: boolean, hasMarks?: boolean }): string {
  return [
    'relative w-full select-none',
    sliderPaddingBySize[options.size],
    // Резервируем место под подписи меток, чтобы они не наезжали на соседний контент.
    options.hasMarks ? 'mb-7' : '',
    options.disabled ? 'opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ')
}
