import { splitClassTokens } from '../shared/classTokens'
import {
  statisticAffixSizeBySize,
  statisticTitleClass,
  statisticTitleSizeBySize,
  statisticTrendClassByTrend,
  statisticTrendIconByTrend,
  statisticTrendSizeBySize,
  statisticValueClassByTone,
  statisticValueSizeBySize,
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
  ...Object.values(statisticTrendIconByTrend).flatMap(splitClassTokens),
  // Литералы из grStatisticStyles.ts (подпись + типографика значения).
  ...splitClassTokens(statisticTitleClass),
  ...splitClassTokens('font-semibold [font-variant-numeric:tabular-nums]'),
])]
