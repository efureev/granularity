import { grBadgeSafelist } from '../GrBadge/safelist'
import { splitClassTokens } from '../shared/classTokens'

import {
  chipCloseButtonClass,
  chipCloseClass,
  chipDisabledClass,
  chipIconClass,
  chipIconSizeClassBySize,
  chipInteractiveClass,
  chipLabelClass,
  chipRootClass,
  chipSelectedClass,
  chipSizeClassBySize,
} from './grChipStyles'

/**
 * Тона и радиусы приходят из `grBadgeStyles.ts`, поэтому их safelist берётся
 * ссылкой, а не копией: копия разошлась бы с оригиналом молча. Ребро
 * `GrChip → GrBadge` объявлено в `config.ts` — без него пресет не подмешает
 * стили бейджа при гранулярной селекции, и чип придёт бесцветным.
 */
export const grChipSafelist = [...new Set([
  ...grBadgeSafelist,
  ...Object.values(chipSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(chipIconSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(chipRootClass),
  ...splitClassTokens(chipLabelClass),
  ...splitClassTokens(chipInteractiveClass),
  ...splitClassTokens(chipDisabledClass),
  ...splitClassTokens(chipSelectedClass),
  ...splitClassTokens(chipCloseClass),
  ...splitClassTokens(chipCloseButtonClass),
  ...splitClassTokens(chipIconClass),
  'h-full',
  'w-full',
])]
