import { splitClassTokens } from '../../internal/classTokens'

export type GrCodeScannerSize = 'xs' | 'sm' | 'md' | 'lg'

export const rootClass = 'grid gap-2'

export const frameClass = 'relative w-full overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)]'

export const videoClass = 'h-full w-full object-contain'

/**
 * Прицел: показывает, куда наводить. Рамка, а не затемнение вокруг, — код
 * распознаётся по всему кадру, и затемнение обещало бы обратное.
 */
export const reticleClass = 'pointer-events-none absolute inset-[15%] rounded-[var(--gr-radius-md)] border-2 border-[var(--gr-code-scanner-reticle,var(--gr-primary))]'

export const stateLayerClass = 'absolute inset-0 grid place-content-center gap-3 p-4 text-center transition-opacity duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

export const stateTextClass = 'text-[var(--gr-muted-fg)]'

export const controlsClass = 'flex flex-wrap items-center gap-2'

export const sizeTextClass = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrCodeScannerSize, string>

export const grCodeScannerSafelist = [
  ...splitClassTokens(rootClass),
  ...splitClassTokens(frameClass),
  ...splitClassTokens(videoClass),
  ...splitClassTokens(reticleClass),
  ...splitClassTokens(stateLayerClass),
  ...splitClassTokens(stateTextClass),
  ...splitClassTokens(controlsClass),
  ...Object.values(sizeTextClass).flatMap(splitClassTokens),
]
