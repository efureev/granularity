import { splitClassTokens } from '../shared/classTokens'

export type DsDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

type DsModalClassTokens = {
  root: readonly string[]
  shell: readonly string[]
  layout: readonly string[]
  overlay: readonly string[]
  overlayTransition: readonly string[]
  panelBase: readonly string[]
  panelTransition: readonly string[]
  panelWidth: readonly string[]
  panelRadius: readonly string[]
  panelHeight: readonly string[]
}

const root = 'fixed inset-0 z-50'
const shell = 'fixed inset-0 overflow-y-auto p-4 sm:p-6'
const layout = 'min-h-full flex items-center justify-center'
const overlay = 'fixed inset-0 z-0 bg-black/40'
const overlayTransition = 'duration-200 ease-out opacity-0 opacity-100 duration-150 ease-in'
const panelBase =
  'w-full overflow-hidden relative z-10 border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] outline-none'
const panelTransition =
  'duration-200 ease-out opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95 opacity-100 translate-y-0 sm:scale-100 duration-150 ease-in'

const panelWidthBySize: Record<DsDialogSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[920px]',
  full: 'max-w-none',
}

const panelRadiusBySize: Record<DsDialogSize, string> = {
  sm: 'rounded-[var(--ds-radius-xl)]',
  md: 'rounded-[var(--ds-radius-xl)]',
  lg: 'rounded-[var(--ds-radius-xl)]',
  xl: 'rounded-[var(--ds-radius-xl)]',
  full: 'rounded-none sm:rounded-[var(--ds-radius-xl)]',
}

const panelHeightBySize: Record<DsDialogSize, string> = {
  sm: '',
  md: '',
  lg: '',
  xl: '',
  full: 'h-[100svh] sm:h-auto',
}

export const dsModalClassTokens: DsModalClassTokens = {
  root: splitClassTokens(root),
  shell: splitClassTokens(shell),
  layout: splitClassTokens(layout),
  overlay: splitClassTokens(overlay),
  overlayTransition: splitClassTokens(overlayTransition),
  panelBase: splitClassTokens(panelBase),
  panelTransition: splitClassTokens(panelTransition),
  panelWidth: Object.values(panelWidthBySize).flatMap(splitClassTokens),
  panelRadius: Object.values(panelRadiusBySize).flatMap(splitClassTokens),
  panelHeight: Object.values(panelHeightBySize).flatMap(splitClassTokens),
}

export const dsModalSafelist = [...new Set([
  ...dsModalClassTokens.root,
  ...dsModalClassTokens.shell,
  ...dsModalClassTokens.layout,
  ...dsModalClassTokens.overlay,
  ...dsModalClassTokens.overlayTransition,
  ...dsModalClassTokens.panelBase,
  ...dsModalClassTokens.panelTransition,
  ...dsModalClassTokens.panelWidth,
  ...dsModalClassTokens.panelRadius,
  ...dsModalClassTokens.panelHeight,
])]

export function getDsModalPanelClass(size: DsDialogSize): string {
  return [
    ':uno:',
    panelBase,
    panelWidthBySize[size],
    panelHeightBySize[size],
    panelRadiusBySize[size],
  ].join(' ')
}