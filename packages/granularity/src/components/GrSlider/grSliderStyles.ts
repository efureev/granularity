import type { GrComponentSize } from '../shared/sizes'

export type GrSliderSize = GrComponentSize
/** Значение: число (single) или кортеж `[lo, hi]` (range при `range=true`). */
export type GrSliderModelValue = number | [number, number]
/** Метка деления: словарь `value → label` или просто массив значений (label = значение). */
export type GrSliderMarks = Record<number, string> | number[]

/** Ориентация дорожки. В вертикальной минимум внизу — как на регуляторе громкости. */
export const GR_SLIDER_ORIENTATIONS = ['horizontal', 'vertical'] as const
export type GrSliderOrientation = typeof GR_SLIDER_ORIENTATIONS[number]

/**
 * Кастомизация через CSS-переменные (можно задать на самом слайдере или любом
 * предке — inline `style`, класс, тема). Значение по умолчанию — второй аргумент
 * `var(--<имя>, default)`, поэтому переопределять можно точечно:
 *
 * - `--gr-slider-rail`         — цвет фона дорожки (неактивная часть).
 * - `--gr-slider-fill`         — цвет активной (заполненной) части.
 * - `--gr-slider-thumb-bg`     — заливка бегунка.
 * - `--gr-slider-thumb-border` — цвет окантовки бегунка (по умолчанию = fill).
 * - `--gr-slider-thumb-size`   — диаметр бегунка (по умолчанию — из `size`).
 * - `--gr-slider-track-height` — толщина дорожки (по умолчанию — из `size`).
 * - `--gr-slider-length`       — длина вертикальной дорожки (по умолчанию `10rem`).
 */

// Высота дорожки (rail/fill) по размеру — дефолт для `--gr-slider-track-height`.
export const sliderTrackHeightBySize: Record<GrSliderSize, string> = {
  xs: 'h-[var(--gr-slider-track-height,0.1875rem)]',
  sm: 'h-[var(--gr-slider-track-height,0.25rem)]',
  md: 'h-[var(--gr-slider-track-height,0.375rem)]',
  lg: 'h-[var(--gr-slider-track-height,0.5rem)]',
}

/** В вертикали та же толщина задаёт ширину, а длину берёт `--gr-slider-length`. */
export const sliderTrackWidthBySize: Record<GrSliderSize, string> = {
  xs: 'w-[var(--gr-slider-track-height,0.1875rem)]',
  sm: 'w-[var(--gr-slider-track-height,0.25rem)]',
  md: 'w-[var(--gr-slider-track-height,0.375rem)]',
  lg: 'w-[var(--gr-slider-track-height,0.5rem)]',
}

export const sliderTrackVerticalLengthClass = 'h-[var(--gr-slider-length,10rem)]'

// Размер «бегунка» (thumb) по размеру — дефолт для `--gr-slider-thumb-size`.
export const sliderThumbSizeBySize: Record<GrSliderSize, string> = {
  xs: 'h-[var(--gr-slider-thumb-size,0.75rem)] w-[var(--gr-slider-thumb-size,0.75rem)]',
  sm: 'h-[var(--gr-slider-thumb-size,0.875rem)] w-[var(--gr-slider-thumb-size,0.875rem)]',
  md: 'h-[var(--gr-slider-thumb-size,1rem)] w-[var(--gr-slider-thumb-size,1rem)]',
  lg: 'h-[var(--gr-slider-thumb-size,1.25rem)] w-[var(--gr-slider-thumb-size,1.25rem)]',
}

// Вертикальный отступ обёртки, чтобы thumb не обрезался краями дорожки.
export const sliderPaddingBySize: Record<GrSliderSize, string> = {
  xs: 'py-1',
  sm: 'py-1.5',
  md: 'py-2',
  lg: 'py-2.5',
}

/**
 * Дорожка — `--gr-brd`, а не полупрозрачный `--gr-muted`.
 *
 * Прежний дефолт (`color-mix(--gr-muted 45%, transparent)`) на светлой теме
 * давал #f1f5f9 при 45 % поверх почти такой же поверхности: непройденная часть
 * шкалы не читалась вовсе, и слайдер выглядел точкой на пустом месте — по нему
 * нельзя было понять ни диапазон, ни положение внутри него.
 */
export const sliderRailClass = 'absolute inset-0 rounded-[var(--gr-radius-full)] bg-[var(--gr-slider-rail,var(--gr-brd))]'

export const sliderFillBaseClass = 'absolute rounded-[var(--gr-radius-full)]'

/** Заливка растёт вдоль дорожки: по горизонтали — влево-вправо, по вертикали — снизу вверх. */
export const sliderFillOrientationClass: Record<GrSliderOrientation, string> = {
  horizontal: 'top-0 bottom-0',
  vertical: 'left-0 right-0',
}

/**
 * Недоступный слайдер гасится токенами, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены и роняет контраст подписей меток.
 */
export const sliderFillDisabledClass = 'bg-[var(--gr-disabled-fg)]'
export const sliderFillEnabledClass = 'bg-[var(--gr-slider-fill,var(--gr-primary))]'
/**
 * Вердикт валидации — ролью ошибки, как рамка у полей ввода: раньше `invalid`
 * ставил только `aria-invalid`, и заливка оставалась цвета акцента.
 */
export const sliderFillInvalidClass = 'bg-[var(--gr-invalid-brd)]'

/** Состояние слайдера для оформления: недоступность сильнее ошибки. */
export type GrSliderTone = 'enabled' | 'invalid' | 'disabled'

export function sliderTone(options: { disabled: boolean, invalid: boolean }): GrSliderTone {
  if (options.disabled)
    return 'disabled'

  return options.invalid ? 'invalid' : 'enabled'
}

const sliderFillToneClass: Record<GrSliderTone, string> = {
  enabled: sliderFillEnabledClass,
  invalid: sliderFillInvalidClass,
  disabled: sliderFillDisabledClass,
}

export function sliderFillClass(tone: GrSliderTone | boolean): string {
  // Булев аргумент — прежняя сигнатура: `true` — недоступен.
  const resolved = typeof tone === 'boolean' ? (tone ? 'disabled' : 'enabled') : tone

  return [sliderFillBaseClass, sliderFillToneClass[resolved]].join(' ')
}

// Окантовка бегунка: цветной border (по умолчанию = fill) + тонкая контрастная
// обводка (`ring`), чтобы бегунок не сливался ни с фоном страницы, ни с заливкой.
/*
 * `inline-flex` с центрированием — ради слота `#thumb`: без него содержимое
 * ручки прижималось бы к её верхнему левому углу, и центрировать его пришлось
 * бы каждому потребителю. Пустой ручке объявление ничего не меняет: она
 * позиционирована абсолютно и имеет заданный размер.
 */
export const sliderThumbBaseClass = 'absolute inline-flex items-center justify-center overflow-visible rounded-[var(--gr-radius-full)] border-2 ring-1 ring-[color-mix(in_srgb,var(--gr-fg)_22%,transparent)] shadow-[var(--gr-shadow-1)] transition-[box-shadow,transform] duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--gr-bg)]'

/** Бегунок центрируется поперёк дорожки, а вдоль неё его ведёт inline-стиль. */
export const sliderThumbOrientationClass: Record<GrSliderOrientation, string> = {
  horizontal: 'top-1/2 -translate-x-1/2 -translate-y-1/2',
  vertical: 'left-1/2 -translate-x-1/2 translate-y-1/2',
}

/*
 * Цвет рамки, фона и кольца фокуса — только в классе состояния, не в базовом:
 * два `border-[…]` на одном узле решаются порядком утилит в листе, и
 * недоступный бегунок оставался с рамкой акцента.
 */
export const sliderThumbDisabledClass = 'cursor-not-allowed border-[var(--gr-disabled-fg)] bg-[var(--gr-disabled-bg)]'
export const sliderThumbEnabledClass = 'cursor-grab active:cursor-grabbing hover:scale-110 border-[var(--gr-slider-thumb-border,var(--gr-slider-fill,var(--gr-primary)))] bg-[var(--gr-slider-thumb-bg,var(--gr-bg))] focus-visible:ring-[var(--gr-ring)]'
export const sliderThumbInvalidClass = 'cursor-grab active:cursor-grabbing hover:scale-110 border-[var(--gr-invalid-brd)] bg-[var(--gr-slider-thumb-bg,var(--gr-bg))] focus-visible:ring-[var(--gr-invalid-ring)]'

const sliderThumbToneClass: Record<GrSliderTone, string> = {
  enabled: sliderThumbEnabledClass,
  invalid: sliderThumbInvalidClass,
  disabled: sliderThumbDisabledClass,
}

export function sliderThumbClass(options: {
  size: GrSliderSize
  disabled: boolean
  invalid?: boolean
  orientation?: GrSliderOrientation
}): string {
  return [
    sliderThumbBaseClass,
    sliderThumbOrientationClass[options.orientation ?? 'horizontal'],
    sliderThumbSizeBySize[options.size],
    sliderThumbToneClass[sliderTone({ disabled: options.disabled, invalid: options.invalid ?? false })],
  ].join(' ')
}

export const sliderTooltipBaseClass = 'pointer-events-none absolute whitespace-nowrap rounded-[var(--gr-radius-control)] px-1.5 py-0.5 text-[length:var(--gr-text-2xs)] font-medium leading-tight shadow-[var(--gr-shadow-2)]'

/** Недоступный слайдер гасит и подсказку: тёмная плашка над серым бегунком спорила бы с ним. */
export const sliderTooltipToneClass = {
  enabled: 'bg-[var(--gr-fg)] text-[var(--gr-bg)]',
  disabled: 'bg-[var(--gr-disabled-bg)] text-[var(--gr-disabled-fg)] ring-1 ring-[var(--gr-brd)]',
} as const

/** В вертикали подсказка уходит вбок: над бегунком она легла бы на дорожку. */
export const sliderTooltipOrientationClass: Record<GrSliderOrientation, string> = {
  horizontal: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  vertical: 'right-full top-1/2 mr-2 -translate-y-1/2',
}

export function sliderTooltipClass(orientation: GrSliderOrientation = 'horizontal', disabled = false): string {
  return [
    sliderTooltipBaseClass,
    sliderTooltipOrientationClass[orientation],
    sliderTooltipToneClass[disabled ? 'disabled' : 'enabled'],
  ].join(' ')
}

export const sliderMarkTickBaseClass = 'absolute h-1.5 w-1.5 rounded-[var(--gr-radius-full)] bg-[var(--gr-bg)] ring-1 ring-[var(--gr-brd)]'

export const sliderMarkTickOrientationClass: Record<GrSliderOrientation, string> = {
  horizontal: 'top-1/2 -translate-x-1/2 -translate-y-1/2',
  vertical: 'left-1/2 -translate-x-1/2 translate-y-1/2',
}

export function sliderMarkTickClass(orientation: GrSliderOrientation = 'horizontal'): string {
  return [sliderMarkTickBaseClass, sliderMarkTickOrientationClass[orientation]].join(' ')
}
// Подписи меток уводим под дорожку (`top-full` + отступ, ниже бегунка) и запрещаем
// перенос (`whitespace-nowrap`) — иначе крайняя подпись рвётся по буквам.
export const sliderMarkLabelClass = 'absolute whitespace-nowrap text-[length:var(--gr-text-2xs)] leading-none text-[var(--gr-muted-fg)]'

export const sliderMarkLabelDisabledClass = 'text-[var(--gr-disabled-fg)]'

/** Вертикальные подписи уходят вправо от дорожки: под ней им места нет. */
export const sliderMarkLabelVerticalClass = 'left-full ml-[var(--gr-slider-mark-offset)] translate-y-1/2'
export const sliderMarkLabelHorizontalClass = 'top-full mt-[var(--gr-slider-mark-offset)]'

/** Диаметр бегунка и толщина дорожки по умолчанию — те же, что в классах выше. */
const defaultThumbSize: Record<GrSliderSize, string> = { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.25rem' }
const defaultTrackSize: Record<GrSliderSize, string> = { xs: '0.1875rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem' }

/**
 * Отступ подписей меток от дорожки — от **бегунка**, а не на глаз.
 *
 * Отступ был постоянным (`0.625rem`), и крупный бегунок — `--gr-slider-thumb-size`
 * вместе со слотом `#thumb`, путь из документации для «совсем другой ручки», —
 * ложился на подписи: в значении 21 бегунок на 36px закрывал «21°». Теперь
 * отступ — выступ бегунка за дорожку плюс зазор, но не меньше прежнего: на
 * штатных размерах подписи стоят там же, где стояли.
 */
export function sliderMarkOffsetStyle(size: GrSliderSize): Record<string, string> {
  return {
    '--gr-slider-mark-offset': `max(0.625rem, calc((var(--gr-slider-thumb-size, ${defaultThumbSize[size]}) - var(--gr-slider-track-height, ${defaultTrackSize[size]})) / 2 + 0.25rem))`,
  }
}

// Выравнивание подписи по позиции: центр для внутренних меток, а крайние (0% и
// 100%) прижимаем внутрь, чтобы они не вылезали за края дорожки и не обрезались.
export function sliderMarkLabelClassFor(
  pct: number,
  options: { orientation?: GrSliderOrientation, disabled?: boolean } = {},
): string {
  const orientation = options.orientation ?? 'horizontal'
  const tone = options.disabled ? sliderMarkLabelDisabledClass : ''

  if (orientation === 'vertical')
    return [sliderMarkLabelClass, sliderMarkLabelVerticalClass, tone].filter(Boolean).join(' ')

  const align = pct <= 0.5 ? 'translate-x-0' : pct >= 99.5 ? '-translate-x-full' : '-translate-x-1/2'
  return [sliderMarkLabelClass, sliderMarkLabelHorizontalClass, align, tone].filter(Boolean).join(' ')
}

export const sliderRootBaseClass = 'relative select-none'

export const sliderRootOrientationClass: Record<GrSliderOrientation, string> = {
  horizontal: 'w-full',
  vertical: 'inline-flex',
}

/** Горизонтальный отступ обёртки вертикали — та же роль, что у `py-*` у горизонтали. */
export const sliderPaddingVerticalBySize: Record<GrSliderSize, string> = {
  xs: 'px-1',
  sm: 'px-1.5',
  md: 'px-2',
  lg: 'px-2.5',
}

export function sliderRootClass(options: {
  size: GrSliderSize
  disabled: boolean
  hasMarks?: boolean
  orientation?: GrSliderOrientation
}): string {
  const orientation = options.orientation ?? 'horizontal'
  const vertical = orientation === 'vertical'

  return [
    sliderRootBaseClass,
    sliderRootOrientationClass[orientation],
    vertical ? sliderPaddingVerticalBySize[options.size] : sliderPaddingBySize[options.size],
    // Резервируем место под подписи меток, чтобы они не наезжали на соседний
    // контент. Растёт вместе с отступом подписей: на штатных размерах это те же
    // `1.75rem` снизу и `2.5rem` справа.
    options.hasMarks
      ? (vertical ? 'mr-[calc(var(--gr-slider-mark-offset)+1.875rem)]' : 'mb-[calc(var(--gr-slider-mark-offset)+1.125rem)]')
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}
