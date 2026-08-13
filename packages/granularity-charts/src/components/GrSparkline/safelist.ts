import { splitClassTokens } from '../../internal/classTokens'

import { sparklineCanvasClass, sparklineRootClass } from './grSparklineStyles'

/**
 * Класс корня живёт в `.ts`-хелпере, а значит уезжает в общий `dist/chunks/`,
 * куда скан пресета не заглядывает. Без safelist высота спарклайна схлопнется
 * в ноль — сборка при этом останется зелёной.
 *
 * Рамы у спарклайна нет, поэтому `chartFrameSafelist` сюда не подмешивается.
 */
export const grSparklineSafelist: string[] = [...new Set([
  ...splitClassTokens(sparklineRootClass),
  ...splitClassTokens(sparklineCanvasClass),
])]
