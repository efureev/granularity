import type { GrComponentSize } from '../shared/sizes'

/**
 * Классы `GrFilePreview`.
 *
 * Ступени размера перечислены целиком, по литералу на ветку: UnoCSS сканирует
 * исходный текст файла, и собранное шаблонной строкой имя уехало бы в CSS
 * литералом.
 */

/** Соотношение сторон плитки. */
export type GrFilePreviewRatio = '1:1' | '4:3' | '16:9'

/** `relative` — точка отсчёта для картинки, ждущей загрузки вне потока. */
export const filePreviewRootClass = 'relative inline-flex overflow-hidden rounded-[var(--gr-file-preview-radius,var(--gr-radius-md))] bg-[var(--gr-file-preview-bg,var(--gr-muted))]'

/** Интерактивная плитка получает курсор и кольцо фокуса — как любой контрол. */
export const filePreviewInteractiveClass = 'cursor-pointer transition-colors duration-[var(--gr-duration-fast)] hover:bg-[var(--gr-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Ширина плитки по канонической шкале: высоту задаёт соотношение сторон.
 * Своего кортежа размеров компонент не заводит — иначе `GrConfigProvider`
 * перестал бы до него доставать (гейт `sizeScale.test.ts`).
 */
export const filePreviewTileWidths: Record<GrComponentSize, string> = {
  xs: 'w-12',
  sm: 'w-16',
  md: 'w-24',
  lg: 'w-32',
}

/**
 * Соотношение сторон держит место до загрузки: без него ряд плиток прыгает,
 * когда картинки доезжают вразнобой.
 */
export const filePreviewRatioClass: Record<GrFilePreviewRatio, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-[16/9]',
}

export const filePreviewMediaClass = 'h-full w-full object-cover'

/**
 * Картинка на время загрузки: `visibility`, а не `display`, — иначе браузер
 * отменил бы саму загрузку. Вне потока, чтобы скелет занял плитку целиком, а
 * не поделил её с картинкой как второй flex-элемент.
 */
export const filePreviewMediaLoadingClass = 'invisible absolute'

/** Заглушка: иконка по центру, подпись под ней. */
export const filePreviewFallbackClass = 'h-full w-full flex flex-col items-center justify-center gap-1 p-1 text-center text-[var(--gr-file-preview-icon,var(--gr-muted-fg))]'

export const filePreviewIconClass = 'block h-6 w-6 shrink-0'

/** Подпись под иконкой: имя файла в одну строку. */
export const filePreviewLabelClass = 'w-full truncate text-[length:var(--gr-control-text-3xs)] leading-[var(--gr-leading-xs)]'
