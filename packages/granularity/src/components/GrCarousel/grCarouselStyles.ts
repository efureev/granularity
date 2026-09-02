import type { GrTone } from '../shared/tones'

/**
 * Вид переключателя слайдов. `none` меняет не только внешность, но и роль самих
 * слайдов: без переключателя `tabpanel` не к чему привязать — см. `GrCarousel.vue`.
 */
export const GR_CAROUSEL_INDICATORS = ['dots', 'thumbnails', 'none'] as const
export type GrCarouselIndicators = typeof GR_CAROUSEL_INDICATORS[number]

/**
 * Тон текущего переключателя. Своей шкалы компонент не заводит: она одна на
 * пакет, и хук `--gr-carousel-dot-active` перебивает её точечно.
 */
const dotToneVars: Record<GrTone, string> = {
  primary: 'var(--gr-carousel-dot-active,var(--gr-primary))',
  neutral: 'var(--gr-carousel-dot-active,var(--gr-secondary))',
  success: 'var(--gr-carousel-dot-active,var(--gr-success))',
  warning: 'var(--gr-carousel-dot-active,var(--gr-warning))',
  danger: 'var(--gr-carousel-dot-active,var(--gr-danger))',
  info: 'var(--gr-carousel-dot-active,var(--gr-info))',
  slate: 'var(--gr-carousel-dot-active,var(--gr-slate))',
  azure: 'var(--gr-carousel-dot-active,var(--gr-azure))',
}

export function grCarouselDotActiveClass(tone: GrTone): string {
  return `bg-[${dotToneVars[tone]}]`
}

export function grCarouselThumbActiveClass(tone: GrTone): string {
  return `border-[${dotToneVars[tone]}]`
}

/** `automatic` — стрелка по индикаторам сразу листает; `manual` — только двигает фокус. */
export const GR_CAROUSEL_ACTIVATION_MODES = ['automatic', 'manual'] as const
export type GrCarouselActivationMode = typeof GR_CAROUSEL_ACTIVATION_MODES[number]

export const carouselRootBase = 'relative w-full'

export const carouselViewportBase = 'relative w-full overflow-hidden'

/**
 * Вертикальная прокрутка страницы остаётся браузеру, горизонталь забирает лента.
 * `select-none` — против выделения текста слайда протяжкой.
 */
export const carouselViewportSwipeClass = '[touch-action:pan-y] select-none'

export const carouselTrackBase = 'flex w-full will-change-transform transition-transform duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

export const carouselSlideBase = 'w-full min-w-0 shrink-0 grow-0 basis-full'

/**
 * Стрелки лежат поверх произвольного содержимого, поэтому несут собственную
 * подложку: на светлом кадре иконка без неё пропадает. `z-10` — порядок внутри
 * собственного stacking-контекста компонента, а не слой страницы.
 */
export const carouselControlBase = 'absolute top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[var(--gr-radius-full)] border border-[var(--gr-brd)] bg-[var(--gr-carousel-control-bg,var(--gr-bg))] text-[var(--gr-carousel-control-fg,var(--gr-fg))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const carouselControlPositions = {
  prev: 'start-2',
  next: 'end-2',
} as const

/**
 * Стрелка на краю без `loop` гасится фоном, а не `opacity`: прозрачность
 * разбавляет выверенные на AA токены текста и роняет контраст.
 */
export const carouselControlStates = {
  idle: 'hover:bg-[var(--gr-carousel-control-bg-hover,var(--gr-muted))]',
  disabled: 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-disabled-fg)]',
} as const

/** Тумблер автопрокрутки: тот же хром, что у стрелок, но в углу ленты. */
export const carouselToggleClass = 'absolute end-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[var(--gr-radius-full)] border border-[var(--gr-brd)] bg-[var(--gr-carousel-control-bg,var(--gr-bg))] text-[var(--gr-carousel-control-fg,var(--gr-fg))] transition-colors hover:bg-[var(--gr-carousel-control-bg-hover,var(--gr-muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const carouselIconClass = 'h-4 w-4 shrink-0'

/**
 * Полоса переключателей прокручивается, а не переносится: перенос увёл бы
 * миниатюры под соседний блок. Своей остановки `Tab` у неё нет — её дети
 * фокусируемы, и вторая остановка была бы лишней (приём `GrTabs`).
 */
export const carouselIndicatorsBase = 'flex max-w-full items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export const carouselIndicatorsVariants = {
  dots: 'justify-center gap-[var(--gr-carousel-gap,0.5rem)] pt-3',
  thumbnails: 'gap-[var(--gr-carousel-gap,0.5rem)] pt-3',
  none: '',
} as const

export const carouselIndicatorBase = 'shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const carouselDotBase = 'rounded-[var(--gr-radius-full)] h-[var(--gr-carousel-dot-size,0.5rem)] w-[var(--gr-carousel-dot-size,0.5rem)]'

export const carouselDotStates = {
  idle: 'bg-[var(--gr-carousel-dot,var(--gr-brd))] hover:bg-[var(--gr-muted-fg)]',
} as const

export const carouselThumbBase = 'overflow-hidden rounded-[var(--gr-radius-md)] border-2 w-[var(--gr-carousel-thumb-width,4rem)] h-[var(--gr-carousel-thumb-height,2.5rem)]'

export const carouselThumbStates = {
  idle: 'border-[var(--gr-brd)] hover:border-[var(--gr-muted-fg)]',
} as const

export const carouselThumbImageClass = 'h-full w-full object-cover'

/** Миниатюры не дали — плитка держит ритм полосы номером слайда. */
export const carouselThumbFallbackClass = 'flex h-full w-full items-center justify-center bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]'

export function grCarouselControlClass(direction: 'prev' | 'next', disabled: boolean): string {
  return [
    carouselControlBase,
    carouselControlPositions[direction],
    disabled ? carouselControlStates.disabled : carouselControlStates.idle,
  ].join(' ')
}

export function grCarouselIndicatorsClass(variant: GrCarouselIndicators): string {
  return [carouselIndicatorsBase, carouselIndicatorsVariants[variant]].filter(Boolean).join(' ')
}

export function grCarouselIndicatorClass(
  variant: GrCarouselIndicators,
  active: boolean,
  tone: GrTone = 'primary',
): string {
  if (variant === 'thumbnails') {
    return [
      carouselIndicatorBase,
      carouselThumbBase,
      active ? grCarouselThumbActiveClass(tone) : carouselThumbStates.idle,
    ].join(' ')
  }

  return [
    carouselIndicatorBase,
    carouselDotBase,
    active ? grCarouselDotActiveClass(tone) : carouselDotStates.idle,
  ].join(' ')
}
