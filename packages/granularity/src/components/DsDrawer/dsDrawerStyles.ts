export type DsDrawerSide = 'left' | 'right'
export type DsDrawerSize = 'sm' | 'md' | 'lg' | 'full'

export const panelWidthBySize: Record<DsDrawerSize, string> = {
  sm: 'w-[360px] max-w-[90vw]',
  md: 'w-[420px] max-w-[92vw]',
  lg: 'w-[560px] max-w-[94vw]',
  full: 'w-[100vw]',
}

export const panelSideClass: Record<DsDrawerSide, string> = {
  left: 'left-0 border-r',
  right: 'right-0 border-l',
}

export const panelTransitionClass: Record<DsDrawerSide, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
}

export function dsDrawerPanelClass(options: { side: DsDrawerSide, size: DsDrawerSize }): string {
  return [
    panelSideClass[options.side],
    panelWidthBySize[options.size],
    'border-[var(--brd)]',
    'bg-[var(--card)] text-[var(--card-fg)]',
    'shadow-[var(--ds-shadow-2)] outline-none',
  ].join(' ')
}

export function dsDrawerPanelEnterFrom(side: DsDrawerSide): string {
  return panelTransitionClass[side]
}
