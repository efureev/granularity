import { splitClassTokens } from '../shared/classTokens'

const panelWidthBySize = {
  sm: 'w-[360px] max-w-[90vw]',
  md: 'w-[420px] max-w-[92vw]',
  lg: 'w-[560px] max-w-[94vw]',
  full: 'w-[100vw]',
} as const

const panelSideClass = {
  left: 'left-0 border-r',
  right: 'right-0 border-l',
} as const

const panelTransitionClass = {
  left: '-translate-x-full',
  right: 'translate-x-full',
} as const

export function dsDrawerPanelClass(options: { side: keyof typeof panelSideClass, size: keyof typeof panelWidthBySize }): string {
  return [
    panelSideClass[options.side],
    panelWidthBySize[options.size],
    'border-[var(--brd)]',
    'bg-[var(--card)] text-[var(--card-fg)]',
    'shadow-[var(--ds-shadow-2)] outline-none',
  ].join(' ')
}

export function dsDrawerPanelEnterFrom(side: keyof typeof panelTransitionClass): string {
  return panelTransitionClass[side]
}

export const dsDrawerSafelist = [...new Set([
  ...Object.values(panelSideClass).flatMap(splitClassTokens),
  ...Object.values(panelWidthBySize).flatMap(splitClassTokens),
  ...Object.values(panelTransitionClass).flatMap(splitClassTokens),
  ...splitClassTokens('border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] outline-none'),
])]