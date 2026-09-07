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

/**
 * Текущая точка: заливка **и** обвод вокруг неё.
 *
 * Одной заливки мало: при диаметре в 8 пикселей текущая точка отличалась от
 * соседних только оттенком, а на тон вроде `slate` разница почти пропадала. Обвод
 * добавляет второй признак — форму, — и работает там, где цвет не различают.
 *
 * `outline`, а не `ring`: он рисуется вне потока и не требует цвета подложки под
 * зазор, тогда как `ring-offset` пришлось бы красить в фон страницы, которого
 * компонент не знает.
 */
/**
 * Скобки приносит хелпер, а не литерал.
 *
 * Гейт safelist читает класс-литералы `.ts`-хелперов статически, и запись вида
 * `` `bg-[${color}]` `` он видит как класс, которого в safelist нет. Приём взят
 * у `GrProgressBar`: в литерале скобок не остаётся вовсе.
 */
function arbitrary(value: string): string {
  return `[${value}]`
}

/**
 * Текущая точка: заливка **и** обвод вокруг неё.
 *
 * Одной заливки мало: при диаметре в 8 пикселей текущая точка отличалась от
 * соседних только оттенком, а на приглушённом тоне разница почти пропадала.
 * Обвод добавляет второй признак — форму, — и работает там, где цвет не
 * различают.
 *
 * `outline`, а не `ring`: он рисуется вне потока и не требует цвета подложки под
 * зазор, тогда как `ring-offset` пришлось бы красить в фон страницы, которого
 * компонент не знает.
 */
export function grCarouselDotActiveClass(tone: GrTone): string {
  const color = dotToneVars[tone]

  return [
    `bg-${arbitrary(color)}`,
    arbitrary(`outline:var(--gr-carousel-dot-ring-width,2px)_solid_${color}`),
    arbitrary('outline-offset:var(--gr-carousel-dot-ring-offset,2px)'),
  ].join(' ')
}

export function grCarouselThumbActiveClass(tone: GrTone): string {
  return `border-${arbitrary(dotToneVars[tone])}`
}

/** `automatic` — стрелка по индикаторам сразу листает; `manual` — только двигает фокус. */
export const GR_CAROUSEL_ACTIVATION_MODES = ['automatic', 'manual'] as const
export type GrCarouselActivationMode = typeof GR_CAROUSEL_ACTIVATION_MODES[number]

export const carouselRootBase = 'relative w-full'

/**
 * Вертикальная лента: высоту задаёт потребитель **на корне**, а вьюпорт обязан
 * её получить.
 *
 * Иначе высота вьюпорта выводится из содержимого, процентная `flex-basis`
 * кадров упирается в неопределённый размер и вырождается в высоту содержимого —
 * кадры встают столбцом, а лента честно считает шаг от суммы. Отсюда колонка на
 * корне и `flex-1 min-h-0` на вьюпорте: полоса переключателей остаётся под ним,
 * а вьюпорт забирает остаток.
 */
export const carouselRootAxis: Record<GrCarouselOrientation, string> = {
  horizontal: '',
  vertical: 'flex flex-col',
}

export const carouselViewportAxis: Record<GrCarouselOrientation, string> = {
  horizontal: '',
  vertical: 'min-h-0 flex-1',
}

export const carouselViewportBase = 'relative w-full overflow-hidden'

/**
 * Вертикальная прокрутка страницы остаётся браузеру, горизонталь забирает лента.
 * `select-none` — против выделения текста слайда протяжкой.
 */
export const carouselViewportSwipeClass = 'select-none'

export const carouselTrackBase = 'flex will-change-transform transition-transform duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

export const GR_CAROUSEL_ORIENTATIONS = ['horizontal', 'vertical'] as const
export type GrCarouselOrientation = typeof GR_CAROUSEL_ORIENTATIONS[number]

export const carouselSlideBase = 'shrink-0 grow-0 basis-full'

/**
 * Кадр занимает вьюпорт целиком по оси движения. Поперёк оси он не ограничен:
 * там размер задаёт содержимое, как и раньше.
 */
export const carouselSlideAxis: Record<GrCarouselOrientation, string> = {
  horizontal: 'w-full min-w-0',
  vertical: 'h-full min-h-0',
}

/**
 * Направление ленты. По вертикали ей нужна **определённая высота вьюпорта**:
 * `translateY(-100%)` считается от высоты самой ленты, а она у колонки равна
 * сумме кадров, если вьюпорт высоту не задал.
 */
export const carouselTrackAxis: Record<GrCarouselOrientation, string> = {
  horizontal: 'w-full',
  vertical: 'h-full flex-col',
}

/** Жест по оси движения перехватывается лентой, поперёк — отдаётся странице. */
export const carouselViewportTouchAction: Record<GrCarouselOrientation, string> = {
  horizontal: '[touch-action:pan-y]',
  vertical: '[touch-action:pan-x]',
}

/**
 * Стрелки стоят по оси движения. По горизонтали позиции логические
 * (`start`/`end`) — они зеркалятся под RTL; по вертикали направление письма ни
 * при чём, поэтому там физические `top`/`bottom`.
 */
export const carouselControlAxis: Record<GrCarouselOrientation, string> = {
  horizontal: 'top-1/2 -translate-y-1/2',
  vertical: 'left-1/2 -translate-x-1/2',
}

/**
 * Стрелки лежат поверх произвольного содержимого, поэтому несут собственную
 * подложку: на светлом кадре иконка без неё пропадает. `z-10` — порядок внутри
 * собственного stacking-контекста компонента, а не слой страницы.
 */
export const carouselControlBase = 'absolute z-10 inline-flex h-9 w-9 items-center justify-center rounded-[var(--gr-radius-full)] border border-[var(--gr-brd)] bg-[var(--gr-carousel-control-bg,var(--gr-bg))] text-[var(--gr-carousel-control-fg,var(--gr-fg))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const carouselControlPositions: Record<GrCarouselOrientation, Record<'prev' | 'next', string>> = {
  horizontal: {
    prev: 'start-2',
    next: 'end-2',
  },
  vertical: {
    prev: 'top-2',
    next: 'bottom-2',
  },
}

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
  // Поля по вертикали не украшение: полоса — скроллер, а `overflow-x: auto`
  // по спецификации обрезает и по вертикали, и обвод текущей точки срезался бы.
  dots: 'justify-center gap-[var(--gr-carousel-gap,0.5rem)] px-1 pt-3.5 pb-1.5',
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

export function grCarouselControlClass(
  direction: 'prev' | 'next',
  disabled: boolean,
  orientation: GrCarouselOrientation = 'horizontal',
): string {
  return [
    carouselControlBase,
    carouselControlAxis[orientation],
    carouselControlPositions[orientation][direction],
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
