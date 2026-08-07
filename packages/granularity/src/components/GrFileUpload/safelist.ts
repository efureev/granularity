import { splitClassTokens } from '../shared/classTokens'
import {
  hintSizes,
  iconTileSizes,
  labelSizes,
  progressTextSizes,
  zoneBaseClass,
  zoneDisabledClass,
  zoneGaps,
  zoneIdleClass,
  zoneOverClass,
  zonePaddings,
  zoneReadonlyClass,
} from './grFileUploadStyles'

export const grFileUploadSafelist = [...new Set([
  ...Object.values(zonePaddings).flatMap(splitClassTokens),
  ...Object.values(iconTileSizes).flatMap(splitClassTokens),
  ...Object.values(labelSizes).flatMap(splitClassTokens),
  ...Object.values(hintSizes).flatMap(splitClassTokens),
  ...Object.values(progressTextSizes).flatMap(splitClassTokens),
  ...Object.values(zoneGaps).flatMap(splitClassTokens),
  ...splitClassTokens(zoneBaseClass),
  ...splitClassTokens(zoneDisabledClass),
  ...splitClassTokens(zoneReadonlyClass),
  ...splitClassTokens(zoneIdleClass),
  ...splitClassTokens(zoneOverClass),
])]
