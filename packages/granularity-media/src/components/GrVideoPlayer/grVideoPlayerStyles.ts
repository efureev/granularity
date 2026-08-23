import { splitClassTokens } from '../../internal/classTokens'

export type GrVideoPlayerSize = 'xs' | 'sm' | 'md' | 'lg'

export const rootClass = 'relative w-full overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-black focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const videoClass = 'h-full w-full bg-black object-contain'

/**
 * Панель управления поверх кадра, а не под ним: снизу у видео обычно тёмная
 * часть картинки, и подложка панели читается на ней без отдельной плашки.
 * Градиент — чтобы подписи не пропадали на светлом кадре.
 */
export const controlsClass = 'absolute inset-x-0 bottom-0 grid gap-2 bg-[linear-gradient(to_top,rgb(0_0_0/0.72),transparent)] px-3 pb-2 pt-6'

export const rowClass = 'flex items-center gap-2'

/** Кнопки плеера рисуются на кадре: белым, потому что под ними видео. */
export const buttonClass = 'inline-flex items-center justify-center rounded-[var(--gr-radius-sm)] p-1 text-white transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50'

/**
 * Моноширинные цифры обязательны: без них время скачет на каждой смене
 * секунды. Утилиты нет в `presetMini`, она приезжает из
 * `@feugene/unocss-mini-extra-rules`, который подмешивает `presetGranular`.
 */
export const timeClass = 'tabular-nums text-white'

export const trackClass = 'relative h-1 w-full cursor-pointer rounded-[var(--gr-radius-full)] bg-white/30'

export const bufferedClass = 'absolute inset-y-0 left-0 rounded-[var(--gr-radius-full)] bg-white/30'

export const playedClass = 'absolute inset-y-0 left-0 rounded-[var(--gr-radius-full)] bg-[var(--gr-video-player-progress,var(--gr-primary))]'

export const stateLayerClass = 'absolute inset-0 grid place-content-center gap-2 p-4 text-center text-white'

export const sizeTextClass = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrVideoPlayerSize, string>

export const grVideoPlayerSafelist = [
  ...splitClassTokens(rootClass),
  ...splitClassTokens(videoClass),
  ...splitClassTokens(controlsClass),
  ...splitClassTokens(rowClass),
  ...splitClassTokens(buttonClass),
  ...splitClassTokens(timeClass),
  ...splitClassTokens(trackClass),
  ...splitClassTokens(bufferedClass),
  ...splitClassTokens(playedClass),
  ...splitClassTokens(stateLayerClass),
  ...Object.values(sizeTextClass).flatMap(splitClassTokens),
]
