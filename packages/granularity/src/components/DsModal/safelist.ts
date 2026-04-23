import { splitClassTokens } from '../shared/classTokens'
import {
  layout,
  overlay,
  overlayTransition,
  panelBase,
  panelHeightBySize,
  panelRadiusBySize,
  panelTransition,
  panelWidthBySize,
  root,
  shell,
} from './dsModalStyles'

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

function flattenTransition(stages: Record<string, string>): string[] {
  return Object.values(stages).flatMap(splitClassTokens)
}

export const dsModalClassTokens: DsModalClassTokens = {
  root: splitClassTokens(root),
  shell: splitClassTokens(shell),
  layout: splitClassTokens(layout),
  overlay: splitClassTokens(overlay),
  overlayTransition: flattenTransition(overlayTransition),
  panelBase: splitClassTokens(panelBase),
  panelTransition: flattenTransition(panelTransition),
  panelWidth: Object.values(panelWidthBySize).flatMap(splitClassTokens),
  panelRadius: Object.values(panelRadiusBySize).flatMap(splitClassTokens),
  panelHeight: Object.values(panelHeightBySize).flatMap(v => splitClassTokens(v ?? '')),
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
