import { splitClassTokens } from '../shared/classTokens'
import {
  statisticAffixSizeBySize,
  statisticRootBase,
  statisticRootInteractiveClass,
  statisticTitleClass,
  statisticTitleSizeBySize,
  statisticTrendClassByTrend,
  statisticTrendSizeBySize,
  statisticValueClassByTone,
  statisticValueSizeBySize,
  statisticValueTypographyClass,
} from './grStatisticStyles'

// Классы из вычисляемых мап (size/tone/trend) UnoCSS сканом не находит — только safelist.
export const grStatisticSafelist = [...new Set([
  ...Object.values(statisticTitleSizeBySize).flatMap(splitClassTokens),
  ...Object.values(statisticValueSizeBySize).flatMap(splitClassTokens),
  ...Object.values(statisticAffixSizeBySize).flatMap(splitClassTokens),
  ...Object.values(statisticTrendSizeBySize).flatMap(splitClassTokens),
  ...Object.values(statisticValueClassByTone).flatMap(splitClassTokens),
  ...Object.values(statisticTrendClassByTrend).flatMap(splitClassTokens),
  // Иконки динамики приходят из мапы — как классы-маски их тоже надо сгенерировать.
  // Литералы из grStatisticStyles.ts (корень, подпись, типографика значения).
  ...splitClassTokens(statisticRootBase),
  ...splitClassTokens(statisticRootInteractiveClass),
  ...splitClassTokens(statisticTitleClass),
  ...splitClassTokens(statisticValueTypographyClass),
])]
