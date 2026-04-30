export type GrDrawerSide = 'left' | 'right'
export type GrDrawerSize = 'sm' | 'md' | 'lg' | 'full'

export const panelWidthBySize: Record<GrDrawerSize, string> = {
  sm: 'w-[360px] max-w-[90vw]',
  md: 'w-[420px] max-w-[92vw]',
  lg: 'w-[560px] max-w-[94vw]',
  full: 'w-[100vw]',
}

export const panelSideClass: Record<GrDrawerSide, string> = {
  left: 'left-0 border-r',
  right: 'right-0 border-l',
}

export const panelTransitionClass: Record<GrDrawerSide, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
}

export function grDrawerPanelClass(options: { side: GrDrawerSide, size: GrDrawerSize }): string {
  return [
    panelSideClass[options.side],
    panelWidthBySize[options.size],
    'border-[var(--brd)]',
    'bg-[var(--card)] text-[var(--card-fg)]',
    'shadow-[var(--ds-shadow-2)] outline-none',
  ].join(' ')
}

export function grDrawerPanelEnterFrom(side: GrDrawerSide): string {
  return panelTransitionClass[side]
}
