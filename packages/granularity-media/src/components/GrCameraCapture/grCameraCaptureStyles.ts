import { splitClassTokens } from '../../internal/classTokens'

export type GrCameraCaptureSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrCameraFacing = 'user' | 'environment'

export const rootClass = 'grid gap-2'

export const frameClass = 'relative w-full overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)]'

/**
 * Превью **вписывается**, а не покрывает: кадр показывается целиком, в своих
 * пропорциях. При совпадающей рамке разницы нет, но между стартом и первым
 * кадром рамка ещё держит запасные 4:3 — и `cover` срезал бы картинку.
 */
export const videoClass = 'h-full w-full object-contain'

export const mirroredClass = 'scale-x-[-1]'

/**
 * Подложка состояния поверх рамки. Появление плавное: отказ и ошибка приходят
 * асинхронно, и мгновенная подмена картинки текстом читается как сбой.
 */
export const stateLayerClass = 'absolute inset-0 grid place-content-center gap-3 p-4 text-center transition-opacity duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

export const stateTextClass = 'text-[var(--gr-muted-fg)]'

export const controlsClass = 'flex flex-wrap items-center gap-2'

export const sizeTextClass = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrCameraCaptureSize, string>

export const grCameraCaptureSafelist = [
  ...splitClassTokens(rootClass),
  ...splitClassTokens(frameClass),
  ...splitClassTokens(videoClass),
  ...splitClassTokens(mirroredClass),
  ...splitClassTokens(stateLayerClass),
  ...splitClassTokens(stateTextClass),
  ...splitClassTokens(controlsClass),
  ...Object.values(sizeTextClass).flatMap(splitClassTokens),
]
