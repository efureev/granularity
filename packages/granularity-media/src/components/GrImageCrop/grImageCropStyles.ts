import { splitClassTokens } from '../../internal/classTokens'

export type GrImageCropSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrImageCropShape = 'rect' | 'circle'

export const rootClass = 'grid gap-2'

/**
 * Окно кадра. `touch-none` не косметика: без него браузер уводит вертикальный
 * drag в прокрутку страницы, и картинка тянется только по горизонтали.
 */
export const viewportClass = 'relative w-full select-none overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const imageClass = 'pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center'

/**
 * Затемнение вне круга — тенью наружу, а не вторым слоем с вырезом: вырез
 * потребовал бы маски, а `mask-image` в presetMini не выражается и уехал бы в
 * собственный CSS-файл ради одного правила.
 *
 * Граница круга обязательна и не декоративна: на тёмной теме затемнение чёрным
 * поверх почти чёрного фона не читается вовсе, и пользователь не видит, что
 * попадёт в кадр. Линия работает в обеих темах.
 */
export const circleMaskClass = 'pointer-events-none absolute inset-0 m-auto aspect-square rounded-[var(--gr-radius-full)] border border-[var(--gr-image-crop-guide,var(--gr-brd))] shadow-[0_0_0_9999px_var(--gr-image-crop-mask,rgb(0_0_0/0.55))]'

export const rectGuideClass = 'pointer-events-none absolute inset-0 border border-[var(--gr-image-crop-guide,var(--gr-brd))]'

/**
 * Плавность включается только вне жеста: под пальцем картинка обязана идти
 * след в след, а вот шаг слайдера и клавиши без перехода выглядят рывком.
 */
export const imageTransitionClass = 'transition-transform duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]'

export const controlsClass = 'flex items-center gap-3'

export const emptyClass = 'flex items-center justify-center text-[var(--gr-muted-fg)]'

/** Кегль подписи и подсказки: контрольная шкала, парой с межстрочным. */
export const sizeTextClass = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrImageCropSize, string>

/** Минимальная высота пустого состояния — по той же шкале, что кегль. */
export const sizeEmptyClass = {
  xs: 'min-h-32',
  sm: 'min-h-40',
  md: 'min-h-48',
  lg: 'min-h-56',
} as const satisfies Record<GrImageCropSize, string>

export const grImageCropSafelist = [
  ...splitClassTokens(rootClass),
  ...splitClassTokens(viewportClass),
  ...splitClassTokens(imageClass),
  ...splitClassTokens(imageTransitionClass),
  ...splitClassTokens(circleMaskClass),
  ...splitClassTokens(rectGuideClass),
  ...splitClassTokens(controlsClass),
  ...splitClassTokens(emptyClass),
  ...Object.values(sizeTextClass).flatMap(splitClassTokens),
  ...Object.values(sizeEmptyClass).flatMap(splitClassTokens),
]
