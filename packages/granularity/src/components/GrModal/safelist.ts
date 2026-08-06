import { splitClassTokens } from '../shared/classTokens'
import {
  layoutByScroll,
  overlay,
  overlayTransition,
  panelBase,
  panelBodyScrollClass,
  panelHeightBySize,
  panelOverflowByScroll,
  panelRadiusBySize,
  panelTransition,
  panelWidthBySize,
  root,
  shellBase,
  shellByScroll,
} from './grModalStyles'

type GrModalClassTokens = {
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

function flattenTransition(stages: Record<string, string>): string[] {
  return Object.values(stages).flatMap(splitClassTokens)
}

export const grModalClassTokens: GrModalClassTokens = {
  root: splitClassTokens(root),
  shell: [...splitClassTokens(shellBase), ...Object.values(shellByScroll).flatMap(splitClassTokens)],
  layout: Object.values(layoutByScroll).flatMap(splitClassTokens),
  overlay: splitClassTokens(overlay),
  overlayTransition: flattenTransition(overlayTransition),
  panelBase: [
    ...splitClassTokens(panelBase),
    ...Object.values(panelOverflowByScroll).flatMap(splitClassTokens),
    ...splitClassTokens(panelBodyScrollClass),
  ],
  panelTransition: flattenTransition(panelTransition),
  panelWidth: Object.values(panelWidthBySize).flatMap(splitClassTokens),
  panelRadius: Object.values(panelRadiusBySize).flatMap(splitClassTokens),
  panelHeight: Object.values(panelHeightBySize).flatMap(v => splitClassTokens(v ?? '')),
}

export const grModalSafelist = [...new Set([
  ...grModalClassTokens.root,
  ...grModalClassTokens.shell,
  ...grModalClassTokens.layout,
  ...grModalClassTokens.overlay,
  ...grModalClassTokens.overlayTransition,
  ...grModalClassTokens.panelBase,
  ...grModalClassTokens.panelTransition,
  ...grModalClassTokens.panelWidth,
  ...grModalClassTokens.panelRadius,
  ...grModalClassTokens.panelHeight,
])]
